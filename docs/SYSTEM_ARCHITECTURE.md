# SYSTEM_ARCHITECTURE.md
## Autoprime Tata PDI Management Platform — System Architecture

**Version:** 1.0.0
**Status:** Authoritative Draft
**Date:** 2026-08-25
**Owner:** Dhoot Group — Platform Engineering
**Related Documents:** DATABASE_SPEC.md · API_SPEC.md · DECISIONS.md · ASSUMPTIONS.md

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Guiding Principles](#2-guiding-principles)
3. [Primary Data Flow](#3-primary-data-flow)
4. [Component Responsibilities](#4-component-responsibilities)
5. [Monorepo Package Dependency Graph](#5-monorepo-package-dependency-graph)
6. [Security Boundaries](#6-security-boundaries)
7. [Client Credential Policy](#7-client-credential-policy)
8. [Scalability Notes](#8-scalability-notes)
9. [Single Points of Failure and Mitigations](#9-single-points-of-failure-and-mitigations)
10. [Local-First Architecture for Mobile](#10-local-first-architecture-for-mobile)
11. [Integration Adapter Pattern](#11-integration-adapter-pattern)
12. [Feature Flag System](#12-feature-flag-system)
13. [Assumptions](#13-assumptions)

---

## 1. Architecture Overview

The Autoprime Tata PDI Management Platform is a multi-tenant, edge-native SaaS system purpose-built for Dhoot Group's Tata vehicle Pre-Delivery Inspection (PDI) workflow. It serves technicians, QA managers, stockyard supervisors, branch administrators, and zone-level executives across multiple geographic locations.

The platform is built on a **serverless, edge-first stack** that eliminates persistent server management, places compute close to end users, and enforces strong multi-tenant isolation through Supabase Row-Level Security (RLS) combined with Cloudflare Worker-level authorization middleware.

The system exposes a unified REST API served by **Cloudflare Workers** and consumed by:

- A **Progressive Web App (PWA)** targeting technicians and QA staff on desktops and mid-range Android devices.
- A **native-capable mobile shell** (PWA with local SQLite sync) for offline-capable PDI execution on the shop floor.
- An **administrative web portal** for branch managers, zone heads, and platform administrators.

All client applications are **stateless consumers** of the API. No privileged credentials are stored on client devices.

---

## 2. Guiding Principles

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Edge-Native** | API compute runs at Cloudflare's global edge network. Latency is reduced for geographically distributed dealerships without operating regional servers. |
| 2 | **Security by Default** | All data access is controlled at the database layer via PostgreSQL RLS. The API layer adds a second enforcement boundary. Defense-in-depth is not optional. |
| 3 | **Multi-Tenant Isolation** | Every row in every table is scoped to an organization. Cross-tenant data leakage is prevented by RLS policies, not solely by application logic. |
| 4 | **Offline Resilience** | The mobile PWA must support core PDI execution workflows even when network connectivity is intermittent. A SQLite sync queue bridges offline state to the server. |
| 5 | **Auditability** | Every state-changing operation is recorded in `audit_logs`. Audit records are immutable once written. |
| 6 | **Explicit over Implicit** | All database schema changes are explicit SQL migration files. No ORM auto-migrations are permitted in production. |
| 7 | **Fail Closed** | When authorization is ambiguous, deny access. No permissive defaults. |
| 8 | **Cost Efficiency** | Cloudflare Workers and Pages operate on a consumption model. Cloudflare R2 eliminates egress fees for media delivery. Supabase scales on a predictable tier model. |
| 9 | **Observability First** | Structured logs (JSON) and distributed traces are emitted by all Workers. No silent failures. |
| 10 | **Incremental Delivery** | Feature flags gate new functionality in production. Incomplete features are never exposed to end users without explicit enablement. |

---

## 3. Primary Data Flow

### 3.1 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                     │
│                                                                         │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐   │
│   │  Web Portal  │   │   PWA Shell  │   │  Mobile PWA (Offline)    │   │
│   │  (Browser)   │   │  (Browser)   │   │  SQLite Local Cache      │   │
│   └──────┬───────┘   └──────┬───────┘   └────────────┬─────────────┘   │
└──────────┼─────────────────-┼───────────────────────-┼─────────────────┘
           │  HTTPS           │  HTTPS                  │  HTTPS (when online)
           ▼                  ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE EDGE                                    │
│                                                                         │
│   ┌────────────────────────┐    ┌────────────────────────────────────┐  │
│   │   Cloudflare Pages     │    │   Cloudflare Workers (API)         │  │
│   │   Static asset host    │    │   /api/v1/* route handler          │  │
│   │   Edge cache (CDN)     │    │   Auth validation middleware        │  │
│   │   PWA service worker   │    │   Business logic execution         │  │
│   │   delivery             │    │   R2 presign generation            │  │
│   └────────────────────────┘    └────────────┬───────────────────────┘  │
└────────────────────────────────────────────--┼──────────────────────────┘
                                               │
              ┌────────────────────────────────┼──────────────────────────────┐
              │                                │                              │
              ▼                                ▼                              ▼
┌─────────────────────┐          ┌─────────────────────┐     ┌───────────────────────┐
│   Supabase Auth     │          │  Supabase PostgreSQL │     │   Cloudflare R2       │
│   JWT issuance      │          │  RLS-enforced tables │     │   Object storage      │
│   Session refresh   │          │  Migrations          │     │   Private buckets     │
│   Token validation  │          │  Realtime (optional) │     │   Presigned URLs      │
└─────────────────────┘          └─────────────────────┘     └───────────────────────┘
                                          │
              ┌───────────────────────────┼──────────────────────────────┐
              │                           │                              │
              ▼                           ▼                              ▼
┌─────────────────────┐    ┌──────────────────────────┐   ┌─────────────────────────┐
│  Notification       │    │  External Integrations   │   │  Audit & Observability  │
│  Provider           │    │  (DMS / OEM APIs)        │   │  (Structured Logs)      │
│  (Email/SMS/Push)   │    │  Integration Adapter     │   │  Cloudflare Analytics   │
└─────────────────────┘    └──────────────────────────┘   └─────────────────────────┘
```

### 3.2 Synchronous Request Lifecycle

1. **Client** sends an HTTPS request with a `Bearer` JWT in the `Authorization` header.
2. **Cloudflare Edge** terminates TLS. If the path matches `/api/v1/*`, the request is routed to the **API Worker**.
3. **API Worker** validates the JWT signature and expiry by verifying against the Supabase Auth JWKS endpoint (cached in Worker memory per cold-start). Expired tokens are rejected with `AUTH_EXPIRED`.
4. **API Worker** extracts the authenticated user identity (`sub`, `role`, `branch_id`, `org_id`) from JWT claims.
5. **API Worker** applies route-level **role authorization** checks before invoking any database query.
6. **API Worker** issues parameterized queries to **Supabase PostgreSQL** using the service role key (server-side only). PostgreSQL RLS policies provide a secondary enforcement layer.
7. For media operations, the Worker generates a **time-limited presigned URL** to Cloudflare R2. The client interacts with R2 directly using the presigned URL. The Worker never proxies binary payloads.
8. For notification-triggering operations, the Worker enqueues a notification task. Delivery is handled asynchronously by a **notification dispatch Worker**.
9. The Worker returns a standardised JSON response envelope and records the operation in `audit_logs`.

### 3.3 Offline Sync Flow (Mobile)

1. The mobile PWA writes pending operations to a local **SQLite sync queue**.
2. On connectivity restoration, the sync agent reads the queue in FIFO order and replays operations to the API.
3. Conflict resolution follows a **server-wins** policy. Conflicts are flagged in the sync response for user review.
4. Successfully replayed items are marked `synced` in the local queue. Failed items are marked `error` with the server response code.

---

## 4. Component Responsibilities

### 4.1 Cloudflare Pages

| Responsibility | Detail |
|----------------|--------|
| Web application hosting | Serves the compiled static output of `apps/web` and `apps/admin` |
| Edge CDN caching | Static assets (JS, CSS, images) are cached at Cloudflare edge PoPs globally |
| PWA delivery | Serves the service worker manifest and offline shell for the mobile PWA |
| Preview deployments | Each pull request receives an isolated preview URL for QA sign-off |
| Custom domain & SSL | Managed via Cloudflare DNS and automatic TLS provisioning |

**What Cloudflare Pages does NOT do:**
- Execute server-side business logic
- Access Supabase or R2 directly
- Hold any secret credentials

---

### 4.2 Cloudflare Workers (API Layer)

| Responsibility | Detail |
|----------------|--------|
| HTTP request routing | Routes `/api/v1/*` to typed handler functions |
| JWT authentication | Validates Bearer tokens against Supabase JWKS; rejects invalid or expired tokens |
| Role-based authorization | Enforces RBAC rules before any DB interaction |
| Business logic execution | Implements PDI workflow state machine, checklist validation, finding rules |
| Database interaction | Executes parameterized SQL via the Supabase service key (server-side only) |
| R2 presigned URL generation | Creates short-lived (15 min default) upload/download URLs for media objects |
| Notification dispatch | Publishes notification events to the notification provider |
| Audit logging | Writes structured audit records to `audit_logs` for all mutating operations |
| Integration calls | Invokes external DMS / OEM API adapters |
| Feature flag evaluation | Reads `feature_flags` table to gate functionality per org/branch/user |
| Structured logging | Emits JSON logs to Cloudflare Logpush / Workers Logs |

**Worker execution constraints:**
- CPU time limit: 50 ms (standard) / 30 s (Unbound); long-running tasks use Durable Objects or queues.
- No persistent in-process state between requests (stateless by design).
- Secrets are stored in Cloudflare Worker Secrets, never in source code.

---

### 4.3 Supabase PostgreSQL

| Responsibility | Detail |
|----------------|--------|
| Authoritative relational data store | All platform entities: vehicles, users, PDI sessions, findings, etc. |
| Row-Level Security (RLS) | Every table has RLS enabled. Policies enforce org/branch/role scoping |
| SQL-first migrations | Schema changes are applied via versioned `.sql` migration files |
| UUID primary keys | All PKs use `gen_random_uuid()` |
| Soft deletes | Rows are never physically deleted; `deleted_at` timestamps are used |
| Full-text search | PostgreSQL `tsvector` / `tsquery` for vehicle and finding search |
| Realtime (optional) | Supabase Realtime may be used for dashboard live updates (feature-flagged) |

---

### 4.4 Supabase Auth

| Responsibility | Detail |
|----------------|--------|
| User identity provider | Issues JWT access tokens and refresh tokens on successful login |
| Session management | Manages refresh token rotation and session expiry |
| JWT claims | Access tokens carry `sub` (user UUID), `role`, `org_id`, `branch_id` custom claims |
| OAuth integration | Optionally supports SSO providers (configuration-dependent; see ASSUMPTIONS.md) |
| Password policies | Minimum complexity enforced by Supabase Auth configuration |

**Note:** The API Worker validates JWT signatures using the Supabase Auth JWKS public keys. The service role key is never sent to the client.

---

### 4.5 Cloudflare R2 (Object Storage)

| Responsibility | Detail |
|----------------|--------|
| Media object storage | Stores all binary assets: PDI photos, damage evidence, repair documentation, QA attachments |
| Private buckets | All R2 buckets are private. No public bucket access is permitted |
| Presigned URL delivery | Clients receive short-lived presigned URLs (default: 15 min) for direct upload/download |
| Zero egress cost | R2 does not charge egress fees, making it cost-efficient for high-volume media |
| Object naming convention | `{org_id}/{branch_id}/{entity_type}/{entity_id}/{filename}` |
| Lifecycle policies | Deleted entity media is flagged; physical deletion follows a configurable retention period |

---

## 5. Monorepo Package Dependency Graph

The platform is organized as a monorepo. The dependency rules are strict: no circular dependencies are permitted.

```
MONOREPO ROOT
├── apps/
│   ├── web/                  → depends on: @platform/ui, @platform/api-client, @platform/types, @platform/utils
│   ├── admin/                → depends on: @platform/ui, @platform/api-client, @platform/types, @platform/utils
│   ├── mobile/               → depends on: @platform/ui, @platform/api-client, @platform/types, @platform/utils, @platform/sync-engine
│   └── services/
│       └── api-worker/       → depends on: @platform/types, @platform/db-client, @platform/validators
│                               (INDEPENDENT — does NOT depend on @platform/ui or @platform/api-client)
└── packages/
    ├── @platform/ui           → depends on: @platform/types
    ├── @platform/api-client   → depends on: @platform/types
    ├── @platform/types        → NO internal dependencies (leaf package)
    ├── @platform/utils        → depends on: @platform/types
    ├── @platform/validators   → depends on: @platform/types
    ├── @platform/db-client    → depends on: @platform/types
    └── @platform/sync-engine  → depends on: @platform/types, @platform/api-client
```

**Dependency Rules:**

| Rule | Detail |
|------|--------|
| `apps/*` may depend on `packages/*` | Applications consume shared packages |
| `apps/services/api-worker` is isolated | The API Worker must NOT depend on UI packages or browser-oriented client libraries |
| `packages/*` may depend on other `packages/*` | Only leaf-ward; no upward or circular dependencies |
| `@platform/types` is a leaf | It must carry zero runtime dependencies |
| No `apps/*` may depend on another `apps/*` | Cross-application imports are prohibited |

---

## 6. Security Boundaries

```
══════════════════════════════════════════════════════════
  ZONE 0 — PUBLIC INTERNET
  (Untrusted. All traffic filtered by Cloudflare WAF)
══════════════════════════════════════════════════════════
           │
           │  HTTPS only. TLS 1.2+ enforced.
           │  Cloudflare WAF + DDoS protection active.
           ▼
══════════════════════════════════════════════════════════
  ZONE 1 — CLOUDFLARE EDGE (Trusted Entry Point)
  Cloudflare Pages: static asset delivery
  Cloudflare Workers: API routing + JWT validation
  No secrets exposed to clients in this zone.
══════════════════════════════════════════════════════════
           │
           │  Internal Cloudflare network.
           │  Service role key used (server-side only).
           │  Connections to Supabase: TLS enforced.
           │  Connections to R2: internal Cloudflare.
           ▼
══════════════════════════════════════════════════════════
  ZONE 2 — DATA PLANE (Restricted)
  Supabase PostgreSQL: RLS enforced on all tables
  Supabase Auth: JWT issuance only
  Cloudflare R2: private buckets, presigned access only
  External APIs: via authenticated adapter layer only
══════════════════════════════════════════════════════════
           │
           │  No direct client access permitted.
           │  All access mediated by Zone 1 Workers.
           ▼
══════════════════════════════════════════════════════════
  ZONE 3 — SECRETS VAULT
  Cloudflare Worker Secrets: DB credentials, R2 keys,
  notification API keys, integration credentials.
  Never logged. Never transmitted to Zone 0.
══════════════════════════════════════════════════════════
```

**Cross-Zone Rules:**
- Zone 0 → Zone 2 direct access: **Prohibited**
- Zone 1 → Zone 3 runtime access: **Permitted** (Worker Secrets binding only)
- Client (Zone 0) → R2 direct access: **Permitted only via presigned URL** (scoped, time-limited)
- Zone 2 → Zone 0 outbound calls: **Prohibited** (Supabase does not call client endpoints)

---

## 7. Client Credential Policy

Client applications (web browsers, mobile PWA) **MUST NOT** hold or receive any of the following:

| Prohibited Credential | Why |
|-----------------------|-----|
| Supabase Service Role Key | Bypasses RLS; grants unrestricted database access |
| Supabase Database Password | Direct DB connection from clients is prohibited |
| Cloudflare R2 Access Key ID / Secret | Grants unrestricted bucket access |
| Cloudflare API Token | Administrative platform access |
| Notification provider API keys | Allows unsanctioned message dispatch |
| External DMS / OEM API credentials | Integration credentials are server-side only |
| Any Worker Secret binding value | Secrets are bound to Workers, not transmitted |

Clients hold **only**:
- A short-lived JWT access token (issued by Supabase Auth, validated by the API Worker)
- A refresh token (stored in `httpOnly` cookie or secure storage, used only to obtain a new access token)
- Presigned R2 URLs (scoped to a specific object, time-limited, single-use-equivalent)

---

## 8. Scalability Notes

| Dimension | Approach |
|-----------|----------|
| API compute | Cloudflare Workers scale horizontally to zero; no manual capacity planning required |
| Database connections | Supabase provides connection pooling via PgBouncer; Workers use pooled connections |
| Media storage | R2 scales without capacity limits; no pre-provisioning required |
| Read scaling | Supabase read replicas may be introduced for reporting queries (see ASSUMPTIONS.md) |
| Notification throughput | Notification dispatch is decoupled from the API request lifecycle via a queue |
| Monorepo build | Turborepo caches are used to minimise CI build times as package count grows |
| Feature rollout | Feature flags allow gradual rollout to subsets of orgs/branches without code changes |

---

## 9. Single Points of Failure and Mitigations

| Component | SPOF Risk | Mitigation |
|-----------|-----------|------------|
| Supabase PostgreSQL | Primary database unavailability | Supabase provides automated backups and point-in-time recovery (PITR). Read replicas can offload reporting load. |
| Supabase Auth | Auth service unavailability | Access tokens have a configurable validity window (default: 1 hour). Short-term offline operations remain possible until tokens expire. |
| Cloudflare Workers | Worker runtime outage | Cloudflare's global network provides inherent redundancy across PoPs. No single-region dependency. |
| Cloudflare R2 | Object storage unavailability | Media upload/download degrades gracefully; PDI text data is unaffected. Presigned URLs already issued remain usable until expiry. |
| Notification Provider | Delivery outage | Notifications are non-blocking to the core PDI workflow. Failed deliveries are retried with exponential backoff. |
| External Integrations | DMS/OEM API unavailability | Integration failures are isolated via the adapter pattern. Core PDI workflow proceeds independently. |

---

## 10. Local-First Architecture for Mobile

The mobile PWA implements a **local-first** model to support PDI technicians in environments with unreliable network connectivity (workshop floors, indoor stockyards with poor signal).

### 10.1 Local Storage Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Local database | SQLite (via OPFS or IndexedDB fallback) | Stores active PDI session data, checklist templates, assigned vehicles |
| Sync queue | `sync_queue` table (local SQLite) | Ordered log of pending write operations |
| Asset cache | Service Worker Cache API | Caches PWA shell, checklist templates, and vehicle images |

### 10.2 Sync Protocol

```
ONLINE STATE:
  Client ──► API Worker ──► Supabase PostgreSQL
             (real-time, synchronous)

OFFLINE STATE:
  Client ──► Local SQLite (sync_queue)
             (operations queued with UUID, timestamp, payload, status)

RECONNECT:
  Sync Agent reads sync_queue WHERE status = 'pending' ORDER BY created_at ASC
  For each item:
    ├─ POST to API /api/v1/sync/replay
    ├─ On 200: mark item status = 'synced'
    ├─ On 409 (conflict): mark status = 'conflict', store server response
    └─ On 4xx (non-conflict): mark status = 'error', store error code
```

### 10.3 Conflict Resolution Policy

- **Server-wins** on all data conflicts. The server authoritative state is preserved.
- Conflicts are surfaced to the technician via a conflict resolution UI screen.
- Conflict records are stored in `sync_queue.conflict_detail` for audit purposes.
- QA-reviewed or certificate-issued PDI sessions cannot have conflicting writes replayed against them.

### 10.4 Data Scoped for Local Sync

Only operationally necessary data is synced locally. The following are explicitly excluded from local sync:
- Admin configuration tables
- Audit logs
- Notification preferences of other users
- Any data outside the authenticated user's assigned branch

---

## 11. Integration Adapter Pattern

External system integrations (Tata Motors DMS, OEM API, accounting systems) are isolated behind an **adapter interface**. This ensures that changes to external API contracts do not propagate into core platform code.

### 11.1 Adapter Interface Contract

```typescript
interface IntegrationAdapter {
  name: string;
  version: string;
  isHealthy(): Promise<boolean>;
  fetchVehicleData(vin: string): Promise<VehicleData | null>;
  pushPDIResult(sessionId: string, result: PDIResult): Promise<void>;
  mapExternalStatus(externalCode: string): InternalVehicleStatus;
}
```

### 11.2 Adapter Invocation Flow

```
API Worker
  └─ IntegrationService.call(adapterName, method, payload)
       ├─ Reads adapter config from feature_flags / system_settings
       ├─ Applies retry policy (3 attempts, exponential backoff)
       ├─ Records call in integration_events table
       ├─ On success: returns mapped response
       └─ On failure: returns null or throws IntegrationError (isolated)
```

### 11.3 Integration Failure Isolation

- Integration failures **never** block the core PDI workflow.
- Failed integration calls are recorded in `integration_events` with status `failed` and the error payload.
- A background retry Worker processes failed events on a configurable schedule.
- Operations teams are alerted via the notification system when the failure rate exceeds a configurable threshold.

---

## 12. Feature Flag System

Feature flags are stored in the `feature_flags` database table and evaluated at runtime by the API Worker and client applications.

### 12.1 Flag Scope Hierarchy

```
Global (platform-wide)
  └── Organization-level override
        └── Branch-level override
              └── User-level override
```

A more specific scope always takes precedence over a broader scope.

### 12.2 Flag Evaluation in the API Worker

```
Worker receives request
  └─ FeatureFlagService.evaluate(flagKey, context: { org_id, branch_id, user_id })
       ├─ Check: is there a user-level override? → return it
       ├─ Check: is there a branch-level override? → return it
       ├─ Check: is there an org-level override? → return it
       └─ Return: global default value
```

### 12.3 Flag Data Types

| Type | Example Use |
|------|-------------|
| Boolean | Enable/disable a feature module |
| String | Select an integration adapter variant |
| Number | Configure rate limit thresholds per org |
| JSON | Provide structured configuration to a feature |

### 12.4 Architectural Role

- Feature flags gate new API endpoints at the Worker routing layer.
- Feature flags gate UI screens in the PWA before rendering.
- Feature flags enable A/B testing of workflow variations across branches.
- Feature flags are **not** a substitute for RBAC. Access control is always enforced separately.

---

## 13. Assumptions

The following assumptions were made during the authoring of this document. They must be validated against business requirements and recorded in `ASSUMPTIONS.md`.

| ID | Assumption |
|----|------------|
| SA-01 | Cloudflare Workers (standard) CPU limits are sufficient for all synchronous API operations. Long-running tasks will use Cloudflare Queues or Durable Objects as needed. |
| SA-02 | Supabase connection pooling via PgBouncer is adequate for the projected concurrent user load without requiring a dedicated external pooler. |
| SA-03 | R2 presigned URL expiry of 15 minutes is an acceptable default. Business requirements may mandate a shorter window for sensitive damage evidence. |
| SA-04 | SSO / OAuth integration with an identity provider is optional for the initial release. Email/password authentication via Supabase Auth is the baseline. |
| SA-05 | Supabase Realtime is treated as an optional enhancement. The core platform functions correctly without it. |
| SA-06 | The conflict resolution policy (server-wins) is acceptable for the PDI workflow. Any deviation requires a formal business rule specification. |
| SA-07 | External DMS/OEM API specifications will be provided by the integration team prior to adapter implementation. |
| SA-08 | Read replicas for Supabase PostgreSQL are not required for the initial deployment. This will be revisited based on observed query load. |

---

*End of SYSTEM_ARCHITECTURE.md — Version 1.0.0*
*Document Owner: Dhoot Group Platform Engineering*
*Next Review: 2026-11-25*
