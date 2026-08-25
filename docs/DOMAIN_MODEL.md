# DOMAIN MODEL
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25
**Authority:** Superseded by PROJECT_CONSTITUTION.md, PRODUCT_REQUIREMENTS.md, and BUSINESS_RULES.md
**Related Documents:** BUSINESS_RULES.md · PRODUCT_REQUIREMENTS.md · DATABASE_SPEC.md (planned)

---

## 1. PURPOSE

This document describes the conceptual domain model for the Autoprime Tata PDI Management Platform. It defines the primary entities, their key attributes, relationships, aggregate boundaries, value objects, and domain events. It serves as the authoritative reference for database schema design, API design, and business logic implementation.

---

## 2. PRIMARY ENTITIES

### 2.1 Organisation

**Description:** Represents Dhoot Group as the owning organisation. The top-level scope for the entire system.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique organisation identifier |
| `name` | String | Organisation legal name |
| `created_at` | Timestamp | Record creation time |

**Relationships:**
- Has many `Branch` entities.
- Has many `User` entities (via branch or directly as HO users).

---

### 2.2 Branch

**Description:** Represents a physical Autoprime Tata dealership branch. Each branch has one or more stockyards and workshops.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique branch identifier |
| `organisation_id` | UUID | Parent organisation reference |
| `name` | String | Branch display name |
| `code` | String | Short branch code for reporting |
| `address` | String | Physical address |
| `city` | String | City |
| `state` | String | State/region |
| `is_active` | Boolean | Whether the branch is operational |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Last update time |

**Relationships:**
- Belongs to `Organisation`.
- Has many `Stockyard` entities.
- Has many `Vehicle` entities (branch-scoped).
- Has many `User` entities assigned to this branch.
- Has many `PDISession` entities (via vehicles).
- Has many `RepairTicket` entities.

---

### 2.3 Stockyard

**Description:** A physical holding area within a branch where vehicles are stored between receipt and delivery.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique stockyard identifier |
| `branch_id` | UUID | Parent branch reference |
| `name` | String | Stockyard display name |
| `location_description` | String | Description of location within branch |
| `is_active` | Boolean | Whether the stockyard is operational |
| `created_at` | Timestamp | Record creation time |

**Relationships:**
- Belongs to `Branch`.
- Has many `Vehicle` entities currently located here.

---

### 2.4 User

**Description:** A human actor who uses the system. Users hold one or more roles within the system.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique user identifier (linked to Supabase Auth) |
| `employee_id` | String | Dealer employee ID (unique) |
| `full_name` | String | Employee full name |
| `phone` | String | Mobile phone number (for OTP) |
| `branch_id` | UUID | Primary branch assignment |
| `is_active` | Boolean | Whether the account is active |
| `created_at` | Timestamp | Account creation time |
| `updated_at` | Timestamp | Last update time |

**Relationships:**
- Belongs to `Branch`.
- Has one or more `UserRole` assignments.
- Has many `PDISession` entities assigned or submitted.
- Has many `RepairTicket` entities assigned (if Workshop Technician).
- Has many `RegisteredDevice` entities.

---

### 2.5 UserRole

**Description:** Associates a user with a specific role. A user may hold more than one role.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique assignment identifier |
| `user_id` | UUID | User reference |
| `role` | RoleType | The assigned role (value object) |
| `branch_id` | UUID | Branch scope for the role (null if HO/global) |
| `assigned_by` | UUID | Administrator who assigned the role |
| `assigned_at` | Timestamp | Assignment time |
| `revoked_at` | Timestamp | Revocation time (null if active) |

**Relationships:**
- Belongs to `User`.
- Belongs to `Branch` (scope).

---

### 2.6 RegisteredDevice

**Description:** A mobile device registered by a user to access the mobile application.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique device identifier |
| `user_id` | UUID | Owning user reference |
| `device_token` | String | Platform device token (for push notifications) |
| `platform` | String | iOS or Android |
| `device_name` | String | Device display name |
| `registered_at` | Timestamp | Registration time |
| `revoked_at` | Timestamp | Revocation time (null if active) |
| `revoked_by` | UUID | Administrator who revoked (null if not revoked) |

**Relationships:**
- Belongs to `User`.

---

### 2.7 Vehicle

**Description:** Represents a Tata vehicle received at a branch for PDI processing. Central entity around which all workflows operate.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique vehicle identifier |
| `branch_id` | UUID | Receiving branch reference |
| `stockyard_id` | UUID | Current stockyard location |
| `vin` | String | Vehicle Identification Number (unique) |
| `chassis_number` | String | Chassis number |
| `model` | String | Vehicle model (e.g., Nexon, Harrier) |
| `variant` | String | Vehicle variant |
| `colour` | String | Exterior colour |
| `manufacturing_date` | Date | Manufacturing date |
| `received_at` | Timestamp | Stockyard receipt timestamp |
| `received_by` | UUID | User who recorded receipt |
| `status` | VehicleStatus | Current vehicle status (value object) |
| `is_archived` | Boolean | Soft-delete flag |
| `created_at` | Timestamp | Record creation time |
| `updated_at` | Timestamp | Last update time |

**Relationships:**
- Belongs to `Branch`.
- Belongs to `Stockyard`.
- Has many `PDISession` entities (at most one active).
- Has many `VehicleStatusTransition` audit records.
- Has many `RepairTicket` entities.
- Has one `Certificate` (once PDI_APPROVED).

---

### 2.8 VehicleStatusTransition

**Description:** Immutable audit record of every vehicle state transition. Forms the complete vehicle history trail.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique transition record identifier |
| `vehicle_id` | UUID | Vehicle reference |
| `from_status` | VehicleStatus | Previous status |
| `to_status` | VehicleStatus | New status |
| `actor_id` | UUID | User who triggered the transition (null if system) |
| `reason` | String | Optional reason or rejection note |
| `created_at` | Timestamp | UTC timestamp of transition |

**Relationships:**
- Belongs to `Vehicle`.

---

### 2.9 ChecklistTemplate

**Description:** A versioned, model-specific inspection checklist template that defines all categories and items to be inspected.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique template identifier |
| `vehicle_model` | String | Target vehicle model |
| `vehicle_variant` | String | Target vehicle variant (null = applies to all variants) |
| `version` | Integer | Template version number |
| `name` | String | Template display name |
| `status` | TemplateStatus | DRAFT, ACTIVE, ARCHIVED |
| `created_by` | UUID | Administrator who created the template |
| `activated_at` | Timestamp | Time the template became ACTIVE |
| `archived_at` | Timestamp | Time the template was archived (null if active) |
| `created_at` | Timestamp | Record creation time |

**Relationships:**
- Has many `ChecklistCategory` entities.
- Has many `PDISession` entities (sessions are pinned to a template version).

---

### 2.10 ChecklistCategory

**Description:** A logical grouping of related checklist items within a template (e.g., Exterior, Interior, Electrical).

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique category identifier |
| `template_id` | UUID | Parent template reference |
| `name` | String | Category display name |
| `code` | String | Short category code |
| `display_order` | Integer | Sequence in which categories are presented |
| `created_at` | Timestamp | Record creation time |

**Relationships:**
- Belongs to `ChecklistTemplate`.
- Has many `ChecklistItem` entities.

---

### 2.11 ChecklistItem

**Description:** A single inspection point within a category. Defines what the engineer must inspect and how to respond.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique item identifier |
| `category_id` | UUID | Parent category reference |
| `item_code` | String | Unique item code within the template |
| `title` | String | Item title displayed to the engineer |
| `instructions` | Text | Detailed inspection instructions |
| `item_type` | ItemType | PASS_FAIL, NUMERIC, TEXT, PHOTO_REQUIRED |
| `is_mandatory` | Boolean | Whether the item must be completed before submission |
| `display_order` | Integer | Sequence within the category |
| `created_at` | Timestamp | Record creation time |

**Relationships:**
- Belongs to `ChecklistCategory`.
- Has many `ChecklistResponse` entities (one per PDI session).
---

### 2.12 PDISession

**Description:** A single PDI inspection session for a vehicle. Links a vehicle, an engineer, a checklist template version, and all inspection results.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique session identifier |
| `vehicle_id` | UUID | Vehicle being inspected |
| `assigned_to` | UUID | PDI Engineer assigned |
| `assigned_by` | UUID | User who made the assignment |
| `branch_id` | UUID | Branch scope |
| `template_id` | UUID | Checklist template version used |
| `status` | PDISessionStatus | ASSIGNED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED |
| `started_at` | Timestamp | Time engineer started the session |
| `submitted_at` | Timestamp | Time engineer submitted the session |
| `qa_reviewed_by` | UUID | QA Manager who reviewed |
| `qa_reviewed_at` | Timestamp | Time of QA decision |
| `qa_decision` | QADecision | APPROVED or REJECTED |
| `qa_rejection_reason` | Text | Written reason (mandatory on rejection) |
| `is_reinspection` | Boolean | Whether this session is a reinspection after repair |
| `created_at` | Timestamp | Session creation time |
| `updated_at` | Timestamp | Last update time |

**Relationships:**
- Belongs to `Vehicle`.
- Belongs to `User` (assigned engineer).
- Belongs to `Branch`.
- Belongs to `ChecklistTemplate`.
- Has many `ChecklistResponse` entities.
- Has many `InspectionFinding` entities.
- Has many `MediaAttachment` entities.
- Has one `Certificate` (on approval).

---

### 2.13 ChecklistResponse

**Description:** A single recorded response to one checklist item within a PDI session.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique response identifier |
| `session_id` | UUID | Parent PDI session reference |
| `item_id` | UUID | Checklist item reference |
| `response_value` | String | The engineer's response (PASS/FAIL, numeric, text, N/A) |
| `response_type` | ResponseType | PASS, FAIL, NA, VALUE (value object) |
| `na_reason` | Text | Reason for N/A (mandatory when response_type = NA) |
| `finding_id` | UUID | Linked finding (null if no finding raised) |
| `responded_by` | UUID | Engineer who recorded the response |
| `responded_at` | Timestamp | Time of response |
| `synced_at` | Timestamp | Time the offline record was confirmed by server |

**Relationships:**
- Belongs to `PDISession`.
- Belongs to `ChecklistItem`.
- Optionally linked to `InspectionFinding`.

---

### 2.14 InspectionFinding

**Description:** A recorded damage or defect finding raised during a PDI session.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique finding identifier |
| `session_id` | UUID | Parent PDI session reference |
| `item_id` | UUID | Associated checklist item (null if finding is independent) |
| `severity` | Severity | CRITICAL, MAJOR, MINOR, OBSERVATION (value object) |
| `finding_type` | String | Classification of the finding (e.g., SCRATCH, DENT, MISSING_PART) |
| `body_area` | String | Affected vehicle body area code |
| `description` | Text | Engineer's description of the finding |
| `recorded_by` | UUID | Engineer who recorded the finding |
| `recorded_at` | Timestamp | Time of recording |

**Relationships:**
- Belongs to `PDISession`.
- Optionally belongs to `ChecklistItem`.
- Has many `MediaAttachment` entities (photos).
- May have one `RepairTicket`.

---

### 2.15 MediaAttachment

**Description:** A media file (photograph) attached to a PDI session, finding, or repair ticket. Stored in Cloudflare R2.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique attachment identifier |
| `entity_type` | String | Parent entity type: pdi_session, finding, repair_ticket |
| `entity_id` | UUID | Parent entity identifier |
| `r2_object_key` | String | Server-generated R2 object key (UUID-based path) |
| `mime_type` | String | Verified MIME type (e.g., image/webp) |
| `size_bytes` | Integer | File size in bytes |
| `uploaded_by` | UUID | User who uploaded |
| `uploaded_at` | Timestamp | Upload confirmation time |
| `caption` | String | Optional caption |

**Relationships:**
- Polymorphically belongs to `PDISession`, `InspectionFinding`, or `RepairTicket`.

---

### 2.16 RepairTicket

**Description:** A work order for repairing a damage finding identified during a failed PDI session.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique ticket identifier |
| `vehicle_id` | UUID | Vehicle requiring repair |
| `branch_id` | UUID | Branch scope |
| `finding_id` | UUID | Originating finding (null if grouped) |
| `pdi_session_id` | UUID | Originating PDI session |
| `assigned_to` | UUID | Workshop Technician assigned |
| `assigned_by` | UUID | User who made the assignment |
| `status` | RepairTicketStatus | OPEN, IN_PROGRESS, COMPLETED, VERIFIED |
| `priority` | Priority | LOW, MEDIUM, HIGH, CRITICAL |
| `description` | Text | Description of repair required |
| `estimated_completion` | Date | Target completion date |
| `completed_at` | Timestamp | Actual completion time |
| `verified_by` | UUID | User who verified completion |
| `verified_at` | Timestamp | Time of verification |
| `created_at` | Timestamp | Ticket creation time |
| `updated_at` | Timestamp | Last update time |

**Relationships:**
- Belongs to `Vehicle`.
- Belongs to `Branch`.
- Optionally belongs to `InspectionFinding`.
- Belongs to `PDISession` (originating).
- Belongs to `User` (assigned technician).
- Has many `RepairNote` entities.
- Has many `MediaAttachment` entities.

---

### 2.17 RepairNote

**Description:** A work note added by a Workshop Technician to a repair ticket during the repair process.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique note identifier |
| `ticket_id` | UUID | Parent repair ticket reference |
| `note_text` | Text | Content of the work note |
| `added_by` | UUID | User who added the note |
| `added_at` | Timestamp | Time the note was added |

**Relationships:**
- Belongs to `RepairTicket`.

---

### 2.18 Certificate

**Description:** A generated PDI completion certificate issued on QA approval. Immutable once created.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique certificate identifier |
| `vehicle_id` | UUID | Vehicle reference |
| `pdi_session_id` | UUID | Approved PDI session reference |
| `certificate_number` | String | Human-readable unique certificate number |
| `r2_object_key` | String | R2 key of the generated PDF |
| `qr_code_payload` | String | Content encoded in the QR code |
| `generated_at` | Timestamp | Generation completion time |
| `generated_by_job` | String | Background job identifier that generated this record |

**Relationships:**
- Belongs to `Vehicle`.
- Belongs to `PDISession`.

---

### 2.19 Notification

**Description:** An in-app notification record sent to a specific user in response to a domain event.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique notification identifier |
| `recipient_id` | UUID | Recipient user reference |
| `event_type` | NotificationEventType | The triggering domain event type |
| `title` | String | Notification title |
| `body` | String | Notification body text |
| `entity_type` | String | Related entity type (for deep link) |
| `entity_id` | UUID | Related entity identifier |
| `read_at` | Timestamp | Time the user read the notification (null = unread) |
| `created_at` | Timestamp | Notification creation time |

**Relationships:**
- Belongs to `User` (recipient).

---

### 2.20 AuditLog

**Description:** Immutable record of every security-relevant and business-critical event in the system. Append-only.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique audit record identifier |
| `event_type` | String | Enumerated event type |
| `actor_id` | UUID | Authenticated actor (null if system) |
| `actor_role` | String | Actor role at time of event |
| `target_entity` | String | Affected entity type |
| `target_id` | UUID | Affected entity identifier |
| `timestamp` | Timestamp | UTC event time |
| `ip_address` | String | Origin IP address |
| `device_id` | UUID | Registered device identifier (if applicable) |
| `metadata` | JSONB | Non-sensitive structured context |

**Relationships:**
- Belongs to `User` (actor, nullable).

---

### 2.21 SyncQueue (Mobile Local Only)

**Description:** Local SQLite table on the mobile device tracking offline mutations pending server synchronisation. Not replicated to the server database.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Local queue entry identifier |
| `idempotency_key` | UUID | Server-side deduplication key |
| `entity_type` | String | Type of the mutation (checklist_response, finding, etc.) |
| `payload` | JSON | Serialised mutation payload |
| `status` | SyncStatus | PENDING, SYNCED, FAILED |
| `retry_count` | Integer | Number of retry attempts |
| `last_attempted_at` | Timestamp | Time of last sync attempt |
| `error_message` | String | Error from last failed attempt |
| `created_at` | Timestamp | Queue entry creation time |

---

### 2.22 MediaQueue (Mobile Local Only)

**Description:** Local SQLite table tracking media files pending upload to R2.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Local queue entry identifier |
| `local_path` | String | File path on device |
| `entity_type` | String | Target entity type (finding, pdi_session) |
| `entity_id` | UUID | Target entity identifier |
| `status` | MediaUploadStatus | PENDING, UPLOADING, UPLOADED, FAILED |
| `size_bytes` | Integer | File size |
| `mime_type` | String | Image MIME type |
| `retry_count` | Integer | Number of upload retry attempts |
| `created_at` | Timestamp | Queue entry creation time |

---

### 2.23 DashboardSnapshot

**Description:** Pre-computed aggregated summary data for dashboard displays. Avoids heavy aggregation on every dashboard load.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique snapshot identifier |
| `branch_id` | UUID | Branch scope (null for HO snapshots) |
| `snapshot_type` | String | BRANCH_DAILY, HO_DAILY, etc. |
| `data` | JSONB | Structured aggregated metrics |
| `computed_at` | Timestamp | Time the snapshot was computed |
| `covers_period_start` | Date | Start of the covered period |
| `covers_period_end` | Date | End of the covered period |

**Relationships:**
- Belongs to `Branch` (or global for HO).

---

### 2.24 FeatureFlag

**Description:** System-level feature flags for controlled feature rollout and configuration.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique flag identifier |
| `flag_key` | String | Unique flag key |
| `is_enabled` | Boolean | Global enabled state |
| `scope` | String | GLOBAL, BRANCH, USER |
| `scope_id` | UUID | Scope entity identifier (null for GLOBAL) |
| `updated_by` | UUID | Administrator who last updated |
| `updated_at` | Timestamp | Last update time |

---

### 2.25 SystemSetting

**Description:** Configurable system-level parameters managed by System Administrators.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique setting identifier |
| `setting_key` | String | Unique setting key |
| `setting_value` | String | String-encoded value |
| `data_type` | String | INTEGER, BOOLEAN, STRING, DURATION |
| `description` | String | Human-readable description of the setting |
| `updated_by` | UUID | Administrator who last updated |
| `updated_at` | Timestamp | Last update time |

---

### 2.26 ReportJob

**Description:** An asynchronous report generation task tracking status until the output file is ready.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique job identifier |
| `requested_by` | UUID | User who requested the report |
| `report_type` | String | VEHICLE_PDI, BRANCH_OPERATIONAL, ENGINEER_PERFORMANCE |
| `parameters` | JSONB | Report filter parameters (date range, branch, etc.) |
| `status` | JobStatus | QUEUED, PROCESSING, COMPLETED, FAILED |
| `r2_object_key` | String | Output file key in R2 (null until completed) |
| `format` | String | PDF or CSV |
| `created_at` | Timestamp | Job creation time |
| `completed_at` | Timestamp | Job completion time (null if pending) |
| `error_message` | String | Error detail on failure |

---

### 2.27 IdempotencyRecord

**Description:** Server-side record of processed idempotency keys. Used to deduplicate retried sync requests from mobile clients.

| Attribute | Type | Description |
|-----------|------|-------------|
| `idempotency_key` | UUID | Client-generated key (PRIMARY KEY) |
| `endpoint` | String | API endpoint path |
| `actor_id` | UUID | Requesting user |
| `response_status` | Integer | HTTP status code of original response |
| `response_body` | JSONB | Cached response body |
| `created_at` | Timestamp | First request time |
| `expires_at` | Timestamp | Expiry time (records purged after TTL) |

---

### 2.28 ChecklistTemplateVersion (Conceptual Note)

**Description:** Checklist template versioning is managed through the `version` integer field and `status` field on `ChecklistTemplate` (DRAFT, ACTIVE, ARCHIVED). Only one template per model/variant combination may be ACTIVE at any time. There is no separate version entity; the `ChecklistTemplate` record itself is a version snapshot. This is an architectural decision; see DECISIONS.md.

---

### 2.29 VehicleBodyArea (Reference Data)

**Description:** A controlled vocabulary of vehicle body area codes used for structured damage location recording. Stored as reference/seed data.

| Attribute | Type | Description |
|-----------|------|-------------|
| `code` | String | Unique body area code (e.g., FRONT_BUMPER, HOOD, REAR_LEFT_DOOR) |
| `label` | String | Human-readable label |
| `region` | String | Logical region (FRONT, REAR, LEFT_SIDE, RIGHT_SIDE, ROOF, INTERIOR, UNDERBODY) |
| `display_order` | Integer | Display order on body map |

---

### 2.30 PushNotificationJob

**Description:** A queued job for dispatching a push notification to a registered device via APNs or FCM.

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Unique job identifier |
| `notification_id` | UUID | Source notification record |
| `device_id` | UUID | Target registered device |
| `platform` | String | iOS (APNs) or Android (FCM) |
| `payload` | JSONB | Platform-specific push payload |
| `status` | JobStatus | QUEUED, SENT, FAILED |
| `sent_at` | Timestamp | Delivery attempt time |
| `error_message` | String | Error on failure |
| `created_at` | Timestamp | Job creation time |

**Relationships:**
- Belongs to `Notification`.
- Belongs to `RegisteredDevice`.

---

## 3. ENTITY RELATIONSHIP SUMMARY

| Entity | Primary Relationships |
|--------|-----------------------|
| Organisation | Has many Branch (1:N) |
| Branch | Belongs to Organisation; has many Stockyard, User, Vehicle |
| Stockyard | Belongs to Branch; has many Vehicle |
| User | Belongs to Branch; has many UserRole, RegisteredDevice |
| Vehicle | Belongs to Branch and Stockyard; has many PDISession, RepairTicket; has one Certificate |
| PDISession | Belongs to Vehicle, User, Branch, ChecklistTemplate; has many ChecklistResponse, InspectionFinding, MediaAttachment |
| ChecklistTemplate | Has many ChecklistCategory |
| ChecklistCategory | Has many ChecklistItem |
| ChecklistItem | Has many ChecklistResponse |
| ChecklistResponse | Belongs to PDISession and ChecklistItem; optionally linked to InspectionFinding |
| InspectionFinding | Belongs to PDISession; optionally belongs to ChecklistItem; has many MediaAttachment; may have one RepairTicket |
| RepairTicket | Belongs to Vehicle, InspectionFinding, PDISession; has many RepairNote, MediaAttachment |
| Certificate | Belongs to PDISession and Vehicle |
| Notification | Belongs to User (recipient) |
| AuditLog | Belongs to User (actor, nullable) |
| DashboardSnapshot | Belongs to Branch |
| ReportJob | Belongs to User |
| PushNotificationJob | Belongs to Notification and RegisteredDevice |

---

## 4. AGGREGATE BOUNDARIES

Aggregates define consistency boundaries. Transactions should not span aggregate roots.

| Aggregate Root | Included Entities | Notes |
|----------------|------------------|-------|
| Vehicle | Vehicle, VehicleStatusTransition | PDISessions are a separate aggregate |
| PDISession | PDISession, ChecklistResponse, InspectionFinding | Certificate is a separate aggregate |
| ChecklistTemplate | ChecklistTemplate, ChecklistCategory, ChecklistItem | Template changes as one unit |
| RepairTicket | RepairTicket, RepairNote | Notes are owned by the ticket |
| Certificate | Certificate | Immutable once created |
| User | User, UserRole, RegisteredDevice | User management as one aggregate |
| Notification | Notification, PushNotificationJob | Push job is delivery concern for notification |

---

## 5. VALUE OBJECTS

Value objects are immutable types defined by their values, not by identity.

| Value Object | Values | Used In |
|--------------|--------|---------|
| VehicleStatus | RECEIVED, PDI_PENDING, PDI_IN_PROGRESS, FAILED, REPAIR_PENDING, REPAIR_IN_PROGRESS, REPAIR_COMPLETED, REINSPECTION, QA_PENDING, QA_REJECTED, PDI_APPROVED, DELIVERY_READY, DELIVERED | Vehicle |
| PDISessionStatus | ASSIGNED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED | PDISession |
| Severity | CRITICAL, MAJOR, MINOR, OBSERVATION | InspectionFinding |
| ResponseType | PASS, FAIL, NA, VALUE | ChecklistResponse |
| ItemType | PASS_FAIL, NUMERIC, TEXT, PHOTO_REQUIRED | ChecklistItem |
| RoleType | PDI_ENGINEER, WORKSHOP_TECHNICIAN, QA_MANAGER, BRANCH_MANAGER, REGIONAL_MANAGER, HO_ADMIN, SYSTEM_ADMIN | UserRole |
| RepairTicketStatus | OPEN, IN_PROGRESS, COMPLETED, VERIFIED | RepairTicket |
| Priority | LOW, MEDIUM, HIGH, CRITICAL | RepairTicket |
| QADecision | APPROVED, REJECTED | PDISession |
| TemplateStatus | DRAFT, ACTIVE, ARCHIVED | ChecklistTemplate |
| SyncStatus | PENDING, SYNCED, FAILED | SyncQueue (mobile) |
| MediaUploadStatus | PENDING, UPLOADING, UPLOADED, FAILED | MediaQueue (mobile) |
| JobStatus | QUEUED, PROCESSING, COMPLETED, FAILED | ReportJob, PushNotificationJob |

---

## 6. STATE MACHINE DESCRIPTIONS

### 6.1 Vehicle Lifecycle

```
RECEIVED
  |-- PDI assigned by Branch/QA Manager --> PDI_PENDING
        |-- Engineer starts session --> PDI_IN_PROGRESS
              |-- CRITICAL or MAJOR finding on submit --> FAILED
              |       |-- Repair tickets created --> REPAIR_PENDING
              |               |-- Technician starts --> REPAIR_IN_PROGRESS
              |                       |-- All tickets completed --> REPAIR_COMPLETED
              |                               |-- Reinspection assigned --> REINSPECTION
              |                                       |-- Engineer starts --> PDI_IN_PROGRESS (loop)
              |
              |-- No CRITICAL/MAJOR on submit --> QA_PENDING
                      |-- QA approves --> PDI_APPROVED
                      |       |-- Branch Manager clears --> DELIVERY_READY
                      |               |-- Delivery confirmed --> DELIVERED (terminal)
                      |
                      |-- QA rejects --> QA_REJECTED
                              |-- Engineer addresses, resubmits --> PDI_IN_PROGRESS (loop)
```

### 6.2 PDI Session Lifecycle

```
ASSIGNED
  |-- Engineer starts --> IN_PROGRESS
        |-- Engineer submits --> SUBMITTED
              |-- QA approves --> APPROVED (terminal for session)
              |-- QA rejects --> REJECTED
                      |-- Engineer reopens --> IN_PROGRESS (loop)
```

### 6.3 Repair Ticket Lifecycle

```
OPEN
  |-- Technician starts --> IN_PROGRESS
        |-- Technician marks complete --> COMPLETED
              |-- Manager verifies --> VERIFIED (terminal)
```

---

## 7. DOMAIN EVENTS

Domain events are facts that have occurred within the domain. They drive notifications, state transitions, audit records, and background jobs.

| Domain Event | Trigger | Primary Side Effects |
|--------------|---------|---------------------|
| VehicleReceived | Vehicle record created | Audit log created |
| PDIAssigned | PDI session created and assigned | Vehicle to PDI_PENDING; Engineer notified; Audit log |
| PDIReassigned | Assignment changed before session start | Previous and new engineer notified; Audit log |
| PDIStarted | Engineer starts the PDI session | Vehicle to PDI_IN_PROGRESS; Audit log |
| FindingRecorded | Engineer records an InspectionFinding | Saved locally; queued for server sync |
| PDISubmitted | Engineer submits completed PDI session | Triggers VehicleFailed or QAPendingTriggered; Audit log |
| VehicleFailed | Submission contained CRITICAL or MAJOR findings | Vehicle to FAILED; RepairTickets created; Branch Manager notified |
| QAPendingTriggered | Submission had no CRITICAL or MAJOR findings | Vehicle to QA_PENDING; QA Manager notified |
| RepairAssigned | Repair ticket assigned to technician | Technician notified; Audit log |
| RepairStarted | Technician moves ticket to IN_PROGRESS | Vehicle to REPAIR_IN_PROGRESS; Audit log |
| RepairCompleted | All repair tickets reach COMPLETED | Vehicle to REPAIR_COMPLETED; Branch Manager and QA Manager notified; Audit log |
| ReinspectionAssigned | New PDI session assigned after repair | Vehicle to REINSPECTION; Engineer notified; Audit log |
| QAApproved | QA Manager approves PDI session | Vehicle to PDI_APPROVED; Certificate generation initiated; Engineer and Branch Manager notified; Audit log |
| QARejected | QA Manager rejects PDI session | Vehicle to QA_REJECTED; Engineer notified with rejection reason; Audit log |
| CertificateGenerated | Background job completes certificate | Certificate stored in R2; Branch Manager notified; Audit log |
| DeliveryMarked | Branch Manager marks vehicle ready | Vehicle to DELIVERY_READY; Audit log |
| DeliveryConfirmed | Delivery confirmed | Vehicle to DELIVERED; Audit log |

---

## 8. ASSUMPTIONS

Any assumptions underlying this domain model are recorded in ASSUMPTIONS.md.

> **Note:** The VehicleBodyArea reference vocabulary (section 2.29) is modelled as seed/configuration data. The specific list of body area codes is implementation-defined and not exhaustively specified in this document. See ASSUMPTIONS.md.

> **Note:** The DashboardSnapshot data structure (section 2.23) — specifically the JSONB schema of the `data` field — is deferred to the API and database design phase. See ASSUMPTIONS.md.

> **Note:** ChecklistTemplateVersion is not a separate entity; versioning is tracked by the `version` integer and `status` field on ChecklistTemplate itself. This is an architectural decision recorded in DECISIONS.md.

> **Note:** SyncQueue and MediaQueue (sections 2.21 and 2.22) are local-only SQLite tables on the mobile device with no server-side counterparts. The server uses IdempotencyRecord (section 2.27) for deduplication. See ASSUMPTIONS.md.

---

*End of DOMAIN_MODEL.md*