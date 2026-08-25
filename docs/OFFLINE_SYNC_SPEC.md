# OFFLINE SYNC SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. SCOPE

This specification applies to the mobile application only. The web application does not support full offline operation; it shows an offline state indicator and prevents actions that require network access.

---

## 2. OFFLINE CAPABILITY GOALS

An engineer must be able to:
- Open a previously assigned inspection while offline
- Complete all checklist items while offline
- Capture and record damage findings while offline
- Queue photos for later upload
- Submit inspection (queued for sync on reconnect)

An engineer must NOT be able to:
- Access vehicles not previously synced to local storage
- Create new PDI assignments while offline
- Access QA approval functions offline (QA Manager function)

---

## 3. LOCAL STORAGE ARCHITECTURE

Technology: SQLite via Expo SQLite + Drizzle ORM

Local tables:

| Table | Contents | Retention |
|-------|----------|-----------|
| local_vehicles | Assigned vehicles (synced from server) | Until deassigned |
| local_assignments | Engineer's PDI assignments | Until completed |
| local_checklist_templates | Templates for assigned vehicle models | Cache TTL 24h |
| local_pdi_sessions | Draft inspection state | Until synced |
| local_checklist_responses | Individual item responses | Until synced |
| local_findings | Damage/issue records | Until synced |
| local_media_queue | Pending media uploads | Until uploaded |
| local_sync_queue | Ordered list of sync jobs | Until confirmed |
| local_notifications | Recent notifications cache | 7 days |
| local_feature_flags | Feature flag cache | Cache TTL 1h |

---

## 4. SYNC LIFECYCLE

```
LOCAL CHANGE (response, finding, photo capture)
   |
   v
WRITE LOCAL (SQLite — immediate)
   |
   v
ADD SYNC JOB to sync_queue (with idempotency key, retry count = 0)
   |
   v
NetInfo: NETWORK AVAILABLE?
   |
  NO ──────> WAIT (NetInfo listener re-triggers on connect)
   |
  YES
   |
   v
PROCESS SYNC QUEUE (ordered, sequential)
   |
   v
POST to Worker API (with Idempotency-Key header)
   |
   +── SUCCESS ──> MARK job SYNCED, update local record with server ID
   |
   +── 4xx (client error) ──> MARK job FAILED (no retry), alert user
   |
   +── 5xx / timeout ──> RETRY with exponential backoff
        └── Max retries: 5
        └── Delays: 2s, 8s, 30s, 2min, 10min
        └── After max retries: MARK job FAILED, alert user
```

---

## 5. IDEMPOTENCY

Every sync mutation must:
- Include a client-generated `Idempotency-Key` header (UUID, generated at job creation time)
- The server MUST deduplicate based on idempotency key
- Idempotency keys stored in local sync queue
- Retried requests reuse the same idempotency key

This ensures: network timeout → retry → no duplicate record created.

---

## 6. CONFLICT RESOLUTION

| Entity | Conflict Scenario | Resolution |
|--------|------------------|-----------|
| Checklist response | Engineer updates an item; server has a newer response (from admin edit) | Server version wins; engineer notified |
| PDI session status | Client submits; server has already transitioned state | Server wins; client shows current server state |
| Finding | Client creates a finding; server has already received it (duplicate key) | Idempotency deduplication at server |
| Media | Client uploads photo; same photo already exists | R2 key already exists; metadata dedup via idempotency |

Conflicts involving QA decisions or PDI submissions are workflow-critical:
- Server state is authoritative
- Engineer notified of any state change that overrides local data
- No silent overwrite of business-critical state

---

## 7. MEDIA UPLOAD QUEUE

Media upload is separate from data sync:

```
CAPTURE PHOTO (local file)
   |
   v
COMPRESS + RESIZE (client-side, WebP target)
   |
   v
ADD to local_media_queue (status: PENDING, local_path, target_entity)
   |
   v
NETWORK AVAILABLE?
   |
  YES
   |
   v
REQUEST presigned URL from Worker API
   |
   v
UPLOAD directly to R2 (not through Worker body)
   |
   v
CREATE attachment record via Worker API
   |
   v
MARK media_queue entry UPLOADED
   |
   v
DELETE local temp file (after confirmed upload)
```

Constraints:
- Max 3 concurrent uploads
- Each upload shows progress
- Failed uploads retry with backoff
- User can see pending upload count

---

## 8. REFERENCE DATA SYNC

Checklist templates and model metadata synced on:
- App start (if TTL expired)
- After login
- Manual refresh

TTL: 24 hours for templates, 1 hour for feature flags.

If reference data is stale offline, the last cached version is used with a staleness indicator.

---

## 9. SYNC STATUS UI

```
Sync Status Screen:
  [●] Connected / [○] Offline

  Pending sync jobs: 3
  Pending media uploads: 5 (2.4 MB)

  Last synced: 14:32:07

  [Retry Now]  [View Failed]
```

Status badge on main navigation when pending jobs exist.

---

## 10. DATA EXPIRY AND CLEANUP

- Synced local records kept for 7 days after sync confirmation (for offline review)
- FAILED sync jobs kept indefinitely until user acknowledges or retries
- Media queue cleaned after successful upload
- Temporary capture files deleted after upload confirmation

---

*End of OFFLINE_SYNC_SPEC.md*
