# PERFORMANCE SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

> NOTE: All p50/p95 targets are GOALS to be validated after deployment. Claims are not guarantees.
> Actual measurements must be taken under realistic conditions and documented here.

---

## 1. PRINCIPLES

- Performance budgets must be measurable, not claimed
- Budgets apply to production-like conditions with realistic data volumes
- No "fast" claim without attached measurement
- Optimization applied only where measured, not assumed
- Field conditions (weak network, older devices) must be considered for mobile

---

## 2. API PERFORMANCE TARGETS

Targets apply to the Cloudflare Worker API under realistic load.
These are initial goals; actual measurements must update this document.

| Endpoint Category | p50 Target | p95 Target | Notes |
|-------------------|-----------|-----------|-------|
| Auth (login, refresh) | < 200ms | < 500ms | Includes Supabase Auth round-trip |
| VIN lookup | < 200ms | < 500ms | Indexed query |
| Vehicle list (paginated) | < 150ms | < 400ms | 20 items/page |
| Dashboard summary (Branch) | < 250ms | < 700ms | Aggregation query |
| Dashboard summary (HO) | < 500ms | < 1200ms | Cross-branch aggregation |
| PDI checklist fetch | < 150ms | < 350ms | Template + items |
| PDI submission | < 300ms | < 800ms | Write + state transition |
| QA approval | < 300ms | < 700ms | Write + notification trigger |
| Media presigned URL generation | < 100ms | < 250ms | R2 signing |
| Certificate generation (async) | N/A — async job | N/A | Queued; not synchronous |
| Notification dispatch | < 200ms | < 500ms | Event trigger only |

---

## 3. FRONTEND PERFORMANCE BUDGETS

### 3.1 Web Application

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s (fast network) |
| Time to Interactive | < 3s (fast network) |
| Core Web Vitals LCP | < 2.5s |
| Core Web Vitals CLS | < 0.1 |
| Core Web Vitals INP | < 200ms |
| JS Bundle (initial) | < 200KB gzipped |
| Code split chunks | < 100KB gzipped each |

### 3.2 Mobile Application

| Metric | Target |
|--------|--------|
| App cold start to login screen | < 2s |
| App warm start (biometric prompt) | < 1s |
| Checklist item response (local) | < 50ms (instant perception) |
| Photo capture to preview | < 300ms |
| Offline inspection completion | No network dependency |

---

## 4. DATABASE PERFORMANCE STRATEGY

### 4.1 Query Rules
- Never SELECT * in production API code
- All queries specify required columns
- Pagination required on all list endpoints
- Cursor pagination for high-volume feeds (audit logs, activity feeds)
- Offset pagination for admin tables (< 10,000 rows per query)
- Composite indexes for common filter patterns (branch_id + status, status + created_at)
- Foreign key columns indexed
- EXPLAIN ANALYZE required before shipping any complex query

### 4.2 Index Strategy

| Table | Index | Reason |
|-------|-------|--------|
| vehicles | (branch_id, status) | Branch queue filter |
| vehicles | (vin) UNIQUE | VIN lookup |
| pdi_sessions | (vehicle_id, status) | Vehicle PDI status |
| pdi_sessions | (assigned_to, status) | Engineer dashboard |
| checklist_responses | (session_id) | Checklist fetch |
| inspection_findings | (session_id) | Findings list |
| audit_logs | (actor_id, created_at) | User audit query |
| audit_logs | (target_entity, target_id) | Entity audit trail |
| repair_tickets | (branch_id, status) | Workshop queue |
| notifications | (recipient_id, read_at) | Notification list |

### 4.3 Dashboard Data Strategy

```
transactional tables
        |
        v
aggregation queries (nightly / event-triggered)
        |
        v
dashboard_snapshots table OR materialized views (where justified)
        |
        v
cached API response (short TTL)
```

Heavy analytics MUST NOT run on every dashboard request against live transactional tables.

---

## 5. MEDIA UPLOAD PERFORMANCE

- Client-side resize before upload (target: max 1920x1080, quality 0.82 WebP)
- Presigned URL generated < 100ms
- Direct upload to R2 (no proxy through Worker for body)
- Upload progress tracked and displayed
- Parallel upload for multiple images (max 3 concurrent)
- Failed uploads queued for retry

Actual upload time depends on network conditions. No fixed promise.

---

## 6. CACHE STRATEGY

| Cache Layer | Category | TTL | Invalidation |
|-------------|----------|-----|-------------|
| Cloudflare Edge | Static assets (versioned) | 1 year | Content hash change |
| Cloudflare Edge | Checklist templates | 1 hour | Template version update |
| TanStack Query | Vehicle list | 30s | Manual invalidation on mutation |
| TanStack Query | Dashboard | 60s | Manual invalidation on mutation |
| TanStack Query | User profile | 5 min | Logout / profile update |
| Mobile SQLite | Reference data | 24h | Explicit sync |
| Mobile SQLite | Inspection draft | Persistent | Sync confirmation |

Rules:
- Never cache authorization decisions across users
- Cache key MUST include user/branch scope for private data
- Never serve one user's private response to another

---

## 7. SCALABILITY TARGETS

System must be designed to operate correctly at:

| Scale | Vehicles | Engineers | Branches |
|-------|----------|-----------|----------|
| Small | 10,000 | 10 | 2 |
| Medium | 100,000 | 50 | 10 |
| Large | 500,000 | 200 | 30 |
| Maximum design target | 1,000,000 | 500 | 100 |

At maximum scale, all API targets above must still be met.
Dashboard aggregation may use pre-computed views at > 100,000 vehicles.

---

## 8. PERFORMANCE TESTING PLAN

Tests must be run with realistic data volumes (see TESTING_STRATEGY.md):
- 10,000 / 50,000 / 100,000 / 500,000 / 1,000,000 vehicle records
- Measure query time, API p50/p95/p99, index effectiveness
- Worker execution time
- Dashboard load
- Mobile list rendering
- Sync throughput
- Media upload throughput
- Report generation time

Results must be documented and committed before production go-live.

---

*End of PERFORMANCE_SPEC.md*
