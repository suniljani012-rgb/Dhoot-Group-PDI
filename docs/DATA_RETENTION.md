# DATA RETENTION POLICY
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE — Legal validation required
**Last Updated:** 2026-08-25

> NOTE: Retention periods are initial assumptions. See ASSUMPTIONS.md ASM-014.
> Final policy must be validated with client legal/compliance team.

---

## 1. RETENTION PERIODS (ASSUMED)

| Data Category | Assumed Retention | Notes |
|---------------|------------------|-------|
| Inspection records (PDI sessions, responses) | 7 years | Automotive compliance assumption |
| Damage findings and evidence | 7 years | Linked to inspection records |
| Repair ticket records | 7 years | Linked to inspection records |
| QA approval records | 7 years | Audit/compliance |
| PDI certificates | 7 years | Delivery documentation |
| Audit logs (security/compliance) | 7 years | Regulatory assumption |
| Activity logs (UX events) | 90 days | Operational purposes |
| Notification records | 90 days | Operational purposes |
| Sync queue records (completed) | 7 days | Cleanup after sync |
| Media objects (photos, videos) | 7 years | Linked to inspection records |
| Generated report files | 90 days | Re-generatable on demand |
| Device registration records | Duration of employment + 1 year | Security audit |
| User accounts (deactivated) | 5 years | Audit trail |

---

## 2. DELETION RULES

- No inspection record, audit log, or certificate may be deleted by any user role
- Records reaching end of retention period are archived to cold storage, not immediately deleted
- Deletion requires explicit approval from Super Admin + documented business justification
- GDPR/data subject requests handled per client legal guidance (process TBD)

---

## 3. MEDIA RETENTION

- R2 objects follow the same retention periods as associated DB records
- Lifecycle rules configured in R2 to flag objects for review at retention end
- Physical deletion from R2 requires explicit job, not automatic

---

## 4. CONFIGURATION

Retention periods configurable by Super Admin in system settings.
Changes to retention periods are audited.
Reduction of retention period requires additional approval (data loss risk).

---

*End of DATA_RETENTION.md*
