# ARCHITECTURE BASELINE
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

This document records the architecture as it stands at the end of Phase 0.
It is the reference point against which all changes are measured.

---

## 1. CONFIRMED ARCHITECTURE

### 1.1 Data Flow

```
[Web App]  [Mobile App]  [PWA]
     |           |          |
     +-----+-----+----------+
           |
           v
   [Cloudflare Edge CDN]
           |
           v
   [Cloudflare Worker API]  ← HTTPS only, CORS restricted
           |
     +-----+-----+------+-------------------+
     |     |     |      |                   |
     v     v     v      v                   v
[Supabase [Supabase [CF R2]  [Notification   [External
  Auth]    PostgreSQL]        Provider]      Integrations]
                                             (adapter pattern)
```

### 1.2 Client Architecture

**Web (React + Vite + Cloudflare Pages):**
- Static build deployed to Cloudflare Pages
- TanStack Query for data fetching + cache management
- React Router for navigation
- React Hook Form + Zod for forms
- Design tokens via CSS custom properties
- Role-aware navigation (visual only; backend enforced)

**Mobile (Expo + React Native):**
- Expo Router for navigation
- TanStack Query for network data
- Expo SQLite + Drizzle ORM for local data
- Offline sync queue (custom implementation)
- Expo SecureStore for session tokens
- Expo Local Authentication for biometrics
- Expo Notifications for push

**PWA:**
- Lighter offline shell
- Session-aware behavior
- No native camera/biometric capabilities (documented)

### 1.3 API Layer (Cloudflare Worker + Hono)

Hono chosen as routing framework:
- Lightweight, edge-native
- TypeScript-first
- Middleware support (auth, rate limit, logging)
- Zod schema validation integration

Request pipeline:
```
HTTP Request
    |
    v
Correlation ID generation
    |
    v
Rate limit check
    |
    v
JWT validation (Supabase JWKS)
    |
    v
Role extraction
    |
    v
Request schema validation (Zod)
    |
    v
Route handler
    |
    v
Repository layer (Supabase client with service role)
    |
    v
Response + audit log
    |
    v
Structured log
```

### 1.4 Database Layer (Supabase PostgreSQL)

- SQL-first migrations (Supabase CLI)
- UUID primary keys throughout
- Explicit FK constraints
- CHECK constraints for state machine enforcement
- Composite indexes for common query patterns
- RLS on every table with data
- Soft delete ONLY where business-justified (avoid as default)
- JSONB limited to flexible metadata fields

### 1.5 Storage Layer (Cloudflare R2)

- Private buckets (one per environment)
- No public access
- Presigned PUT URLs for upload (15-min TTL)
- Presigned GET URLs for download (60-min TTL)
- Server-generated object keys (client cannot influence)
- Metadata in PostgreSQL; binary in R2

### 1.6 Auth Layer (Supabase Auth)

- Employee ID + password primary auth
- Phone OTP for 2FA (configurable)
- JWT access tokens (15-min default)
- Refresh token rotation on use
- Device registration for mobile
- Biometric = local app unlock only (not backend auth)

---

## 2. PACKAGE DEPENDENCY GRAPH

```
apps/web
  ↓ depends on
  packages/ui
  packages/design-system
  packages/types
  packages/validation
  packages/api-client
  packages/auth
  packages/domain
  packages/config
  packages/utilities
  packages/telemetry

apps/mobile
  ↓ depends on
  packages/types
  packages/validation
  packages/domain
  packages/offline
  packages/config
  packages/utilities

services/api-worker
  ↓ depends on
  packages/types
  packages/validation
  packages/domain
  packages/config
  packages/telemetry

packages/api-client
  ↓ depends on
  packages/types
  packages/validation
  packages/auth

packages/domain
  ↓ depends on
  packages/types

packages/validation
  ↓ depends on
  packages/types
```

No circular dependencies allowed. This graph is the source of truth.

---

## 3. SECURITY BOUNDARY SUMMARY

| Boundary | What Crosses | What Does NOT Cross |
|----------|-------------|---------------------|
| Client → Edge | JWT access token, request body | Service role key, R2 credentials, DB password |
| Edge → Worker | Full request context | — |
| Worker → Supabase | Service role key (server-side only), parameterized SQL | Raw client JWTs (validated, not forwarded) |
| Worker → R2 | Presigned URL generation | Client upload body (direct upload) |
| Mobile app | JWT in SecureStore, local SQLite | Any server credentials |
| Web app | JWT (Supabase client manages) | Any server credentials |

---

## 4. KEY CONSTRAINTS

1. No credential of higher privilege than anon key may exist in client code
2. RLS is mandatory — no table exposed without RLS
3. All auth uses Supabase; no custom JWT cryptography
4. All schema changes via migration; no manual DDL
5. All presigned URLs are short-TTL; no permanent access links
6. No SELECT * in production queries
7. No unbounded pagination
8. No blocking synchronous certificate generation in API request cycle

---

## 5. KNOWN LIMITATIONS

- Cloudflare Workers have CPU time limits (~50ms default, up to 30s with Unbound); heavy operations (PDF generation, large aggregations) must be async
- Supabase free plan has connection limits; Pro plan required before production
- Expo OTA updates apply to JS only; native changes require full App Store submission
- PWA cannot access native camera with same quality as native mobile app (documented in OFFLINE_SYNC_SPEC.md)
- SQLite local data not encrypted at file-system level (see ASSUMPTIONS.md ASM-008)

---

*End of ARCHITECTURE_BASELINE.md*
