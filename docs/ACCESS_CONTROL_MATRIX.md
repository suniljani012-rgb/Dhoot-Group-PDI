# ACCESS CONTROL MATRIX
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

> This matrix defines what each role CAN do. Anything not listed is DENIED by default.
> Both API-layer checks AND database-layer RLS must enforce these rules.

---

## 1. ROLE DEFINITIONS

| Role | Code | Description |
|------|------|-------------|
| Super Admin | SUPER_ADMIN | System-wide administration, cross-org |
| HO Admin | HO_ADMIN | Head Office — all branches in organization |
| Regional Manager | REGIONAL_MANAGER | Multiple branches in assigned region |
| Branch Manager | BRANCH_MANAGER | Single branch — all operations |
| PDI Engineer | PDI_ENGINEER | Stockyard/workshop — inspection execution |
| Workshop Manager | WORKSHOP_MANAGER | Workshop — repair ticket management |
| Technician | TECHNICIAN | Workshop — repair task execution |
| QA Manager | QA_MANAGER | Quality approvals |
| Viewer | VIEWER | Read-only reporting access |

---

## 2. VEHICLE ACCESS

| Action | SUPER_ADMIN | HO_ADMIN | REGIONAL_MANAGER | BRANCH_MANAGER | PDI_ENGINEER | WORKSHOP_MANAGER | TECHNICIAN | QA_MANAGER | VIEWER |
|--------|:-----------:|:--------:|:----------------:|:--------------:|:------------:|:----------------:|:----------:|:----------:|:------:|
| View all vehicles (org-wide) | ✓ | ✓ | — | — | — | — | — | — | — |
| View vehicles (region) | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| View vehicles (branch) | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ |
| View assigned vehicles only | — | — | — | — | ✓ | — | — | — | — |
| Create vehicle | ✓ | ✓ | — | ✓ | — | — | — | — | — |
| Update vehicle details | ✓ | ✓ | — | ✓ | — | — | — | — | — |

---

## 3. PDI ASSIGNMENT

| Action | SUPER_ADMIN | HO_ADMIN | BRANCH_MANAGER | PDI_ENGINEER | QA_MANAGER |
|--------|:-----------:|:--------:|:--------------:|:------------:|:----------:|
| Assign PDI to engineer | ✓ | ✓ | ✓ | — | — |
| Reassign PDI | ✓ | ✓ | ✓ | — | — |
| View assignment | ✓ | ✓ | ✓ | Own only | ✓ |

---

## 4. PDI INSPECTION

| Action | PDI_ENGINEER | BRANCH_MANAGER | QA_MANAGER | SUPER_ADMIN/HO_ADMIN |
|--------|:------------:|:--------------:|:----------:|:--------------------:|
| Start inspection (assigned vehicle) | ✓ | — | — | ✓ |
| Record checklist responses | ✓ (own session) | — | — | — |
| Add findings | ✓ (own session) | — | — | — |
| Capture media | ✓ (own session) | — | — | — |
| Submit inspection | ✓ (own session) | — | — | — |
| View own inspection | ✓ | — | — | — |
| View all branch inspections | — | ✓ | ✓ | ✓ |
| Edit submitted inspection | — | — | — | ✓ (with audit) |
| CANNOT approve own PDI | ✗ (server enforced) | — | — | — |

---

## 5. QA REVIEW

| Action | QA_MANAGER | BRANCH_MANAGER | SUPER_ADMIN/HO_ADMIN | PDI_ENGINEER |
|--------|:----------:|:--------------:|:--------------------:|:------------:|
| View QA queue | ✓ | ✓ (read) | ✓ | — |
| Approve PDI | ✓ (not own submission) | — | ✓ | — |
| Reject PDI | ✓ | — | ✓ | — |
| Add QA notes | ✓ | — | ✓ | — |
| View QA history | ✓ | ✓ | ✓ | Own PDI only |
| CANNOT approve own submission | ✗ (server enforced) | — | — | — |

---

## 6. REPAIR WORKFLOW

| Action | WORKSHOP_MANAGER | TECHNICIAN | QA_MANAGER | BRANCH_MANAGER |
|--------|:----------------:|:----------:|:----------:|:--------------:|
| View repair queue | ✓ | Own only | ✓ (read) | ✓ (read) |
| Assign technician | ✓ | — | — | — |
| Update repair status | ✓ | Own ticket | — | — |
| Log parts used | ✓ | ✓ (own) | — | — |
| Close repair ticket | ✓ | — | — | — |

---

## 7. CERTIFICATES AND REPORTS

| Action | SUPER_ADMIN | HO_ADMIN | REGIONAL_MANAGER | BRANCH_MANAGER | PDI_ENGINEER | QA_MANAGER | VIEWER |
|--------|:-----------:|:--------:|:----------------:|:--------------:|:------------:|:----------:|:------:|
| View certificate | ✓ | ✓ | ✓ | ✓ | Own PDI | ✓ | ✓ |
| Download certificate | ✓ | ✓ | ✓ | ✓ | Own PDI | ✓ | ✓ |
| Generate report | ✓ | ✓ | ✓ | ✓ | — | — | — |

---

## 8. ADMINISTRATION

| Action | SUPER_ADMIN | HO_ADMIN | BRANCH_MANAGER |
|--------|:-----------:|:--------:|:--------------:|
| Create user | ✓ | ✓ | ✓ (branch only) |
| Edit user | ✓ | ✓ | ✓ (branch only) |
| Deactivate user | ✓ | ✓ | ✓ (branch only) |
| Assign role | ✓ | ✓ | Limited roles only |
| Create branch | ✓ | ✓ | — |
| Create checklist template | ✓ | ✓ | — |
| Edit checklist template | ✓ | ✓ | — |
| Deactivate template | ✓ | ✓ | — |
| View audit logs | ✓ | ✓ | ✓ (branch only) |
| Delete audit logs | ✗ | ✗ | ✗ |
| Revoke device | ✓ | ✓ | ✓ (branch only) |
| Manage feature flags | ✓ | — | — |

---

## 9. AUDIT LOG ACCESS

| Action | All roles |
|--------|-----------|
| Read audit logs | Scoped to own branch unless HO_ADMIN+ |
| Create audit entries | System only (never directly by user) |
| Edit audit entries | FORBIDDEN for all roles |
| Delete audit entries | FORBIDDEN for all roles |

---

## 10. SCOPING RULES

- **Branch-scoped roles** (BRANCH_MANAGER, PDI_ENGINEER, WORKSHOP_MANAGER, TECHNICIAN, QA_MANAGER, VIEWER): Can only access data belonging to their assigned branch.
- **Region-scoped roles** (REGIONAL_MANAGER): Can access data for all branches in their assigned region.
- **Organization-scoped roles** (HO_ADMIN): Can access all branches in their organization.
- **System roles** (SUPER_ADMIN): Cross-organization access.

RLS policies enforce these scopes at the database layer using `auth.uid()` and role metadata joined from user_roles table.

---

*End of ACCESS_CONTROL_MATRIX.md*
