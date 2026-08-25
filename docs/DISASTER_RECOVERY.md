# DISASTER RECOVERY
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE — DR plan must be tested before production go-live
**Last Updated:** 2026-08-25

---

## 1. RECOVERY OBJECTIVES

| Objective | Target | Notes |
|-----------|--------|-------|
| RPO (Recovery Point Objective) | < 1 hour | Maximum data loss acceptable |
| RTO (Recovery Time Objective) | < 4 hours | Time to restore operational service |

Actual RPO/RTO validated through DR drill before production.

> A backup that has never been restored/tested is not considered verified.

---

## 2. DATABASE BACKUP STRATEGY

Platform: Supabase managed PostgreSQL

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Automated daily backup | Daily | 7 days (Supabase Pro) |
| Point-in-time recovery (PITR) | Continuous (WAL) | 7 days (Supabase Pro) |
| Manual snapshot before major migration | Per migration | Kept until next stable release |

### Restore Process
1. Identify target restore point
2. Use Supabase PITR restore to staging environment first
3. Validate data integrity (row counts, FK checks, spot-check critical records)
4. If staging validation passes, restore to production (downtime window required)
5. Validate production
6. Document incident and root cause

---

## 3. MEDIA STORAGE RECOVERY

Platform: Cloudflare R2

- R2 provides geo-redundant storage — single-region failure handled by Cloudflare
- R2 does not natively provide versioning by default — evaluate enabling object versioning
- For disaster recovery: R2 objects are linked to DB records; if R2 objects lost, re-upload from original source may be required
- Certificate PDFs regeneratable from inspection data if originals lost

---

## 4. WORKER / WEB RECOVERY

- Cloudflare Workers: re-deploy from Git tag in < 2 minutes
- Cloudflare Pages: re-deploy from Git tag in < 2 minutes
- No stateful data in Workers; recovery is a code re-deploy only

---

## 5. DISASTER SCENARIOS

| Scenario | Impact | Response |
|----------|--------|----------|
| Database corrupted / lost | High | PITR restore |
| Supabase outage | High | Service unavailable until resolved (mobile offline mode reduces impact) |
| Cloudflare Workers outage | Medium | Web/API unavailable; mobile offline mode continues |
| R2 outage | Medium | Media unavailable; core inspection data intact in DB |
| Cloudflare Pages outage | Low | Web app unavailable; mobile unaffected |
| Accidental data deletion | High | PITR restore to point before deletion |
| Security breach / data exfiltration | Critical | Incident response plan (separate document) |

---

## 6. DR DRILL REQUIREMENT

DR drills must be conducted:
- Before production go-live (mandatory)
- Annually thereafter
- After any major infrastructure change

Drill covers: restore from backup to staging, validate data, document time taken, update RTO estimate.

---

*End of DISASTER_RECOVERY.md*
