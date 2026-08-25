# NOTIFICATION SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. NOTIFICATION ARCHITECTURE

Pattern: Event-driven, asynchronous

```
Business Event (e.g., QA_APPROVED)
   |
   v
Notification Service (Worker job)
   |
   v
Notification Preferences Lookup (per recipient, per channel)
   |
   v
Channel Router:
   ├── Push (Expo Notifications → FCM/APNs)
   ├── In-App (stored in notifications table → polled by client)
   ├── Email (SMTP provider — TBD)
   └── WhatsApp/SMS (future — adapter interface present)
   |
   v
Delivery Attempt + Log
```

---

## 2. NOTIFICATION EVENTS

| Event | Trigger | Recipients |
|-------|---------|------------|
| PDI_ASSIGNED | Assignment created | PDI Engineer |
| PDI_STARTED | Inspection started | Branch Manager |
| PDI_SUBMITTED | Inspection submitted | QA Manager, Branch Manager |
| PDI_FAILED | Inspection submitted with failures | Workshop Manager, Branch Manager |
| REPAIR_ASSIGNED | Repair ticket assigned | Technician, Workshop Manager |
| REPAIR_COMPLETED | Repair marked complete | QA Manager, Branch Manager |
| QA_PENDING | PDI in QA queue | QA Manager (if not already notified) |
| QA_REJECTED | QA rejected PDI | PDI Engineer, Branch Manager |
| PDI_APPROVED | QA approved PDI | PDI Engineer, Branch Manager |
| DELIVERY_READY | Vehicle status = DELIVERY_READY | Branch Manager |
| SYNC_FAILED | Mobile sync job failed after max retries | PDI Engineer |
| SECURITY_EVENT | Login from new device, account locked | User + Admin |
| DEVICE_REVOKED | Device registration revoked | Affected user |

---

## 3. NOTIFICATION PREFERENCES

Each user can configure per-event, per-channel preferences:

| Setting | Options |
|---------|---------|
| Channel: Push | Enabled / Disabled |
| Channel: In-App | Always enabled (cannot disable) |
| Channel: Email | Enabled / Disabled |
| Quiet Hours | Time range to suppress push/email |
| Digest Mode | Batch non-urgent notifications (future) |

Admin can set default preferences per role.

---

## 4. DEDUPLICATION

Rules:
- Same event + same recipient + same entity within 5 minutes → single notification
- Idempotency key on notification creation
- Re-triggered events (e.g., multiple QA_PENDING triggers for same session) → check existing unread notification before creating new one

---

## 5. DELIVERY TRACKING

Notification record stores:

| Field | Description |
|-------|-------------|
| status | QUEUED → SENT → DELIVERED / FAILED |
| channel | push / in_app / email |
| sent_at | When dispatched |
| delivered_at | Delivery confirmed (where supported) |
| read_at | When user opened (in-app) |
| retry_count | Failed delivery retry count |
| error_message | Last delivery error (no sensitive content) |

---

## 6. PUSH NOTIFICATION CONTENT

Push notifications:
- Short, professional English
- Include entity identifier (vehicle VIN last 6 chars, or session reference)
- No PII beyond what the recipient already has access to
- Deep link to relevant screen in app

Examples:
```
"PDI Assigned: TGC4 – [VIN last 6] is ready for inspection."
"QA Approved: [VIN last 6] has passed quality review."
"Sync Failed: 3 inspection records could not be uploaded. Tap to retry."
```

---

## 7. IN-APP NOTIFICATION CENTRE

- Notification list with read/unread state
- Grouped by date
- Tap to navigate to relevant entity
- "Mark all read" action
- Notification badge count in navigation

---

*End of NOTIFICATION_SPEC.md*
