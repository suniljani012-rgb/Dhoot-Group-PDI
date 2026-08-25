# PROJECT CONSTITUTION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** AUTHORITATIVE
**Last Updated:** 2026-08-25
**Owner:** Principal Architect / Engineering Lead

---

## 1. PURPOSE

This document is the supreme governing specification for the Autoprime PDI Management Platform. It defines the inviolable principles, authority hierarchy, and non-negotiable rules that govern every engineering, design, security, and operational decision.

All contributors — human and AI — must read, understand, and comply with this constitution before producing any artifact.

---

## 2. MISSION STATEMENT

Build a production-grade, enterprise-quality Pre-Delivery Inspection (PDI) management platform for Autoprime Tata dealerships operated by Dhoot Group. The platform enables PDI engineers, workshop technicians, QA managers, branch managers, and head-office administrators to manage the complete vehicle inspection and delivery lifecycle — from vehicle receipt through PDI execution, damage reporting, repair management, QA approval, certificate generation, and final delivery.

The platform must be:
- Professional and operationally trustworthy
- Secure by design, not by assumption
- Performant under real dealership workloads
- Operable in weak-network / offline conditions
- Maintainable by a competent engineering team
- Auditable for compliance and operations

---

## 3. AUTHORITY HIERARCHY

| Priority | Document |
|----------|----------|
| 1 | PROJECT_CONSTITUTION.md (this file) |
| 2 | PRODUCT_REQUIREMENTS.md |
| 3 | BUSINESS_RULES.md |
| 4 | SECURITY_REQUIREMENTS.md |
| 5 | DATABASE_SPEC.md |
| 6 | API_SPEC.md |
| 7 | UI_UX_SPEC.md |
| 8 | PERFORMANCE_SPEC.md |
| 9 | DEPLOYMENT_SPEC.md |
| 10 | Existing source code |
| 11 | Existing tests |
| 12 | Existing database migrations |
| 13 | Official vendor documentation |
| 14 | External examples / third-party references |

---

## 4. INVIOLABLE RULES

### 4.1 Security
- Client applications MUST NOT hold privileged credentials (service-role keys, R2 secrets, database passwords, signing keys).
- All authorization decisions MUST be enforced at the database layer via RLS in addition to API-layer checks.
- JWTs MUST NOT be implemented with custom cryptographic verification code.
- Audit logs MUST be append-only for normal users.
- Biometric authentication MUST use platform-provided APIs; it MUST NOT be used as a substitute for backend authorization.
- Secrets MUST NOT appear in source code, Git history, frontend bundles, or mobile app packages.

### 4.2 Data Integrity
- Every vehicle state transition MUST be auditable and server-validated.
- No arbitrary vehicle status change is permitted from the client.
- Every schema change in production MUST go through a migration; no manual DDL on live databases.
- JSONB MUST NOT be used as a substitute for proper relational modeling.

### 4.3 Business Rules
- No business rules may be invented that are not supported by PRODUCT_REQUIREMENTS.md, BUSINESS_RULES.md, or verified project evidence.
- All assumptions MUST be recorded in ASSUMPTIONS.md.
- All architectural decisions MUST be recorded in DECISIONS.md.

### 4.4 Engineering Quality
- TypeScript strict mode MUST be enabled in all packages.
- No uncontrolled `any` types in production code.
- Every API endpoint MUST define: method, auth requirement, role, request schema, response schema, error schema, rate limit, idempotency, audit behavior.
- No screen may be implemented with only the happy path.

### 4.5 Claims
- No engineering artifact may claim "unhackable", "zero latency", "0.01 ms guaranteed", "100% uptime", or "bug-free."
- Performance claims MUST be backed by measurement.

### 4.6 Scope Control
- When a change is requested, ONLY the requested scope may be modified.
- Unrelated refactoring MUST NOT accompany a scoped change unless separately requested.

---

## 5. TECHNOLOGY CONSTITUTION

| Layer | Technology |
|-------|-----------|
| Web frontend | React + TypeScript + Vite |
| Mobile | React Native + Expo + Expo Router |
| API | Cloudflare Workers + TypeScript |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Media storage | Cloudflare R2 |
| Web hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |
| Package manager | pnpm (workspace monorepo) |
| Build orchestration | Turborepo |

---

## 6. ENVIRONMENT MODEL

| Environment | Purpose |
|------------|---------|
| local | Individual developer machine |
| development | Shared integration testing |
| staging | Pre-production validation |
| production | Live system |

- Each environment MUST have separate database, auth, R2 bucket, and Worker deployment.
- Production secrets MUST NOT be shared with lower environments.

---

## 7. QUALITY GATE — DEFINITION OF DONE

A feature is complete ONLY when ALL of the following exist:
- Documented requirement
- UI implementation (where applicable)
- API endpoint (where applicable)
- Input validation (shared schema)
- Database migration (where applicable)
- Authorization enforcement (API + RLS)
- Unit tests
- Integration tests
- Error states handled
- Loading states handled
- Offline behavior defined (mobile)
- Audit behavior defined (where applicable)
- Documentation updated
- CI passes
- Production build passes

---

*End of PROJECT_CONSTITUTION.md*
