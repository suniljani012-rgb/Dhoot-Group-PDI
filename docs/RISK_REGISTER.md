# RISK REGISTER
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## RISK RATING SCALE

| Rating | Likelihood | Impact |
|--------|-----------|--------|
| 1 — Low | Unlikely | Minor / recoverable |
| 2 — Medium | Possible | Significant but manageable |
| 3 — High | Likely | Severe operational or security impact |
| 4 — Critical | Very likely | Catastrophic / irreversible |

---

## RISK REGISTER

| ID | Risk | Category | Likelihood | Impact | Score | Mitigation | Residual Risk |
|----|------|----------|-----------|--------|-------|-----------|--------------|
| RISK-001 | RLS misconfiguration exposes cross-branch data | Security | 2 | 4 | 8 | RLS tests in CI, security review before deploy | Low after tests |
| RISK-002 | Offline sync conflict corrupts inspection data | Data | 2 | 3 | 6 | Server-authoritative conflict resolution, idempotency | Low |
| RISK-003 | Presigned URL leaked / shared | Security | 2 | 2 | 4 | Short TTL, HTTPS, access logging | Low |
| RISK-004 | Account takeover via credential stuffing | Security | 3 | 3 | 9 | Rate limiting, lockout, 2FA | Medium |
| RISK-005 | Supabase outage makes platform unavailable | Operations | 2 | 3 | 6 | Mobile offline mode, communicate SLA | Medium |
| RISK-006 | Checklist template error causes wrong checklist used | Business | 2 | 3 | 6 | Template version management, admin review | Low after review |
| RISK-007 | Media upload failure causes evidence gap | Operations | 2 | 3 | 6 | Queue-based retry, failure UI, manual recovery | Low |
| RISK-008 | Production migration fails mid-apply | Operations | 2 | 4 | 8 | Migration tests, staging deploy first, rollback plan | Low |
| RISK-009 | IDOR allows engineer to access another's inspection | Security | 2 | 3 | 6 | RLS + API ownership checks, security tests | Low after tests |
| RISK-010 | Mobile app bundle contains sensitive credentials | Security | 1 | 4 | 4 | Code review, secret scanning in CI | Very low |
| RISK-011 | Lost/stolen device with active session | Security | 2 | 3 | 6 | Remote device revocation, biometric lock, short session TTL | Low |
| RISK-012 | Third-party dependency vulnerability | Supply Chain | 2 | 3 | 6 | Dependency audit in CI, pinned versions, review process | Low |
| RISK-013 | Report generation timeout on large inspections | Performance | 2 | 2 | 4 | Async generation, no request blocking | Low |
| RISK-014 | Dashboard aggregation degrades transactional performance | Performance | 2 | 3 | 6 | Dashboard read models / materialized views | Low |
| RISK-015 | Branding assets not received before UI completion | Project | 3 | 1 | 3 | Placeholder assets used; brand applied in final phase | Very low |
| RISK-016 | Checklist template data not received before Phase 3 | Project | 2 | 3 | 6 | Demo seed data used; real templates configured pre-launch | Low |
| RISK-017 | VIN format does not match ISO 3779 (Indian market variations) | Business | 2 | 2 | 4 | Validation configurable; fallback to format-only check | Low |
| RISK-018 | SQLite local data not encrypted at file system level | Security | 1 | 2 | 2 | Session tokens in SecureStore; app sandbox protects SQLite | Low (see ASSUMPTIONS ASM-008) |

---

*Risks reviewed and updated at each phase gate.*

*End of RISK_REGISTER.md*
