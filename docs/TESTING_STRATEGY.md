# TESTING STRATEGY
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. TESTING PHILOSOPHY

- Tests are not optional; they are part of the Definition of Done
- Test scope is proportional to risk and complexity
- Security tests are first-class, not afterthoughts
- Offline behavior must be explicitly tested
- No feature is shipped without tests that cover error paths, not just happy paths
- Performance tests must use realistic data volumes

---

## 2. TEST CATEGORIES

### 2.1 Unit Tests

Tool: Vitest (web / packages), Jest (mobile)

Scope:
- Validation schemas (Zod — every schema, every field, invalid inputs)
- Domain rules (state machine transitions, permission checks)
- Utility functions (VIN checksum, date formatting, sync queue logic)
- Checklist engine logic (template selection, item filtering)
- Business calculations (completion percentage, severity scoring)

Target coverage: 90%+ for domain logic, 80%+ overall.

### 2.2 Integration Tests

Tool: Vitest + test Worker + Supabase test instance

Scope:
- API endpoints: authentication, authorization, request validation, response shape
- Database: RLS policies (test as each role), FK constraints, unique constraints
- Auth flow: login, refresh, logout, expired token handling
- Upload signing: URL generation, object path validation
- Notification triggers: event fires correct notification type
- State machine: invalid transitions rejected, valid transitions accepted

### 2.3 End-to-End Tests

Tool: Playwright (web), Maestro (mobile)

Critical E2E workflows:
1. Login → Dashboard
2. Scan VIN → Vehicle Detail → Create PDI
3. Complete inspection → Add finding → Upload photo → Submit
4. QA queue → Review inspection → Approve
5. Certificate generation → Download
6. Repair ticket creation → Assign technician → Complete repair
7. Reinspection after QA rejection
8. Logout → Re-login → Session valid

### 2.4 Offline Tests (Mobile)

Tool: Detox / Maestro with network control

Scenarios:
- Start inspection online → go offline → complete checklist → reconnect → verify sync
- Go offline → open assigned inspection → complete → reconnect → verify server state matches
- Queue 10 photos offline → reconnect → verify all uploaded
- Conflict: server state changes while offline → verify resolution on reconnect
- Retry behavior: simulate 3 failed syncs → verify exponential backoff → eventual success

### 2.5 Security Tests

Tool: Custom test suite + API test scripts

Scenarios:
- Unauthenticated request to protected endpoint → 401 returned
- Valid JWT but wrong role → 403 returned
- Valid JWT but accessing other branch's vehicle → 403 returned (horizontal escalation)
- Valid JWT but PDI_ENGINEER attempting QA approval → 403 returned (vertical escalation)
- Expired access token → 401, refresh triggers automatically
- RLS bypass attempt (direct SQL through Supabase client) → blocked by RLS
- Malicious file upload (executable) → rejected at MIME validation
- Rate limit abuse → 429 returned after threshold
- Duplicate submission with same idempotency key → deduplicated (no 2nd record)
- Engineer approving own PDI → 403 returned
- QA Manager approving own submission → 403 returned

### 2.6 Performance Tests

Tool: k6

Scenarios and data volumes:
- Vehicle list endpoint: 10k, 100k, 500k records
- Dashboard aggregation: 10k, 100k, 500k vehicles
- VIN lookup: 500k vehicles → p50/p95 measured
- PDI submission under concurrent load: 10, 50, 100 concurrent

Results documented before production go-live.

---

## 3. DATABASE TESTING

RLS Policy Tests (for every exposed table):
- Test each role can access only permitted rows
- Test each role cannot access other branches' rows
- Test insert/update/delete policies enforce ownership

Constraint Tests:
- Duplicate VIN insertion rejected
- Invalid state transition via direct SQL rejected (CHECK constraint)
- FK violation rejected

Migration Tests (CI):
- Migrations run cleanly on empty database
- Migrations are idempotent where applicable
- Down migration considered (documented even if not always scripted)

---

## 4. CI INTEGRATION

Every pull request MUST pass:
- typecheck (tsc --noEmit)
- lint (Biome)
- unit tests
- integration tests (against test DB instance)
- build (all packages and apps)
- migration validation
- security scan (dependency audit)

E2E tests run on merge to develop and before staging deployment.
Performance tests run before production release.

---

## 5. TEST DATA MANAGEMENT

- Use factory functions (not fixtures) for test data generation
- Each test manages its own data lifecycle (create → test → teardown)
- No shared mutable state between tests
- Seed data for local/development clearly marked as demo data
- Performance test data generated programmatically to required volume

---

## 6. TEST ENVIRONMENT

| Environment | Unit | Integration | E2E | Security | Performance |
|-------------|------|-------------|-----|----------|-------------|
| Local | ✓ | ✓ | ✓ | Manual | Manual |
| CI (develop PR) | ✓ | ✓ | — | ✓ (automated) | — |
| CI (staging) | ✓ | ✓ | ✓ | ✓ | — |
| CI (production release) | ✓ | ✓ | ✓ | ✓ | ✓ |

---

*End of TESTING_STRATEGY.md*
