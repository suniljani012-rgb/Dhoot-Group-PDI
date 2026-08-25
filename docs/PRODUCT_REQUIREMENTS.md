# PRODUCT REQUIREMENTS DOCUMENT
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25
**Authority:** Superseded only by PROJECT_CONSTITUTION.md
**Related Documents:** BUSINESS_RULES.md · DOMAIN_MODEL.md · SECURITY_REQUIREMENTS.md · PERFORMANCE_SPEC.md

---

## 1. PRODUCT OVERVIEW

The Autoprime Tata PDI Management Platform is a production-grade, enterprise Pre-Delivery Inspection (PDI) management system for Autoprime Tata dealerships operated by Dhoot Group. It digitises and enforces the complete vehicle lifecycle from stockyard receipt through PDI execution, damage reporting, repair management, QA approval, certificate generation, and final delivery.

The platform consists of:
- A **mobile application** (React Native + Expo) for PDI engineers and workshop technicians operating in stockyards and workshops.
- A **web application** (React + TypeScript + Vite) for QA managers, branch managers, regional managers, and head-office administrators.
- A **Cloudflare Workers API** layer providing all business logic and authorization enforcement.
- A **Supabase PostgreSQL** database with Row-Level Security (RLS) on all exposed tables.
- **Cloudflare R2** for private, presigned-URL-based media storage.

---

## 2. PRIMARY USERS

| Role | Environment | Primary Device | Description |
|------|-------------|---------------|-------------|
| PDI Engineer | Stockyard / Workshop floor | Mobile (Android/iOS) | Executes vehicle inspections, records checklist responses, captures damage evidence |
| Workshop Technician | Workshop | Mobile (Android/iOS) | Executes and updates repair tasks assigned to repair tickets |
| QA Manager | Branch office / Workshop | Web (desktop/tablet) | Reviews submitted PDI sessions, approves or rejects, triggers reinspection |
| Branch Manager | Branch office | Web (desktop) | Monitors branch PDI queue, repair status, vehicle delivery pipeline, generates branch reports |
| Regional Manager | Regional office | Web (desktop) | Cross-branch visibility over multiple stockyards and branches |
| Head Office Administrator | Corporate office | Web (desktop) | System-wide oversight, user management, role assignment, configuration, audit access, analytics |
| System Administrator | Corporate IT | Web (desktop) | User provisioning, device management, checklist template management, system settings |

---

## 3. OPERATIONAL CONTEXT

### 3.1 Stockyard Conditions

PDI engineers operate in conditions that directly inform product design requirements:

| Condition | Impact |
|-----------|--------|
| Bright sunlight / outdoor environment | High-contrast UI required; minimum WCAG 2.1 AA contrast |
| Gloved or wet hands | Minimum 44×44 pt touch targets; no precise micro-interactions |
| One hand may be occupied (clipboard, flashlight, tool) | Single-hand-operable primary flows |
| Intermittent or absent mobile data | Full offline capability for inspection execution and evidence capture |
| Time pressure (volume of vehicles) | Streamlined flows; minimum taps to complete core actions |
| Multiple simultaneous vehicle inspection assignments | Clear task list; current vehicle state always visible |

### 3.2 Network Conditions

The platform must be operable in:
- Full connectivity (Wi-Fi or 4G/5G)
- Degraded connectivity (2G/3G, intermittent signal)
- No connectivity (offline)

Offline capability applies to the mobile application only. Web application displays an offline indicator and prevents network-dependent actions.

---

## 4. FUNCTIONAL REQUIREMENTS

### FR-AUTH — Authentication and Session Management

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system shall authenticate users via Employee ID and password. |
| FR-AUTH-02 | The system shall support OTP (phone) as a second authentication factor where policy requires. |
| FR-AUTH-03 | The system shall enforce a minimum password length of 10 characters with complexity requirements. |
| FR-AUTH-04 | The system shall lock an account after 5 consecutive failed login attempts and apply exponential backoff. |
| FR-AUTH-05 | The system shall issue short-lived access tokens (default 15 minutes, configurable). |
| FR-AUTH-06 | The system shall rotate refresh tokens on each use. |
| FR-AUTH-07 | The system shall allow users to log out from all devices simultaneously. |
| FR-AUTH-08 | The mobile application shall support biometric unlock (Face ID / Fingerprint) using platform-provided APIs. Biometric unlock is a convenience mechanism only; it does not substitute backend authorization. |
| FR-AUTH-09 | The mobile application shall lock after a configurable inactivity period (Immediately / 1 / 5 / 15 / 30 minutes). |
| FR-AUTH-10 | The system shall audit all authentication events (login success, login failure, lockout, logout, session revocation). |
| FR-AUTH-11 | Device registration shall be required before a mobile user is granted access. |
| FR-AUTH-12 | Administrators shall be able to remotely revoke a registered device. |

---

### FR-VEH — Vehicle Management

| ID | Requirement |
|----|-------------|
| FR-VEH-01 | The system shall record each vehicle with a unique Vehicle Identification Number (VIN), model, variant, colour, manufacturing date, and chassis number. |
| FR-VEH-02 | The system shall associate each vehicle with a receiving branch and stockyard. |
| FR-VEH-03 | The system shall record the vehicle receipt date and the receiving officer identity. |
| FR-VEH-04 | The system shall maintain a vehicle status that progresses through a defined state machine (see BUSINESS_RULES.md). |
| FR-VEH-05 | The system shall prevent arbitrary client-side vehicle status changes; all transitions must be server-validated. |
| FR-VEH-06 | The system shall support VIN lookup by camera scan (QR/barcode) and by manual text entry. |
| FR-VEH-07 | The system shall surface a vehicle queue view for the branch, filterable by status, model, and date range. |
| FR-VEH-08 | The system shall record and display full vehicle history, including all status transitions, PDI sessions, findings, repair tickets, and delivery events. |
| FR-VEH-09 | Vehicle records shall not be permanently deleted; soft-delete or archival only. |

---

### FR-ASN — PDI Assignment

| ID | Requirement |
|----|-------------|
| FR-ASN-01 | The system shall allow Branch Managers and QA Managers to assign a PDI session to a specific engineer for a specific vehicle. |
| FR-ASN-02 | Only one active PDI session may exist per vehicle at any time. |
| FR-ASN-03 | The system shall notify the assigned engineer on assignment. |
| FR-ASN-04 | The system shall display each engineer's current active assignments on their mobile dashboard. |
| FR-ASN-05 | The system shall allow reassignment of a PDI session (prior to start) with audit record. |
| FR-ASN-06 | An engineer shall not be assignable to more than the configured maximum concurrent active sessions (configurable by admin). |

---

### FR-CHK — Checklist Management

| ID | Requirement |
|----|-------------|
| FR-CHK-01 | The system shall maintain versioned checklist templates per vehicle model and variant. |
| FR-CHK-02 | Checklist templates shall be organised into categories (e.g., Exterior, Interior, Electrical, Mechanical, Documentation). |
| FR-CHK-03 | Each checklist item shall have a unique code, title, instructions, mandatory flag, and item type (PASS_FAIL, NUMERIC, TEXT, PHOTO_REQUIRED). |
| FR-CHK-04 | The system shall load the appropriate checklist template for a vehicle's model at PDI session creation. |
| FR-CHK-05 | Mandatory items must be completed (responded to) before the engineer may submit the PDI session. |
| FR-CHK-06 | Non-mandatory items may be marked N/A with a required reason field. |
| FR-CHK-07 | Each checklist response shall record: item reference, response value, response time, responding engineer, and any attached finding reference. |
| FR-CHK-08 | Administrators shall be able to create, edit, version, and deactivate checklist templates via the web application. |
| FR-CHK-09 | Checklist template changes shall not retroactively alter in-progress or completed PDI sessions. |
| FR-CHK-10 | The mobile application shall cache checklist templates locally (TTL: 24 hours) to support offline inspection execution. |

---

### FR-PDI — PDI Session Execution

| ID | Requirement |
|----|-------------|
| FR-PDI-01 | The system shall create a PDI session linked to a vehicle, assigned engineer, branch, and checklist template version. |
| FR-PDI-02 | The engineer shall be able to start a PDI session from the mobile app. Starting the session transitions the vehicle to PDI_IN_PROGRESS. |
| FR-PDI-03 | The engineer shall be able to complete checklist items in any order within a category, and navigate categories in the defined sequence. |
| FR-PDI-04 | Every checklist response shall be saved locally on interaction (autosave). Data shall not be lost if the app is backgrounded. |
| FR-PDI-05 | The engineer shall be able to submit the PDI session once all mandatory items are completed. |
| FR-PDI-06 | On submission, the system shall evaluate the session: if any CRITICAL or MAJOR findings exist, the vehicle transitions to FAILED; otherwise to QA_PENDING. |
| FR-PDI-07 | The system shall display inspection progress to the engineer at both category and item granularity. |
| FR-PDI-08 | An engineer shall not be able to approve or QA-review their own PDI session. |
| FR-PDI-09 | The mobile application shall support full offline execution of a previously assigned PDI session. Data shall be queued for sync on reconnection. |
| FR-PDI-10 | Each PDI session shall record start time, submission time, and submitting engineer. |

---

### FR-DMG — Damage and Finding Recording

| ID | Requirement |
|----|-------------|
| FR-DMG-01 | The engineer shall be able to record a damage finding during PDI against any checklist item or independently. |
| FR-DMG-02 | Each finding shall capture: severity (CRITICAL / MAJOR / MINOR / OBSERVATION), description, affected body area (from a structured area list), finding type, and at least one photo for CRITICAL and MAJOR severity findings. |
| FR-DMG-03 | The system shall provide a visual vehicle body map for body area selection. |
| FR-DMG-04 | The system shall allow multiple findings per PDI session. |
| FR-DMG-05 | Each finding shall record the engineer who created it, and the timestamp. |
| FR-DMG-06 | CRITICAL and MAJOR findings shall automatically trigger the vehicle transition to FAILED on PDI submission. |
| FR-DMG-07 | MINOR and OBSERVATION findings shall be recorded and included in the PDI report but do not automatically block QA approval. |
| FR-DMG-08 | Findings shall be editable by the recording engineer before session submission. After submission, findings are read-only. |
| FR-DMG-09 | The system shall not support AI-based automatic damage detection in v1.0. |

---

### FR-PHO — Photo and Media Management

| ID | Requirement |
|----|-------------|
| FR-PHO-01 | The mobile application shall provide a guided camera capture interface with overlay indicating expected composition. |
| FR-PHO-02 | Captured images shall be compressed and resized client-side before upload (target: max 1920×1080, WebP format). |
| FR-PHO-03 | Images shall be uploaded directly to Cloudflare R2 via server-generated presigned URLs. The Worker body shall not proxy image data. |
| FR-PHO-04 | All R2 buckets shall be private. Presigned download URLs shall be server-generated with a short TTL (60 minutes). |
| FR-PHO-05 | When offline, captured images shall be queued locally and uploaded on reconnection. |
| FR-PHO-06 | Upload progress shall be displayed to the engineer. |
| FR-PHO-07 | Each media attachment shall be linked to a specific PDI session or finding. |
| FR-PHO-08 | Object keys shall be server-generated (UUID-based). Client-provided filenames shall not be used as object keys. |
| FR-PHO-09 | Maximum 3 concurrent uploads shall execute in parallel. |

---

### FR-REP — Repair Ticket Management

| ID | Requirement |
|----|-------------|
| FR-REP-01 | On PDI FAILED (CRITICAL or MAJOR findings), the system shall create one or more repair tickets linked to the relevant findings. |
| FR-REP-02 | Each repair ticket shall record: vehicle reference, finding reference, assigned workshop technician, priority, description, and estimated completion date. |
| FR-REP-03 | The repair ticket shall progress through: OPEN → IN_PROGRESS → COMPLETED → VERIFIED states. |
| FR-REP-04 | Workshop technicians shall be able to update ticket status, add work notes, and attach evidence photos. |
| FR-REP-05 | Branch Managers shall be able to assign and reassign repair tickets. |
| FR-REP-06 | On all repair tickets for a vehicle reaching COMPLETED, the vehicle shall transition to REPAIR_COMPLETED and trigger a reinspection notification. |
| FR-REP-07 | The repair queue shall be displayed to workshop staff and branch managers with filtering by status, priority, and technician. |
| FR-REP-08 | Repair ticket age (time since creation) shall be displayed and sortable. |

---

### FR-QA — QA Review and Decision

| ID | Requirement |
|----|-------------|
| FR-QA-01 | QA Managers shall be able to review a submitted PDI session in full, including all checklist responses, findings, and attached evidence. |
| FR-QA-02 | QA Managers shall be able to approve or reject a PDI session. |
| FR-QA-03 | On approval, the vehicle shall transition to PDI_APPROVED. |
| FR-QA-04 | On rejection, the QA Manager shall provide a mandatory written rejection reason. The vehicle shall transition to QA_REJECTED and the assigned engineer shall be notified. |
| FR-QA-05 | A QA Manager shall not approve a PDI session that they personally submitted. |
| FR-QA-06 | QA decisions shall be recorded with actor identity, timestamp, and reason (on rejection). |
| FR-QA-07 | Following reinspection after repair, QA Manager shall again review and approve/reject before delivery clearance. |
| FR-QA-08 | QA review shall not be performable on the mobile application in v1.0. |

---

### FR-CERT — Certificate Generation

| ID | Requirement |
|----|-------------|
| FR-CERT-01 | The system shall generate a PDI completion certificate upon QA approval. |
| FR-CERT-02 | The certificate shall include: vehicle VIN, model, variant, PDI session date, engineer name, QA approver name, summary of findings, approval status, and a QR code for digital verification. |
| FR-CERT-03 | Certificate generation shall be an asynchronous background job; it shall not block the QA approval response. |
| FR-CERT-04 | The generated certificate shall be stored in R2 and accessible via a presigned download URL. |
| FR-CERT-05 | The certificate shall be viewable on the web application by Branch Managers and above. |
| FR-CERT-06 | Each certificate shall have a unique, tamper-evident identifier used for QR verification. |
| FR-CERT-07 | The system shall not implement a blockchain-based certificate verification mechanism in v1.0. |

---

### FR-DSH — Dashboards

| ID | Requirement |
|----|-------------|
| FR-DSH-01 | The mobile engineer dashboard shall display: assigned inspections with status, pending sync count, and last sync time. |
| FR-DSH-02 | The branch dashboard shall display KPI tiles: total vehicles in stockyard, PDI queue counts by status, vehicles awaiting delivery, and open repair tickets. |
| FR-DSH-03 | The head-office dashboard shall display cross-branch aggregated KPIs, trend charts, and anomaly indicators. |
| FR-DSH-04 | Dashboard data shall not execute heavy aggregation queries against live transactional tables on every page load. Pre-computed summaries or materialised views shall be used where justified. |
| FR-DSH-05 | Dashboard data shall be clearly timestamped to indicate data freshness. |
| FR-DSH-06 | Branch and regional dashboards shall be scoped to branches the authenticated user is authorised to access. |

---

### FR-NOT — Notifications

| ID | Requirement |
|----|-------------|
| FR-NOT-01 | The system shall send in-app notifications for the following trigger events: PDI assigned, PDI submitted for QA, QA approved, QA rejected, repair ticket assigned, repair ticket completed, reinspection triggered, delivery marked. |
| FR-NOT-02 | The mobile application shall display push notifications for events relevant to the authenticated engineer. |
| FR-NOT-03 | Notification records shall be persisted with read/unread status per recipient. |
| FR-NOT-04 | Users shall be able to view all notifications in a notification list. |
| FR-NOT-05 | Users shall be able to mark notifications as read individually or all-at-once. |
| FR-NOT-06 | WhatsApp notification delivery is out of scope for v1.0. |
| FR-NOT-07 | Email notification delivery is deferred to post-v1.0 (see ASSUMPTIONS.md). |

---

### FR-OFF — Offline Capability (Mobile)

| ID | Requirement |
|----|-------------|
| FR-OFF-01 | An engineer shall be able to open and complete a previously assigned inspection while fully offline. |
| FR-OFF-02 | An engineer shall be able to capture photos while offline; media shall be queued for upload on reconnection. |
| FR-OFF-03 | An engineer shall be able to submit an inspection while offline; the submission shall be queued and automatically sent on reconnection. |
| FR-OFF-04 | Sync queue items shall include idempotency keys to prevent duplicate records on retry. |
| FR-OFF-05 | The sync queue shall process jobs sequentially in creation order. |
| FR-OFF-06 | Failed sync jobs (after maximum retries) shall surface to the engineer with a clear error message and manual retry option. |
| FR-OFF-07 | The engineer shall be able to see pending sync job count and pending media upload count at all times. |
| FR-OFF-08 | An engineer shall not be able to create new assignments or perform QA functions while offline. |
| FR-OFF-09 | Checklist templates shall be cached locally (TTL: 24 hours) to support offline use. |

---

### FR-RPT — Reports

| ID | Requirement |
|----|-------------|
| FR-RPT-01 | The system shall generate a PDI summary report per vehicle, covering all checklist responses, findings, and media evidence references. |
| FR-RPT-02 | The system shall generate a branch-level operational report covering PDI throughput, average cycle time, defect rate, and repair backlog by configurable date range. |
| FR-RPT-03 | The system shall generate an engineer performance report covering inspections completed, findings raised, and re-inspection rates by configurable date range. |
| FR-RPT-04 | Reports shall be exportable in PDF and CSV formats. |
| FR-RPT-05 | Report generation for large datasets shall be asynchronous; the user shall be notified when the report is ready for download. |
| FR-RPT-06 | Report access shall be gated by role; engineers shall not access reports containing other engineers' performance data. |
| FR-RPT-07 | OCR-based VIN extraction for report ingestion is out of scope for v1.0. |

---

### FR-ADM — Administration

| ID | Requirement |
|----|-------------|
| FR-ADM-01 | Administrators shall be able to create, view, update, and deactivate user accounts. |
| FR-ADM-02 | Administrators shall be able to assign and modify user roles. Role assignments shall be audited. |
| FR-ADM-03 | Administrators shall be able to manage branches and stockyard configurations. |
| FR-ADM-04 | Administrators shall be able to create, edit, version, and deactivate checklist templates. |
| FR-ADM-05 | Administrators shall be able to view audit logs, filterable by actor, event type, entity, and date range. Administrators shall not delete audit log records. |
| FR-ADM-06 | Administrators shall be able to configure system-level parameters (e.g., session inactivity timeout, maximum concurrent engineer assignments, notification settings). |
| FR-ADM-07 | Administrators shall be able to register and revoke mobile devices. |
| FR-ADM-08 | All administrative actions shall be audited. |

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

All performance targets are goals to be validated by measurement after deployment under production-like conditions. They are not contractual guarantees.

| Category | Target |
|----------|--------|
| API response p50 (standard reads) | < 200ms |
| API response p95 (standard reads) | < 500ms |
| PDI submission API p95 | < 800ms |
| Dashboard summary (Branch) p95 | < 700ms |
| Dashboard summary (HO) p95 | < 1200ms |
| Web FCP (fast network) | < 1.5s |
| Web Time to Interactive | < 3s |
| Mobile cold start to login screen | < 2s |
| Checklist item response (local save) | < 50ms |
| Photo capture to preview | < 300ms |
| Media presigned URL generation p95 | < 250ms |

Refer to PERFORMANCE_SPEC.md for the complete performance specification and index strategy.

### 5.2 Security

- All authorization enforced at both API layer and database layer (RLS).
- Client applications shall not hold privileged credentials (service-role keys, R2 secrets, database passwords).
- Audit logs are append-only for all users including administrators.
- Biometric authentication uses platform-provided APIs exclusively.
- All secrets stored in Cloudflare Secrets; none in source code or Git history.

Refer to SECURITY_REQUIREMENTS.md for the complete security specification.

### 5.3 Availability

The system is designed for high availability on Cloudflare infrastructure. No specific uptime SLA is claimed in this document; uptime targets shall be established in a separate SLA document after infrastructure baseline measurement.

### 5.4 Scalability

The system must operate correctly at the following scale levels without architectural changes:

| Scale Level | Vehicles | Active Engineers | Branches |
|-------------|----------|-----------------|----------|
| Small | 10,000 | 10 | 2 |
| Medium | 100,000 | 50 | 10 |
| Large | 500,000 | 200 | 30 |
| Maximum Design Target | 1,000,000 | 500 | 100 |

### 5.5 Maintainability

- TypeScript strict mode enabled across all packages.
- No uncontrolled `any` types in production code.
- All API endpoints fully documented (method, auth, role, request schema, response schema, error schema, rate limit, idempotency, audit behaviour).
- Every schema change in production goes through a reviewed migration; no manual DDL on live databases.
- Feature flags supported for controlled rollout.

---

## 6. OUT-OF-SCOPE — VERSION 1.0

The following capabilities are explicitly excluded from v1.0 scope. They may be considered for future versions.

| Feature | Rationale for Exclusion |
|---------|------------------------|
| Vehicle Condition Interface (VCI) integration | External system integration; not part of v1.0 scope |
| AI-based automatic damage detection | Requires model training infrastructure not yet established |
| OCR-based VIN extraction | Manual and camera scan entry sufficient for v1.0 |
| WhatsApp notification delivery | Third-party provider integration deferred |
| DMS (Dealer Management System) synchronisation | Integration scope undefined; deferred |
| Dark mode (web and mobile) | Architecture supports future addition; implementation deferred |
| Email notification delivery | Deferred pending notification provider selection |
| Blockchain certificate verification | Not required for v1.0 operational needs |
| QA review on mobile application | QA function is office-based; web-only in v1.0 |

---

## 7. ASSUMPTIONS

Any assumptions made in this document are recorded in ASSUMPTIONS.md. The following notes apply to this document specifically:

> **Note:** Checklist categories and item codes are defined in checklist template data, not hardcoded in this requirements document. The category list in FR-CHK-02 (Exterior, Interior, Electrical, Mechanical, Documentation) is illustrative; actual categories are configuration data. See ASSUMPTIONS.md.

> **Note:** The maximum number of concurrent active PDI sessions per engineer (FR-ASN-06) is configurable by administrators; no specific default value is mandated in this document. See ASSUMPTIONS.md.

> **Note:** Push notification delivery provider (APNs/FCM) selection for FR-NOT-02 is deferred to the DEPLOYMENT_SPEC.md. See ASSUMPTIONS.md.

---

*End of PRODUCT_REQUIREMENTS.md*
