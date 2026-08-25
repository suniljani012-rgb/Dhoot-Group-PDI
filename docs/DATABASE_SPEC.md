# DATABASE_SPEC.md
## Autoprime Tata PDI Management Platform — Database Specification

**Version:** 1.0.0
**Status:** Authoritative Draft
**Date:** 2026-08-25
**Owner:** Dhoot Group — Platform Engineering
**Related Documents:** SYSTEM_ARCHITECTURE.md · API_SPEC.md · DECISIONS.md · ASSUMPTIONS.md

---

## Table of Contents

1. [Database Platform](#1-database-platform)
2. [Global Schema Rules](#2-global-schema-rules)
3. [Migration Convention](#3-migration-convention)
4. [Index Strategy](#4-index-strategy)
5. [RLS Philosophy](#5-rls-philosophy)
6. [JSONB Usage Policy](#6-jsonb-usage-policy)
7. [Pagination Strategy](#7-pagination-strategy)
8. [Schema Reference — All Entities](#8-schema-reference--all-entities)
9. [Assumptions](#9-assumptions)

---

## 1. Database Platform

| Property | Value |
|----------|-------|
| Engine | PostgreSQL (managed via Supabase) |
| Schema management | SQL-first explicit migration files |
| Primary key type | `UUID` generated with `gen_random_uuid()` |
| Encoding | UTF-8 |
| Timezone | All timestamps stored in UTC (`TIMESTAMPTZ`) |
| Extensions required | `uuid-ossp`, `pgcrypto`, `pg_trgm`, `unaccent` |

---

## 2. Global Schema Rules

| Rule | Specification |
|------|--------------|
| Primary key | Every table has `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Timestamps | Every table has `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` |
| Soft delete | Deleted rows are marked with `deleted_at TIMESTAMPTZ DEFAULT NULL`. No `DELETE` statements permitted in application code. |
| Explicit foreign keys | All relational references use declared `FOREIGN KEY` constraints with explicit `ON DELETE` behaviour |
| CHECK constraints | All columns with restricted value sets use `CHECK` constraints |
| Unique constraints | All columns with a uniqueness requirement carry an explicit `UNIQUE` constraint |
| Indexed foreign keys | Every foreign key column is indexed unless the table has fewer than 1,000 expected rows |
| No SELECT * | All queries must name columns explicitly |
| RLS enabled | Row-Level Security is enabled on every table without exception |
| Updated_at trigger | A shared trigger function `set_updated_at()` auto-updates `updated_at` on every row modification |
| Org scoping | Every tenant table carries `org_id UUID NOT NULL REFERENCES organizations(id)` |

---

## 3. Migration Convention

### 3.1 File Naming

```
YYYYMMDDHHMMSS_short_description.sql

Examples:
  20260801120000_create_organizations.sql
  20260801130000_create_users.sql
  20260815090000_add_vehicle_status_history.sql
  20260820110000_add_rls_policies_vehicles.sql
```

### 3.2 Migration File Structure

```sql
-- Migration: 20260801120000_create_organizations.sql
-- Description: Create organizations table with RLS
-- Author: Platform Engineering
-- Date: 2026-08-01

BEGIN;

-- === UP ===
CREATE TABLE organizations ( /* columns */ );
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
-- policies

COMMIT;
```

### 3.3 Rules

- Migrations are **append-only**. Modifying an already-applied migration is prohibited.
- Every migration runs inside an explicit `BEGIN / COMMIT` transaction.
- Destructive changes require a separate migration and documented approval in `DECISIONS.md`.
- Rollback scripts are maintained in `migrations/rollbacks/`.

---

## 4. Index Strategy

| Category | Rule |
|----------|------|
| Foreign key columns | Always indexed. Name: `idx_{table}_{column}` |
| Status/enum columns | Indexed when used in common filter queries |
| Timestamp columns | `created_at`, `updated_at`, `deleted_at` indexed for range-scan queries |
| Composite indexes | Created for the most common multi-column filter patterns |
| Partial indexes | Used with `WHERE deleted_at IS NULL` for soft-delete tables |
| Full-text indexes | `tsvector` GIN indexes on searchable text columns |
| Unique indexes | Back every `UNIQUE` constraint |

---

## 5. RLS Philosophy

- Every table has RLS enabled. There are no exceptions.
- Policies are additive. A user with no matching policy sees zero rows.
- `org_id` is the outermost boundary; `branch_id` is the operational boundary.
- Policies reference the authenticated user role claim from the JWT.
- The API Worker uses the service role key for writes; explicit `WHERE` clauses scope reads.
- Policy naming convention: `{table}_{action}_{role_or_scope}`

---

## 6. JSONB Usage Policy

| Allowed | Not Allowed |
|---------|------------|
| Flexible metadata with unpredictable keys | Core relational data with known structure |
| Integration event payloads | User identity fields |
| Feature flag structured values | Foreign key relationships |
| Audit log change snapshots | Status or enum values used in filters |

JSONB columns must have a JSON Schema comment in the migration file. GIN indexes are added only when a specific query pattern demands it.

---

## 7. Pagination Strategy

| Use Case | Strategy |
|----------|----------|
| High-volume feeds (audit logs, activity logs) | **Cursor-based**: `?after=<cursor>&limit=<n>`, response includes `next_cursor` |
| Admin tables (users, vehicles, branches) | **Offset-based**: `?page=<n>&per_page=<n>`, response includes `total` |
| Maximum page size | 100 rows. Requests exceeding this are rejected with `VALIDATION_ERROR` |
| Default page size | 20 rows |

---

## 8. Schema Reference — All Entities

> **Legend:** PK = Primary Key · FK = Foreign Key · UQ = Unique · NN = NOT NULL · IDX = Indexed

---

### 8.01 — `organizations`

**Purpose:** Top-level tenant entity. All platform data is scoped to an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Organization identifier |
| `name` | TEXT | NN | Legal organization name |
| `slug` | TEXT | NN, UQ | URL-safe identifier |
| `contact_email` | TEXT | NN | Primary contact email |
| `contact_phone` | TEXT | | Contact phone |
| `address` | TEXT | | Registered address |
| `logo_r2_key` | TEXT | | R2 key for logo |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Organization active status |
| `metadata` | JSONB | DEFAULT '{}' | Flexible metadata |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_organizations_slug` (UQ), `idx_organizations_deleted_at`
**RLS:** Platform super-admins only. Org members see own record via a separate scoped policy.

---

### 8.02 — `zones`

**Purpose:** Geographic grouping of branches within an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Zone identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `name` | TEXT | NN | Zone name |
| `code` | TEXT | NN | Short code |
| `manager_user_id` | UUID | FK → users(id), IDX | Zone manager |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Unique:** `(org_id, code)`
**Indexes:** `idx_zones_org_id`, `idx_zones_manager_user_id`
**RLS:** Zone members and org admins read. Org admins write.

---

### 8.03 — `branches`

**Purpose:** Individual dealership branch. Primary operational unit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Branch identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `zone_id` | UUID | FK → zones(id), IDX | Parent zone |
| `name` | TEXT | NN | Branch name |
| `code` | TEXT | NN | Branch short code |
| `address` | TEXT | | Physical address |
| `city` | TEXT | | City |
| `state` | TEXT | | State / province |
| `pincode` | TEXT | | Postal code |
| `contact_phone` | TEXT | | Contact number |
| `contact_email` | TEXT | | Contact email |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Active status |
| `metadata` | JSONB | DEFAULT '{}' | Flexible metadata |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Unique:** `(org_id, code)`
**Indexes:** `idx_branches_org_id`, `idx_branches_zone_id`
**RLS:** Users see branches in their org. Branch admins write.

---

### 8.04 — `stockyards`

**Purpose:** Physical vehicle storage areas within a branch.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Stockyard identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Owning branch |
| `name` | TEXT | NN | Stockyard name |
| `code` | TEXT | NN | Short code |
| `capacity` | INTEGER | CHECK (capacity > 0) | Maximum vehicle capacity |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Unique:** `(branch_id, code)`
**Indexes:** `idx_stockyards_branch_id`, `idx_stockyards_org_id`
**RLS:** Scoped to branch membership.

---

### 8.05 — `users`

**Purpose:** Platform user accounts. Linked to Supabase Auth via `auth_user_id`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Platform user identifier |
| `auth_user_id` | UUID | NN, UQ | Supabase Auth UUID |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | FK → branches(id), IDX | Primary branch |
| `employee_id` | TEXT | | HR employee ID |
| `full_name` | TEXT | NN | Display name |
| `email` | TEXT | NN, UQ | Email address |
| `phone` | TEXT | | Phone number |
| `avatar_r2_key` | TEXT | | R2 key for avatar |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Account active status |
| `last_login_at` | TIMESTAMPTZ | | Last login timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_users_org_id`, `idx_users_branch_id`, `idx_users_auth_user_id` (UQ), `idx_users_email` (UQ)
**RLS:** Users see own record. Admins see all within org.

---

### 8.06 — `roles`

**Purpose:** Named platform roles defining access levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Role identifier |
| `org_id` | UUID | FK → organizations(id), IDX | Org-specific role (NULL = platform built-in) |
| `name` | TEXT | NN | Role name (e.g., `technician`, `qa_manager`) |
| `description` | TEXT | | Human-readable description |
| `is_system` | BOOLEAN | NN, DEFAULT FALSE | True for platform built-in roles |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Unique:** `(org_id, name)` with partial unique index covering system roles where org_id IS NULL.
**RLS:** Readable by all authenticated users. Writable by org admins only.

---

### 8.07 — `permissions`

**Purpose:** Named permissions assignable to roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Permission identifier |
| `name` | TEXT | NN, UQ | Machine-readable key (e.g., `pdi:session:create`) |
| `module` | TEXT | NN | Feature module (e.g., `pdi`, `vehicles`) |
| `description` | TEXT | | Human-readable description |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |

**RLS:** Read-only for all authenticated users. Managed by platform migrations only.

---

### 8.08 — `user_roles`

**Purpose:** Junction table mapping users to roles, with optional branch scope.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Assignment identifier |
| `user_id` | UUID | NN, FK → users(id), IDX | Assigned user |
| `role_id` | UUID | NN, FK → roles(id), IDX | Assigned role |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Org scope |
| `branch_id` | UUID | FK → branches(id), IDX | Optional branch scope (NULL = org-wide) |
| `granted_by` | UUID | FK → users(id), IDX | Granting user |
| `granted_at` | TIMESTAMPTZ | NN, DEFAULT now() | Grant timestamp |
| `expires_at` | TIMESTAMPTZ | | Optional expiry |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Unique:** `(user_id, role_id, branch_id)`
**Indexes:** `idx_ur_user_id`, `idx_ur_role_id`, `idx_ur_org_id`, `idx_ur_branch_id`
**RLS:** Users see own roles. Org admins manage.

---

### 8.09 — `devices`

**Purpose:** Registered devices used to access the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Device identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `user_id` | UUID | NN, FK → users(id), IDX | Registered user |
| `device_fingerprint` | TEXT | NN, UQ | Hardware/browser fingerprint |
| `device_name` | TEXT | | Human-readable label |
| `platform` | TEXT | NN, CHECK (platform IN ('android','ios','web','unknown')) | Device platform |
| `push_token` | TEXT | | Push notification token |
| `last_seen_at` | TIMESTAMPTZ | | Last activity timestamp |
| `is_trusted` | BOOLEAN | NN, DEFAULT FALSE | Trust-listed by admin |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_devices_user_id`, `idx_devices_org_id`
**RLS:** Users see own devices. Admins see org devices.

---

### 8.10 — `vehicles`

**Purpose:** Vehicle inventory. Central entity for the PDI workflow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Vehicle identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Assigned branch |
| `stockyard_id` | UUID | FK → stockyards(id), IDX | Current stockyard |
| `vin` | TEXT | NN, UQ | Vehicle Identification Number (17 chars) |
| `registration_number` | TEXT | | Registration plate |
| `make` | TEXT | NN | Manufacturer (e.g., "Tata") |
| `model` | TEXT | NN | Model name |
| `variant` | TEXT | | Variant / trim |
| `color` | TEXT | | Exterior colour |
| `fuel_type` | TEXT | NN, CHECK (fuel_type IN ('petrol','diesel','electric','cng','hybrid')) | Fuel type |
| `transmission` | TEXT | CHECK (transmission IN ('manual','automatic','amt')) | Transmission type |
| `manufacture_year` | INTEGER | NN, CHECK (manufacture_year >= 1990) | Year of manufacture |
| `engine_number` | TEXT | | Engine number |
| `chassis_number` | TEXT | | Chassis number |
| `invoice_number` | TEXT | | Dealer invoice number |
| `invoice_date` | DATE | | Invoice date |
| `current_status` | TEXT | NN, DEFAULT 'received', CHECK (current_status IN ('received','pdi_pending','pdi_in_progress','pdi_complete','qa_pending','qa_approved','qa_rejected','ready_for_delivery','delivered','hold')) | Workflow status |
| `odometer_km` | NUMERIC(10,2) | | Odometer reading at receipt |
| `metadata` | JSONB | DEFAULT '{}' | Additional attributes |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_vehicles_org_id`, `idx_vehicles_branch_id`, `idx_vehicles_stockyard_id`, `idx_vehicles_current_status`, `idx_vehicles_vin` (UQ), GIN tsvector index on vin + model + variant.
**RLS:** Users see vehicles scoped to their branch. Zone managers see across their zone.

---

### 8.11 — `vehicle_status_history`

**Purpose:** Immutable audit trail of all vehicle status transitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | History record identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Referenced vehicle |
| `from_status` | TEXT | | Previous status |
| `to_status` | TEXT | NN | New status |
| `changed_by` | UUID | FK → users(id), IDX | User who triggered transition |
| `change_reason` | TEXT | | Optional reason |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Transition timestamp |

**Indexes:** `idx_vsh_vehicle_id`, `idx_vsh_org_id`, `idx_vsh_created_at`
**RLS:** Branch members read. No UPDATE or DELETE permitted (immutable).

---

### 8.12 — `pdi_assignments`

**Purpose:** Assignment of a vehicle to a technician for PDI execution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Assignment identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Assigned vehicle |
| `technician_id` | UUID | NN, FK → users(id), IDX | Assigned technician |
| `assigned_by` | UUID | NN, FK → users(id), IDX | Assigning user |
| `checklist_template_id` | UUID | NN, FK → checklist_templates(id), IDX | Applicable template |
| `status` | TEXT | NN, DEFAULT 'pending', CHECK (status IN ('pending','active','completed','cancelled')) | Assignment status |
| `due_date` | DATE | | Expected completion date |
| `notes` | TEXT | | Assignment notes |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_pdia_vehicle_id`, `idx_pdia_technician_id`, `idx_pdia_branch_id`, `idx_pdia_status`
**RLS:** Technicians see own assignments. Branch admins see all.

---

### 8.13 — `pdi_sessions`

**Purpose:** Active or completed PDI execution record. One per vehicle PDI cycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Session identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Inspected vehicle |
| `assignment_id` | UUID | FK → pdi_assignments(id), IDX | Linked assignment |
| `technician_id` | UUID | NN, FK → users(id), IDX | Executing technician |
| `checklist_template_id` | UUID | NN, FK → checklist_templates(id), IDX | Template used |
| `status` | TEXT | NN, DEFAULT 'draft', CHECK (status IN ('draft','in_progress','submitted','qa_pending','qa_approved','qa_rejected','closed')) | Session status |
| `started_at` | TIMESTAMPTZ | | Session start time |
| `submitted_at` | TIMESTAMPTZ | | QA submission time |
| `completed_at` | TIMESTAMPTZ | | Closure time |
| `overall_result` | TEXT | CHECK (overall_result IN ('pass','fail','conditional_pass')) | Final result |
| `technician_notes` | TEXT | | General notes |
| `sync_version` | INTEGER | NN, DEFAULT 0 | Optimistic concurrency version for offline sync |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_pdis_vehicle_id`, `idx_pdis_technician_id`, `idx_pdis_branch_id`, `idx_pdis_status`, `idx_pdis_created_at`
**RLS:** Technicians see own sessions. QA managers see submitted sessions in their branch.

---

### 8.14 — `checklist_templates`

**Purpose:** Reusable PDI checklist templates scoped to vehicle model/variant or globally.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Template identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `name` | TEXT | NN | Template name |
| `description` | TEXT | | Template description |
| `applies_to_model` | TEXT | | Vehicle model scope (NULL = all) |
| `applies_to_variant` | TEXT | | Variant scope (NULL = all) |
| `applies_to_fuel_type` | TEXT | | Fuel type scope |
| `version` | INTEGER | NN, DEFAULT 1 | Template version |
| `is_active` | BOOLEAN | NN, DEFAULT TRUE | Currently in use |
| `is_default` | BOOLEAN | NN, DEFAULT FALSE | Default for unmatched vehicles |
| `created_by` | UUID | FK → users(id), IDX | Creating user |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_ct_org_id`, `idx_ct_is_active`
**RLS:** Readable by all org members. Writable by admins.

---

### 8.15 — `checklist_categories`

**Purpose:** Logical groupings of items within a checklist template (e.g., "Exterior", "Engine").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Category identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `template_id` | UUID | NN, FK → checklist_templates(id), IDX | Parent template |
| `name` | TEXT | NN | Category name |
| `description` | TEXT | | Description |
| `display_order` | INTEGER | NN, DEFAULT 0 | Rendering order |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_cc_template_id`, `idx_cc_org_id`
**RLS:** Inherits from parent template access policy.

---

### 8.16 — `checklist_items`

**Purpose:** Individual inspection points within a checklist category.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Item identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `category_id` | UUID | NN, FK → checklist_categories(id), IDX | Parent category |
| `name` | TEXT | NN | Item label |
| `description` | TEXT | | Guidance text |
| `is_mandatory` | BOOLEAN | NN, DEFAULT TRUE | Required for submission |
| `response_type` | TEXT | NN, CHECK (response_type IN ('pass_fail','multi_choice','text','numeric','photo_required')) | Response format |
| `validation_rules` | JSONB | DEFAULT '{}' | Type-specific validation config |
| `display_order` | INTEGER | NN, DEFAULT 0 | Rendering order |
| `requires_evidence` | BOOLEAN | NN, DEFAULT FALSE | Photo required on fail |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_ci_category_id`, `idx_ci_org_id`
**RLS:** Readable by all org members. Writable by admins.

---

### 8.17 — `checklist_responses`

**Purpose:** Technician responses to checklist items within a PDI session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Response identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `session_id` | UUID | NN, FK → pdi_sessions(id), IDX | Parent PDI session |
| `item_id` | UUID | NN, FK → checklist_items(id), IDX | Checklist item answered |
| `response_value` | TEXT | | Response value |
| `is_pass` | BOOLEAN | | Normalised pass/fail |
| `notes` | TEXT | | Technician notes |
| `responded_at` | TIMESTAMPTZ | NN, DEFAULT now() | Response timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Unique:** `(session_id, item_id)`
**Indexes:** `idx_cr_session_id`, `idx_cr_item_id`, `idx_cr_org_id`
**RLS:** Technicians see own session responses. QA managers see responses under review.

---

### 8.18 — `inspection_findings`

**Purpose:** Defect or observation findings raised during a PDI session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Finding identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `session_id` | UUID | NN, FK → pdi_sessions(id), IDX | Parent PDI session |
| `item_id` | UUID | FK → checklist_items(id), IDX | Related checklist item (nullable for ad-hoc) |
| `raised_by` | UUID | NN, FK → users(id), IDX | Raising user |
| `title` | TEXT | NN | Short title |
| `description` | TEXT | NN | Detailed description |
| `severity` | TEXT | NN, CHECK (severity IN ('critical','major','minor','observation')) | Severity classification |
| `status` | TEXT | NN, DEFAULT 'open', CHECK (status IN ('open','in_repair','resolved','waived','escalated')) | Resolution status |
| `resolution_notes` | TEXT | | Resolution notes |
| `resolved_by` | UUID | FK → users(id), IDX | Resolving user |
| `resolved_at` | TIMESTAMPTZ | | Resolution timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_if_session_id`, `idx_if_org_id`, `idx_if_status`, `idx_if_severity`
**RLS:** Branch members read. QA managers update status.

---

### 8.19 — `damage_reports`

**Purpose:** Formal vehicle damage incident reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Damage report identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Damaged vehicle |
| `session_id` | UUID | FK → pdi_sessions(id), IDX | Related PDI session (nullable) |
| `reported_by` | UUID | NN, FK → users(id), IDX | Reporting user |
| `report_date` | DATE | NN | Date of observation |
| `damage_type` | TEXT | NN, CHECK (damage_type IN ('transit','handling','manufacturing','unknown')) | Damage category |
| `description` | TEXT | NN | Damage description |
| `status` | TEXT | NN, DEFAULT 'reported', CHECK (status IN ('reported','under_review','approved','rejected','claim_filed','closed')) | Report status |
| `insurance_claim_ref` | TEXT | | External claim reference |
| `estimated_repair_cost` | NUMERIC(12,2) | | Estimated cost |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_dr_vehicle_id`, `idx_dr_branch_id`, `idx_dr_org_id`, `idx_dr_status`
**RLS:** Branch members read. Branch admins write. Zone managers read across zone.

---

### 8.20 — `damage_locations`

**Purpose:** Specific body panel or zone where damage was observed.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Location record identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `damage_report_id` | UUID | NN, FK → damage_reports(id), IDX | Parent damage report |
| `panel_code` | TEXT | NN | Standardised panel code (e.g., `FRONT_BUMPER`, `HOOD`) |
| `damage_severity` | TEXT | NN, CHECK (damage_severity IN ('scratch','dent','crack','broken','missing')) | Damage type |
| `size_estimate` | TEXT | | Approximate size |
| `notes` | TEXT | | Additional notes |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_dl_damage_report_id`, `idx_dl_org_id`
**RLS:** Inherits from parent damage_report.

---

### 8.21 — `damage_media`

**Purpose:** Photos and media files associated with damage locations or reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Media record identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `damage_report_id` | UUID | NN, FK → damage_reports(id), IDX | Parent damage report |
| `damage_location_id` | UUID | FK → damage_locations(id), IDX | Specific location (nullable) |
| `uploaded_by` | UUID | NN, FK → users(id), IDX | Uploading user |
| `r2_key` | TEXT | NN | R2 object key |
| `mime_type` | TEXT | NN | MIME type |
| `file_size_bytes` | BIGINT | | File size in bytes |
| `caption` | TEXT | | Optional caption |
| `uploaded_at` | TIMESTAMPTZ | NN, DEFAULT now() | Upload timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |

**Indexes:** `idx_dm_damage_report_id`, `idx_dm_damage_location_id`, `idx_dm_org_id`
**RLS:** Inherits from parent damage_report.

---

### 8.22 — `repair_tickets`

**Purpose:** Repair work orders raised for findings or damage reports.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Ticket identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Subject vehicle |
| `finding_id` | UUID | FK → inspection_findings(id), IDX | Related finding (nullable) |
| `damage_report_id` | UUID | FK → damage_reports(id), IDX | Related damage report (nullable) |
| `raised_by` | UUID | NN, FK → users(id), IDX | Ticket creator |
| `assigned_to` | UUID | FK → users(id), IDX | Assigned technician |
| `status` | TEXT | NN, DEFAULT 'open', CHECK (status IN ('open','in_progress','parts_awaited','completed','cancelled')) | Ticket status |
| `priority` | TEXT | NN, DEFAULT 'normal', CHECK (priority IN ('low','normal','high','critical')) | Priority |
| `description` | TEXT | NN | Work description |
| `estimated_hours` | NUMERIC(6,2) | | Estimated labour hours |
| `actual_hours` | NUMERIC(6,2) | | Actual hours recorded |
| `due_date` | DATE | | Expected completion |
| `completed_at` | TIMESTAMPTZ | | Actual completion timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |
| `deleted_at` | TIMESTAMPTZ | | Soft-delete timestamp |

**Indexes:** `idx_rt_vehicle_id`, `idx_rt_branch_id`, `idx_rt_org_id`, `idx_rt_status`, `idx_rt_assigned_to`
**RLS:** Branch members read. Workshop admins write and assign.

---

### 8.23 — `repair_actions`

**Purpose:** Individual actions or steps recorded against a repair ticket.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Action identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `ticket_id` | UUID | NN, FK → repair_tickets(id), IDX | Parent repair ticket |
| `performed_by` | UUID | NN, FK → users(id), IDX | Performing user |
| `action_type` | TEXT | NN, CHECK (action_type IN ('diagnosis','repair','replacement','inspection','escalation','note')) | Action type |
| `description` | TEXT | NN | Action description |
| `time_spent_minutes` | INTEGER | CHECK (time_spent_minutes >= 0) | Labour time |
| `performed_at` | TIMESTAMPTZ | NN, DEFAULT now() | Action timestamp |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |

**Indexes:** `idx_ra_ticket_id`, `idx_ra_org_id`
**RLS:** Branch members read. Assigned technicians and workshop admins write.

---

### 8.24 — `part_usage`

**Purpose:** Parts consumed against a repair ticket.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Part usage record identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `ticket_id` | UUID | NN, FK → repair_tickets(id), IDX | Parent repair ticket |
| `recorded_by` | UUID | NN, FK → users(id), IDX | Recording user |
| `part_number` | TEXT | NN | Manufacturer part number |
| `part_name` | TEXT | NN | Part description |
| `quantity` | NUMERIC(10,3) | NN, CHECK (quantity > 0) | Quantity used |
| `unit` | TEXT | NN, DEFAULT 'pcs' | Unit of measure |
| `unit_cost` | NUMERIC(12,2) | | Cost per unit |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_pu_ticket_id`, `idx_pu_org_id`
**RLS:** Branch members read. Technicians and workshop admins write.

---

### 8.25 — `workshop_assignments`

**Purpose:** Assignment of a vehicle to a specific workshop bay or workstation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Workshop assignment identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Assigned vehicle |
| `ticket_id` | UUID | FK → repair_tickets(id), IDX | Associated repair ticket |
| `bay_code` | TEXT | | Workshop bay identifier |
| `assigned_to` | UUID | FK → users(id), IDX | Assigned technician |
| `assigned_by` | UUID | NN, FK → users(id), IDX | Assigning manager |
| `scheduled_date` | DATE | | Planned start date |
| `status` | TEXT | NN, DEFAULT 'scheduled', CHECK (status IN ('scheduled','in_progress','completed','cancelled')) | Assignment status |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_wa_vehicle_id`, `idx_wa_branch_id`, `idx_wa_org_id`, `idx_wa_assigned_to`
**RLS:** Branch members read. Workshop admins write.

---

### 8.26 — `qa_reviews`

**Purpose:** Quality Assurance review record for a completed PDI session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | QA review identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Branch context |
| `session_id` | UUID | NN, FK → pdi_sessions(id), IDX, UQ | Reviewed session |
| `reviewer_id` | UUID | NN, FK → users(id), IDX | QA reviewer |
| `decision` | TEXT | NN, CHECK (decision IN ('approved','rejected','conditional_approval')) | QA decision |
| `review_notes` | TEXT | | Reviewer notes |
| `reviewed_at` | TIMESTAMPTZ | NN, DEFAULT now() | Decision timestamp |
| `rejection_reason` | TEXT | | Mandatory if decision = 'rejected' |
| `conditions` | TEXT | | Conditions for conditional_approval |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Unique:** `(session_id)` — one review per session.
**Indexes:** `idx_qar_session_id` (UQ), `idx_qar_reviewer_id`, `idx_qar_branch_id`, `idx_qar_org_id`
**RLS:** QA managers and branch admins read. QA managers write. Self-review blocked by application rule (error: `QA_SELF_APPROVAL_FORBIDDEN`).

---

### 8.27 — `pdi_certificates`

**Purpose:** Official PDI completion certificate generated upon QA approval.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Certificate identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `branch_id` | UUID | NN, FK → branches(id), IDX | Issuing branch |
| `session_id` | UUID | NN, FK → pdi_sessions(id), IDX, UQ | Source session |
| `vehicle_id` | UUID | NN, FK → vehicles(id), IDX | Certified vehicle |
| `qa_review_id` | UUID | NN, FK → qa_reviews(id), IDX | Approving QA review |
| `certificate_number` | TEXT | NN, UQ | Human-readable cert number |
| `issued_at` | TIMESTAMPTZ | NN, DEFAULT now() | Issue timestamp |
| `issued_by` | UUID | NN, FK → users(id), IDX | Issuing user |
| `pdf_r2_key` | TEXT | | R2 key for generated PDF |
| `is_void` | BOOLEAN | NN, DEFAULT FALSE | Voided status |
| `void_reason` | TEXT | | Mandatory if is_void = TRUE |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_pdic_session_id` (UQ), `idx_pdic_vehicle_id`, `idx_pdic_branch_id`, `idx_pdic_org_id`, `idx_pdic_certificate_number` (UQ)
**RLS:** Branch members read. Branch admins may void.

---

### 8.28 — `notifications`

**Purpose:** Platform notification records for in-app, email, SMS, and push delivery.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Notification identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `recipient_user_id` | UUID | NN, FK → users(id), IDX | Target user |
| `sender_user_id` | UUID | FK → users(id), IDX | Sending user (nullable = system) |
| `title` | TEXT | NN | Notification title |
| `body` | TEXT | NN | Notification body |
| `type` | TEXT | NN, CHECK (type IN ('assignment','finding','qa_decision','system','reminder','report')) | Category |
| `channel` | TEXT | NN, CHECK (channel IN ('in_app','email','sms','push')) | Delivery channel |
| `status` | TEXT | NN, DEFAULT 'pending', CHECK (status IN ('pending','sent','delivered','failed','read')) | Delivery status |
| `related_entity_type` | TEXT | | Context entity type |
| `related_entity_id` | UUID | | Context entity UUID |
| `sent_at` | TIMESTAMPTZ | | Dispatch timestamp |
| `read_at` | TIMESTAMPTZ | | Read timestamp |
| `metadata` | JSONB | DEFAULT '{}' | Provider delivery metadata |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Indexes:** `idx_notif_recipient_user_id`, `idx_notif_org_id`, `idx_notif_status`, `idx_notif_created_at`
**RLS:** Users see only their own notifications.

---

### 8.29 — `notification_preferences`

**Purpose:** Per-user notification delivery channel and type preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Preference record identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `user_id` | UUID | NN, FK → users(id), IDX, UQ | User |
| `email_enabled` | BOOLEAN | NN, DEFAULT TRUE | Email enabled |
| `sms_enabled` | BOOLEAN | NN, DEFAULT FALSE | SMS enabled |
| `push_enabled` | BOOLEAN | NN, DEFAULT TRUE | Push enabled |
| `in_app_enabled` | BOOLEAN | NN, DEFAULT TRUE | In-app enabled |
| `quiet_hours_start` | TIME | | Quiet hours start |
| `quiet_hours_end` | TIME | | Quiet hours end |
| `preferences_detail` | JSONB | DEFAULT '{}' | Per-type channel overrides |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NN, DEFAULT now() | Last modified |

**Unique:** `(user_id)`
**Indexes:** `idx_np_user_id` (UQ), `idx_np_org_id`
**RLS:** Users read and write only their own preferences.

---

### 8.30 — `audit_logs`

**Purpose:** Immutable record of all state-changing API operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, NN | Audit log identifier |
| `org_id` | UUID | NN, FK → organizations(id), IDX | Owning organization |
| `actor_user_id` | UUID | FK → users(id), IDX | Acting user |
| `action` | TEXT | NN | Action key (e.g., `pdi_sessions.submit`) |
| `entity_type` | TEXT | NN | Table/entity affected |
| `entity_id` | UUID | NN | PK of affected record |
| `before_state` | JSONB | | Row state before operation |
| `after_state` | JSONB | | Row state after operation |
| `ip_address` | INET | | Client IP |
| `user_agent` | TEXT | | Client user agent |
| `request_id` | TEXT | | Correlation ID |
| `created_at` | TIMESTAMPTZ | NN, DEFAULT now() | Log entry timestamp |

**Indexes:** `idx_al_org_id`, `idx_al_actor_user_id`, composite `idx_al_entity` (entity_type + entity_id), `idx_al_created_at`
**RLS:** Org admins and platform admins read only. No UPDATE or DELETE permitted.

---

### Additional Tables (Summary Specification)

#### `activity_logs`
Lightweight user activity stream (page views, feature interactions).
**Columns:** `id`, `org_id`, `user_id FK`, `activity_type TEXT NN`, `context JSONB`, `created_at`.
**Pagination:** Cursor-based. **RLS:** Users see own; admins see org.

#### `attachments`
General-purpose file attachments linked to any entity via polymorphic reference.
**Columns:** `id`, `org_id`, `entity_type TEXT NN`, `entity_id UUID NN`, `uploaded_by FK`, `r2_key TEXT NN`, `mime_type TEXT NN`, `file_size_bytes BIGINT`, `filename TEXT NN`, `created_at`.
**RLS:** Inherits from parent entity access policy.

#### `integration_events`
Log of all outbound integration adapter calls.
**Columns:** `id`, `org_id`, `adapter_name TEXT NN`, `method TEXT NN`, `request_payload JSONB`, `response_payload JSONB`, `status TEXT NN`, `http_status_code INTEGER`, `duration_ms INTEGER`, `created_at`.
**Immutable.** **RLS:** Platform admins only.

#### `sync_queue`
Mobile offline sync queue (server-side mirror of mobile local queue).
**Columns:** `id`, `org_id`, `user_id FK`, `device_id FK`, `operation_type TEXT NN`, `entity_type TEXT NN`, `entity_id UUID`, `payload JSONB NN`, `status TEXT NN DEFAULT 'pending'`, `conflict_detail JSONB`, `retry_count INTEGER DEFAULT 0`, `created_at`, `synced_at`.
**RLS:** Users see own queue items only.

#### `system_settings`
Platform and org-level configuration key-value store.
**Columns:** `id`, `org_id FK` (nullable = platform-wide), `key TEXT NN`, `value JSONB NN`, `description TEXT`, `is_secret BOOLEAN NN DEFAULT FALSE`, `created_at`, `updated_at`.
**Unique:** `(org_id, key)`. **RLS:** Platform admins write; org admins read non-secret keys.

#### `feature_flags`
Feature flag definitions and per-scope overrides.
**Columns:** `id`, `key TEXT NN`, `scope_type TEXT NN CHECK (scope_type IN ('global','org','branch','user'))`, `scope_id UUID` (NULL for global), `value_type TEXT NN CHECK (value_type IN ('boolean','string','number','json'))`, `bool_value BOOLEAN`, `string_value TEXT`, `number_value NUMERIC`, `json_value JSONB`, `description TEXT`, `is_enabled BOOLEAN NN DEFAULT TRUE`, `created_at`, `updated_at`.
**RLS:** Platform admins write; authenticated users read flags applicable to their context.

---

## 9. Assumptions

| ID | Assumption |
|----|------------|
| DB-01 | All timestamps are stored in UTC. Client applications handle timezone conversion for display. |
| DB-02 | UUID v4 (random) is used for all PKs. Sequential UUIDs (v7) may be adopted in a future migration if insert performance warrants it. |
| DB-03 | Supabase PgBouncer is used in transaction mode for pooled connections from Workers. |
| DB-04 | Physical deletion of records is not supported in the initial version. A data retention and purge process will be defined separately. |
| DB-05 | `panel_code` values in `damage_locations` are drawn from a platform-defined enum maintained in `system_settings`. The full panel list requires confirmation from the business team. |
| DB-06 | `sync_queue` is a server-side table mirrored in structure by the mobile local SQLite schema. |
| DB-07 | PostgreSQL full-text search via `tsvector` is sufficient for the initial release. Dedicated search infrastructure is not required at launch. |

---

*End of DATABASE_SPEC.md — Version 1.0.0*
*Document Owner: Dhoot Group Platform Engineering*
*Next Review: 2026-11-25*
