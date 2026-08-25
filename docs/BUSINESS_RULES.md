# BUSINESS RULES
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25
**Authority:** Superseded only by PROJECT_CONSTITUTION.md and PRODUCT_REQUIREMENTS.md
**Related Documents:** PRODUCT_REQUIREMENTS.md · DOMAIN_MODEL.md · SECURITY_REQUIREMENTS.md

---

## 1. OVERVIEW

This document defines the authoritative business rules that govern the behaviour of the Autoprime Tata PDI Management Platform. All business logic in the API layer, database constraints, and RLS policies must be consistent with this document.

**Rule:** No business rule may be implemented that is not grounded in this document, PRODUCT_REQUIREMENTS.md, or verified project evidence (see PROJECT_CONSTITUTION.md §4.3).

---

## 2. VEHICLE STATE MACHINE

### 2.1 State Definitions

| State | Code | Description |
|-------|------|-------------|
| Received | RECEIVED | Vehicle has been received into the stockyard. PDI has not yet been assigned. |
| PDI Pending | PDI_PENDING | A PDI session has been assigned to an engineer but not yet started. |
| PDI In Progress | PDI_IN_PROGRESS | The engineer has started the PDI session. Inspection is underway. |
| Failed | FAILED | PDI session was submitted with one or more CRITICAL or MAJOR findings. Vehicle requires repair. |
| Repair Pending | REPAIR_PENDING | Repair ticket(s) have been created but repair work has not yet commenced. |
| Repair In Progress | REPAIR_IN_PROGRESS | At least one repair ticket is in IN_PROGRESS state. |
| Repair Completed | REPAIR_COMPLETED | All repair tickets for the vehicle have reached COMPLETED state. Reinspection is required. |
| Reinspection | REINSPECTION | Vehicle is assigned for a new PDI session following repair completion. |
| QA Pending | QA_PENDING | PDI session has been submitted and passed severity threshold. Awaiting QA Manager review. |
| QA Rejected | QA_REJECTED | QA Manager has rejected the submitted PDI session. Engineer must address issues. |
| PDI Approved | PDI_APPROVED | QA Manager has approved the PDI session. Vehicle is cleared for delivery preparation. |
| Delivery Ready | DELIVERY_READY | Vehicle has been prepared and cleared for customer delivery. |
| Delivered | DELIVERED | Vehicle has been delivered to the customer. Terminal state. |

### 2.2 Valid State Transitions

| From State | To State | Trigger Event | Authorised Actor | Audit Required |
|------------|----------|--------------|-----------------|---------------|
| RECEIVED | PDI_PENDING | PDI assignment created | Branch Manager, QA Manager | Yes |
| PDI_PENDING | PDI_IN_PROGRESS | Engineer starts PDI session | Assigned Engineer | Yes |
| PDI_PENDING | PDI_PENDING | Reassignment (engineer change before start) | Branch Manager, QA Manager | Yes |
| PDI_IN_PROGRESS | FAILED | PDI submitted with CRITICAL or MAJOR finding(s) | System (on submission) | Yes |
| PDI_IN_PROGRESS | QA_PENDING | PDI submitted with no CRITICAL or MAJOR findings | System (on submission) | Yes |
| FAILED | REPAIR_PENDING | Repair ticket(s) created | System (on PDI FAILED) | Yes |
| REPAIR_PENDING | REPAIR_IN_PROGRESS | First repair ticket moves to IN_PROGRESS | Workshop Technician | Yes |
| REPAIR_IN_PROGRESS | REPAIR_COMPLETED | All repair tickets reach COMPLETED | System (on last ticket completion) | Yes |
| REPAIR_COMPLETED | REINSPECTION | New PDI session assigned for vehicle | Branch Manager, QA Manager | Yes |
| REINSPECTION | PDI_IN_PROGRESS | Engineer starts reinspection PDI session | Assigned Engineer | Yes |
| QA_PENDING | PDI_APPROVED | QA Manager approves PDI session | QA Manager | Yes |
| QA_PENDING | QA_REJECTED | QA Manager rejects PDI session | QA Manager | Yes |
| QA_REJECTED | PDI_IN_PROGRESS | Engineer restarts session to address issues | Assigned Engineer | Yes |
| PDI_APPROVED | DELIVERY_READY | Branch Manager clears vehicle for delivery | Branch Manager | Yes |
| DELIVERY_READY | DELIVERED | Delivery confirmed | Branch Manager | Yes |

### 2.3 Prohibited Transitions

- No state transition may be applied by a client application without a corresponding server-validated event.
- The terminal state DELIVERED admits no further transitions.
- A vehicle may not transition from DELIVERED to any prior state.
- No transition may skip intermediate states (e.g., RECEIVED → QA_PENDING is prohibited).
- State machine enforcement is implemented at the API layer and backed by database constraints.

### 2.4 Audit Requirement

Every state transition shall create an audit log record containing:
- `event_type`: the transition event identifier
- `actor_id`: the user who triggered the event
- `actor_role`: the role of the triggering actor
- `target_entity`: `vehicle`
- `target_id`: the vehicle record identifier
- `from_state`: previous vehicle status
- `to_state`: new vehicle status
- `timestamp`: UTC timestamp of the transition
- `metadata`: any relevant transition context (e.g., session ID, rejection reason)

---

## 3. PDI ASSIGNMENT RULES

| Rule ID | Rule |
|---------|------|
| BR-ASN-01 | Only one active PDI session may exist per vehicle at any time. A new session may not be created if an active session (status PDI_PENDING or PDI_IN_PROGRESS) already exists for the vehicle. |
| BR-ASN-02 | A PDI session may only be assigned to a user with the PDI Engineer role. |
| BR-ASN-03 | Only Branch Managers and QA Managers may create or reassign PDI assignments. |
| BR-ASN-04 | An engineer may be reassigned from a session (before the session is started) by a Branch Manager or QA Manager, generating an audit record. |
| BR-ASN-05 | The maximum number of concurrent active PDI assignments per engineer is configurable by System Administrators. The default value is documented in ASSUMPTIONS.md. |
| BR-ASN-06 | On assignment, the engineer shall receive an in-app notification. |

---

## 4. CHECKLIST COMPLETION RULES

| Rule ID | Rule |
|---------|------|
| BR-CHK-01 | An engineer may not submit a PDI session unless all mandatory checklist items have a recorded response. |
| BR-CHK-02 | A checklist item flagged as mandatory that the engineer determines is not applicable must be marked N/A with a mandatory written reason. An N/A response is treated as a completed response for submission gating purposes. |
| BR-CHK-03 | Checklist responses are saved locally on interaction (autosave). A response is not lost if the engineer exits the app or loses connectivity. |
| BR-CHK-04 | A checklist response may be updated by the recording engineer at any time before session submission. After submission, responses are read-only. |
| BR-CHK-05 | PHOTO_REQUIRED item types require at least one attached photo before the item may be marked as completed. |
| BR-CHK-06 | The checklist template version used for a session is fixed at session creation time. Template updates do not affect in-progress or completed sessions. |
| BR-CHK-07 | Checklist templates are versioned. Only one template version per model/variant may be in ACTIVE status at any time. Older versions are archived, not deleted. |

---

## 5. DAMAGE SEVERITY RULES

### 5.1 Severity Definitions

| Severity | Code | Definition |
|----------|------|-----------|
| Critical | CRITICAL | Damage or defect that makes the vehicle unsafe, non-compliant with regulatory requirements, or undriveable. |
| Major | MAJOR | Significant damage or defect that substantially affects vehicle quality, appearance, or function, but does not make it unsafe or undriveable. |
| Minor | MINOR | Cosmetic or minor functional defect that does not substantially affect quality or safety. |
| Observation | OBSERVATION | A noted condition that does not constitute a defect but is recorded for awareness or future monitoring. |

### 5.2 Evidence Requirements by Severity

| Severity | Minimum Photo Evidence | Description Required |
|----------|----------------------|---------------------|
| CRITICAL | At least 1 photo (mandatory) | Mandatory |
| MAJOR | At least 1 photo (mandatory) | Mandatory |
| MINOR | Photo optional | Mandatory |
| OBSERVATION | Photo optional | Mandatory |

### 5.3 Response Rules by Severity

| Severity | Vehicle Transition on PDI Submission | Repair Ticket Created |
|----------|-------------------------------------|----------------------|
| CRITICAL | Vehicle transitions to FAILED | Yes — automatically on PDI FAILED |
| MAJOR | Vehicle transitions to FAILED | Yes — automatically on PDI FAILED |
| MINOR | Vehicle proceeds to QA_PENDING (does not block) | No — recorded in report only |
| OBSERVATION | Vehicle proceeds to QA_PENDING (does not block) | No — recorded in report only |

> **Rule:** The PDI submission result (FAILED vs. QA_PENDING) is determined by the presence or absence of CRITICAL or MAJOR severity findings at the time of submission. This evaluation is performed by the server, not the client.

---

## 6. REPAIR TICKET RULES

| Rule ID | Rule |
|---------|------|
| BR-REP-01 | Repair tickets are created automatically by the system when a vehicle transitions to FAILED. One ticket may be created per CRITICAL or MAJOR finding, or tickets may be grouped at the discretion of the Branch Manager. |
| BR-REP-02 | Each repair ticket is assigned to a Workshop Technician by the Branch Manager. |
| BR-REP-03 | A repair ticket progresses through: OPEN → IN_PROGRESS → COMPLETED → VERIFIED. |
| BR-REP-04 | A Workshop Technician may update a ticket from OPEN to IN_PROGRESS and from IN_PROGRESS to COMPLETED. |
| BR-REP-05 | A Branch Manager or QA Manager may verify a completed ticket (COMPLETED → VERIFIED). |
| BR-REP-06 | Technicians may add work notes and attach evidence photos at any point while the ticket is OPEN or IN_PROGRESS. |
| BR-REP-07 | When all repair tickets for a vehicle reach COMPLETED (or VERIFIED), the system automatically transitions the vehicle to REPAIR_COMPLETED. |
| BR-REP-08 | Repair tickets may not be deleted. They may only be progressed through states. |
| BR-REP-09 | Each repair ticket state change shall generate an audit record. |

---

## 7. QA APPROVAL RULES

| Rule ID | Rule |
|---------|------|
| BR-QA-01 | Only users with the QA Manager role may approve or reject a PDI session. |
| BR-QA-02 | A QA Manager may not approve a PDI session for which they are also the submitting engineer. (In practice, QA Managers do not submit PDI sessions, but this constraint is enforced server-side regardless.) |
| BR-QA-03 | A QA Manager may not approve a PDI session that they personally submitted (if they hold both roles). |
| BR-QA-04 | On rejection, the QA Manager must provide a written rejection reason. The rejection reason is stored and audited. |
| BR-QA-05 | On rejection, the assigned engineer is notified in-app. |
| BR-QA-06 | After QA rejection, the vehicle returns to a state where the engineer may address findings. The specific state transition is governed by the state machine in §2.2. |
| BR-QA-07 | On approval, the system triggers certificate generation (asynchronous job). |
| BR-QA-08 | QA decisions are final once recorded. They may not be reversed by the QA Manager; reversal requires an administrative audit action. |
| BR-QA-09 | QA review is not available on the mobile application in v1.0. |

---

## 8. CERTIFICATE GENERATION RULES

| Rule ID | Rule |
|---------|------|
| BR-CERT-01 | A PDI completion certificate is generated automatically when a QA Manager approves a PDI session. |
| BR-CERT-02 | Certificate generation is an asynchronous background job. It does not block the QA approval API response. |
| BR-CERT-03 | Each certificate contains: vehicle VIN, model, variant, PDI session date, engineer name, QA approver name, summary of findings, approval status, and a unique certificate identifier. |
| BR-CERT-04 | Each certificate includes a QR code encoding the unique certificate identifier for digital verification. |
| BR-CERT-05 | Certificates are stored in Cloudflare R2 (private bucket). Access is via server-generated presigned download URLs (TTL: 60 minutes). |
| BR-CERT-06 | Certificate identifiers are server-generated and cryptographically unique. |
| BR-CERT-07 | Certificates may not be modified after generation. If a QA decision is reversed by administration, a new certificate is generated for the corrected session. |
| BR-CERT-08 | Certificate viewing is accessible to Branch Managers and above. |

---

## 9. NOTIFICATION TRIGGER RULES

| Trigger Event | Notification Sent To | Channel |
|---------------|---------------------|---------|
| PDI session assigned to engineer | Assigned Engineer | In-app + Push |
| PDI session reassigned | Previous Engineer, New Engineer | In-app + Push |
| PDI session submitted for QA | QA Manager(s) for the branch | In-app |
| QA session approved | Assigned Engineer, Branch Manager | In-app + Push |
| QA session rejected | Assigned Engineer | In-app + Push |
| Repair ticket assigned | Assigned Workshop Technician | In-app + Push |
| Repair ticket updated to IN_PROGRESS | Branch Manager | In-app |
| Repair ticket completed | Branch Manager, QA Manager | In-app |
| Vehicle transitions to REPAIR_COMPLETED | Branch Manager, QA Manager | In-app |
| Reinspection PDI assigned | Assigned Engineer | In-app + Push |
| Certificate generated | Branch Manager | In-app |
| Delivery marked | Branch Manager, HO Administrator | In-app |

**Rules:**
- Notifications are persisted records linked to a recipient. They are not ephemeral.
- Each notification has a `read_at` timestamp; null indicates unread.
- Push notifications are delivered via platform push services (APNs/FCM). Delivery is best-effort; in-app notification is the authoritative record.
- WhatsApp and email notification channels are out of scope for v1.0.

---

## 10. AUDIT TRAIL RULES

### 10.1 Events That Must Be Audited

| Event Category | Specific Events |
|----------------|----------------|
| Authentication | Login success, login failure, account lockout, logout, session revocation |
| User Management | User created, user updated, user deactivated, role assigned, role changed |
| Device | Device registered, device revoked |
| Vehicle | Vehicle created, vehicle status transition |
| PDI | PDI assignment created, PDI assignment reassigned, PDI session started, PDI session submitted, PDI session approved, PDI session rejected |
| Checklist | Checklist template created, template version updated, template deactivated |
| Finding | Finding created, finding updated (before submission only) |
| Repair | Repair ticket created, repair ticket status changed, repair ticket note added |
| QA | QA approval recorded, QA rejection recorded |
| Certificate | Certificate generation initiated, certificate stored |
| Delivery | Delivery ready marked, delivery confirmed |
| Administration | System setting changed, branch configuration changed |
| Security | Suspicious activity detected, privilege escalation attempt |

### 10.2 Audit Record Structure

Every audit record must include:

| Field | Description |
|-------|-------------|
| `id` | Unique audit record identifier |
| `event_type` | Enumerated event type |
| `actor_id` | Authenticated user who performed the action |
| `actor_role` | Role of the actor at time of event |
| `target_entity` | Entity type affected (e.g., `vehicle`, `pdi_session`, `user`) |
| `target_id` | Identifier of the affected entity |
| `timestamp` | UTC timestamp of the event |
| `ip_address` | IP address of the request origin |
| `device_id` | Registered device identifier (if applicable) |
| `metadata` | Structured non-sensitive context (e.g., from_state, to_state, reason) |

### 10.3 Access Control on Audit Records

| Actor | Permission |
|-------|-----------|
| PDI Engineers | No access to audit logs |
| Workshop Technicians | No access to audit logs |
| Branch Managers | Read own branch audit events |
| QA Managers | Read own branch audit events |
| Regional Managers | Read audit events for their branches |
| System Administrators | Read all audit records |
| Any user (including Admins) | Cannot delete audit records |
| System (automated processes) | Write audit records only |

> **Rule:** Audit logs are append-only. No user role permits deletion or modification of audit records. This is enforced at both the API layer and the database layer (RLS + constraints).

---

## 11. ROLE AND PERMISSION SUMMARY

| Action | PDI Engineer | Workshop Tech | QA Manager | Branch Manager | Regional Manager | HO Admin / Sys Admin |
|--------|-------------|--------------|-----------|----------------|-----------------|---------------------|
| Start PDI session | ✓ (own) | — | — | — | — | — |
| Submit PDI session | ✓ (own) | — | — | — | — | — |
| Create finding | ✓ (own session) | — | — | — | — | — |
| Approve / Reject PDI | — | — | ✓ | — | — | — |
| Assign PDI to engineer | — | — | ✓ | ✓ | — | ✓ |
| Update repair ticket | — | ✓ (assigned) | — | — | — | — |
| Assign repair ticket | — | — | ✓ | ✓ | — | ✓ |
| Mark delivery ready | — | — | — | ✓ | — | ✓ |
| Confirm delivery | — | — | — | ✓ | — | ✓ |
| View branch dashboard | — | — | ✓ | ✓ | ✓ | ✓ |
| View HO dashboard | — | — | — | — | ✓ | ✓ |
| Manage users | — | — | — | — | — | ✓ |
| Manage checklist templates | — | — | — | — | — | ✓ |
| View audit logs | — | — | Branch | Branch | Regional | All |
| Generate reports | — | — | ✓ | ✓ | ✓ | ✓ |

---

## 12. ASSUMPTIONS

Any assumptions underlying rules in this document are recorded in ASSUMPTIONS.md.

> **Note:** The specific rule for how repair tickets are grouped from CRITICAL and MAJOR findings (one per finding vs. one per session) is deferred to implementation design. This document states that at least one repair ticket must be created. See ASSUMPTIONS.md.

> **Note:** The rule for maximum concurrent active PDI assignments per engineer (BR-ASN-05) requires a configurable default. The default value is to be determined and recorded in ASSUMPTIONS.md.

> **Note:** The QA_REJECTED re-entry state (BR-QA-06) — whether the vehicle re-enters PDI_IN_PROGRESS directly or requires re-assignment — is clarified in the state machine (§2.2). See ASSUMPTIONS.md for any gap.

---

*End of BUSINESS_RULES.md*
