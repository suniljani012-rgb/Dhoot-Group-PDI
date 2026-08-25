# ASSUMPTIONS
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Last Updated:** 2026-08-25

> This document records all assumptions made during architecture and planning phase.
> Each assumption must be verified and updated or resolved before production go-live.

---

| ID | Assumption | Impact If Wrong | Owner | Status |
|----|-----------|----------------|-------|--------|
| ASM-001 | Organization structure is: HQ → Zones → Branches → Stockyards | Database schema must be revised | Architect | UNVERIFIED |
| ASM-002 | Each PDI engineer is assigned to exactly one branch at a time | User-branch relationship model | Product | UNVERIFIED |
| ASM-003 | Tata motor model/variant data will be provided by client for seed data | Checklist template configuration delayed | Product | UNVERIFIED |
| ASM-004 | VIN format follows standard 17-character ISO 3779 format | VIN validation logic | Engineer | UNVERIFIED |
| ASM-005 | Dark mode is not required for v1.0 | Design scope | Product | ASSUMED |
| ASM-006 | WhatsApp integration provider not required for v1.0 | Notification scope | Product | ASSUMED |
| ASM-007 | Bluetooth VCI / diagnostics not required for v1.0 | Platform scope | Product | ASSUMED |
| ASM-008 | SQLite local data does not require encryption at file system level (Expo SecureStore handles session tokens separately) | Mobile security posture | Security | UNVERIFIED — needs client policy |
| ASM-009 | Checklist templates will be configured by HO Admin; no self-service for branches | Admin UX scope | Product | UNVERIFIED |
| ASM-010 | Certificate PDF generation will use a server-side PDF library (not client-rendered) | Certificate architecture | Architect | ASSUMED |
| ASM-011 | Autoprime Tata / Dhoot Group branding assets (logo, brand colors) will be provided by client | Design system completion | Design | UNVERIFIED |
| ASM-012 | Notification push provider is FCM (Firebase Cloud Messaging) for Android and APNs for iOS via Expo Notifications | Notification architecture | Engineer | ASSUMED — pending client preference |
| ASM-013 | Maximum image resolution for PDI photos is 1920x1080 WebP at quality 0.82 | Storage cost and upload time | Product | ASSUMED — pending client approval |
| ASM-014 | Data retention period for inspection records is minimum 7 years (automotive compliance assumption) | Data retention policy | Legal/Product | UNVERIFIED — needs client legal input |
| ASM-015 | Report generation (PDF) will use a Cloudflare Worker with an HTML-to-PDF approach or a queue + external renderer | Report architecture | Architect | ASSUMED — implementation TBD |
| ASM-016 | GPS location capture during inspection is not required for v1.0 | Mobile permissions scope | Product | ASSUMED |

---

*All assumptions must be reviewed with the product owner before Phase 1 implementation begins.*

*End of ASSUMPTIONS.md*
