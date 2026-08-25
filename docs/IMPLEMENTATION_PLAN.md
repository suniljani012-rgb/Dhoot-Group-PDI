# IMPLEMENTATION PLAN
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** PLANNING — Requires internal consistency review before Phase 1 execution
**Last Updated:** 2026-08-25

---

## 1. ARCHITECTURE PRE-CHECKS

Before executing any phase, verify:
- [ ] All documentation in docs/ is internally consistent
- [ ] No conflicts between DATABASE_SPEC, API_SPEC, and DOMAIN_MODEL
- [ ] ASSUMPTIONS.md reviewed with product owner
- [ ] Access control matrix validated against business requirements
- [ ] Security requirements reviewed against threat model
- [ ] Environment credentials (dev) available for development

---

## 2. PHASED BUILD SEQUENCE

### PHASE 0 — Foundation (Current)
**Objective:** Documentation baseline + monorepo scaffold + architecture validation

Deliverables:
- [x] Project constitution and governance documents
- [x] All specification documents (23 docs)
- [x] Monorepo directory structure
- [x] Root configuration files (package.json, pnpm-workspace.yaml, turbo.json, biome.json)
- [x] GitHub Actions CI/CD workflows (ci, security, deploy-web, deploy-worker, database-check)
- [x] Supabase config and README
- [x] Wrangler configuration
- [ ] Package manifests for all packages (types, validation, domain, config, utilities)
- [ ] TypeScript base config (tsconfig.base.json)
- [ ] Architecture baseline document
- [ ] Risk register (initial)

Gate: All documents internally consistent. No implementation begins until gate passes.

---

### PHASE 1 — Authentication + Users + Roles + Branch Access
**Objective:** Working auth flow, user management, role-based access end-to-end

Milestone: Engineer can log in, see their branch dashboard, and log out.

Tasks:
1. Database: migrations for organizations, branches, zones, stockyards, users, roles, permissions, user_roles, devices, audit_logs
2. Database: RLS policies for all Phase 1 tables
3. Packages: types (User, Role, Branch, Device)
4. Packages: validation (auth schemas, user schemas)
5. API Worker: auth middleware (JWT validation, role extraction)
6. API Worker: /auth endpoints (login, refresh, logout, device register)
7. API Worker: /users endpoints (list, get, create, update, deactivate)
8. API Worker: /branches endpoints (list, get, create)
9. Web: Login screen
10. Web: Dashboard shell (role-aware navigation)
11. Web: User management (Admin)
12. Mobile: Login screen
13. Mobile: Biometric setup flow
14. Mobile: App lock configuration
15. Tests: Unit (validation, role checks), Integration (auth API, RLS), Security (auth bypass attempts)

Gate: Engineer login → Dashboard → Logout tested. Security tests pass.

---

### PHASE 2 — Vehicles + VIN + Assignment
**Objective:** Vehicle management, VIN scanning, PDI assignment

Milestone: Vehicle can be received, scanned, and assigned to an engineer.

Tasks:
1. Database: vehicles, vehicle_status_history, pdi_assignments tables + RLS
2. Packages: types (Vehicle, Assignment, VehicleStatus)
3. Packages: validation (VIN validation, vehicle creation schemas)
4. Packages: domain (Vehicle state machine)
5. API Worker: /vehicles endpoints (list, get, create, update status)
6. API Worker: /assignments endpoints (create, list, get, reassign)
7. Web: Vehicle list with filters and pagination
8. Web: Vehicle detail screen
9. Web: Assignment management
10. Mobile: VIN scanner (barcode + QR + manual entry)
11. Mobile: Vehicle detail screen
12. Mobile: Assignment confirmation
13. Tests: VIN validation, state machine, assignment rules, unauthorized access

Gate: Manager assigns vehicle to engineer. Engineer sees assignment on mobile. State machine transitions tested.

---

### PHASE 3 — PDI Checklist Engine
**Objective:** Complete, configurable checklist system

Milestone: Engineer completes a full inspection on the mobile app.

Tasks:
1. Database: checklist_templates, checklist_categories, checklist_items, pdi_sessions, checklist_responses tables + RLS
2. Packages: domain (Checklist engine — template selection logic)
3. Packages: validation (checklist response schemas)
4. API Worker: /checklists endpoints (template CRUD, item management)
5. API Worker: /pdi endpoints (create session, get checklist, save response, submit)
6. Web: Checklist template editor (Admin)
7. Mobile: Inspection progress screen
8. Mobile: Category screen with item list
9. Mobile: Item response capture (all response types)
10. Mobile: Autosave on every response
11. Mobile: Validation before section completion
12. Mobile: Resume inspection capability
13. Tests: Template selection per vehicle type, mandatory item enforcement, response type validation

Gate: Engineer completes full checklist start-to-finish on mobile. All mandatory items enforced. Resume works.

---

### PHASE 4 — Media + R2
**Objective:** Photo capture, upload pipeline, secure access

Milestone: Engineer captures and uploads inspection photos.

Tasks:
1. Database: attachments table + RLS
2. API Worker: /media endpoints (presign-upload, confirm-upload, get-url)
3. Storage: R2 bucket setup per environment, object naming enforcement
4. Packages: utilities (client-side image resize/compress to WebP)
5. Mobile: Photo capture with guided overlay
6. Mobile: Photo slot management (required vs optional)
7. Mobile: Upload progress indicator
8. Mobile: Offline photo queue (upload on reconnect)
9. Web: Photo viewer in inspection detail
10. Tests: Upload ownership validation, object key generation, MIME validation, size limits, presigned URL TTL

Gate: Engineer captures photo offline, reconnects, photo uploaded, visible in web admin.

---

### PHASE 5 — Damage / Repair Workflow
**Objective:** Finding capture, repair ticket management, technician workflow

Milestone: Engineer reports damage, workshop receives repair ticket.

Tasks:
1. Database: inspection_findings, damage_reports, damage_locations, damage_media, repair_tickets, repair_actions, part_usage, workshop_assignments tables + RLS
2. Packages: types (Finding, Severity, BodyArea, RepairTicket)
3. API Worker: /findings endpoints
4. API Worker: /damage endpoints
5. API Worker: /repairs endpoints
6. Web: QA review shows findings list
7. Web: Workshop repair queue
8. Mobile: Finding capture screen (body map + severity + description + photo)
9. Mobile: Damage photo attachment
10. Tests: Severity rules, evidence requirements, repair ticket creation, status transitions

Gate: Critical finding requires photo evidence. Repair ticket created. Workshop manager sees ticket.

---

### PHASE 6 — QA + Certificate
**Objective:** QA approval workflow, certificate generation

Milestone: QA approves inspection, PDF certificate available.

Tasks:
1. Database: qa_reviews, pdi_certificates tables + RLS
2. API Worker: /qa endpoints (queue, approve, reject)
3. API Worker: /certificates endpoints (generate, status, download)
4. Certificate generation: async job, PDF rendered, stored in R2
5. QR verification endpoint (public, returns minimal safe data)
6. Web: QA review screen
7. Web: Certificate viewer + QR code
8. Tests: Self-approval prevention, rejection reason required, async generation, QR verification

Gate: QA approves PDI. Certificate PDF generated and downloadable. QR code verifiable.

---

### PHASE 7 — Dashboards + Analytics
**Objective:** Role-specific dashboards with real data

Tasks:
1. Database: Dashboard aggregate views / summary tables
2. API Worker: /dashboard endpoints per role
3. Web: HO dashboard (branch comparison, KPIs, trends)
4. Web: Branch Manager dashboard
5. Web: Engineer dashboard (mobile primary)
6. Web: Workshop dashboard
7. Web: QA dashboard
8. Analytics: Date-range filters, chart library integration
9. Tests: Aggregate query correctness, authorization (role sees only own data)

Gate: Each dashboard shows real data. No cross-role data leakage. Performance within budget.

---

### PHASE 8 — Offline-First (Mobile)
**Objective:** Complete offline inspection workflow

Tasks:
1. Mobile: SQLite schema (local tables)
2. Packages: offline (Drizzle ORM setup, sync queue)
3. Sync engine: queue management, exponential backoff, idempotency
4. Conflict resolution logic
5. Sync status UI (pending jobs, upload progress, last synced)
6. Tests: Offline create, complete, reconnect, sync, conflict resolution

Gate: Engineer completes full inspection offline. All data syncs correctly on reconnect.

---

### PHASE 9 — Notifications + Device Security
**Objective:** Push notifications, app lock, device management

Tasks:
1. Database: notifications, notification_preferences tables
2. Packages: telemetry (notification helpers)
3. API Worker: /notifications endpoints
4. Notification service: event-driven dispatch
5. Push provider integration (Expo Notifications → FCM + APNs)
6. Email provider integration
7. Mobile: App lock (configurable timeout)
8. Mobile: Biometric policy enforcement
9. Mobile: Sensitive screen protection (FLAG_SECURE / UIScreen)
10. Web: In-app notification centre
11. Admin: Device management screen
12. Tests: Deduplication, delivery tracking, device revocation, biometric bypass flow

Gate: All notification events trigger delivery. App lock enforces correctly. Device revocation tested.

---

### PHASE 10 — Performance + Security Hardening
**Objective:** Meet performance budgets. Pass security audit.

Tasks:
1. Performance testing at realistic data volumes (10k, 100k, 500k, 1M records)
2. Query optimization (EXPLAIN ANALYZE on all dashboard queries)
3. Add missing composite indexes based on test results
4. Implement materialized views where dashboard tests justify
5. Security penetration test (internal or external)
6. RLS policy audit
7. OWASP Top 10 checklist review
8. Rate limit tuning
9. Logging review (ensure no PII / tokens in logs)
10. Dependency audit and update
11. Performance budget documentation update with measured results
12. DR drill execution

Gate: All performance budgets met. Security tests pass. DR drill completed.

---

### PHASE 11 — Staging + Pilot
**Objective:** Validated system in staging with pilot users

Tasks:
1. Full staging environment setup
2. Production-like data volume seed
3. Pilot user training
4. Pilot period (minimum 2 weeks)
5. Bug fixes from pilot feedback
6. Smoke test checklist
7. Go/no-go decision

Gate: Pilot users complete real inspections without critical issues. Go/no-go signed off.

---

### PHASE 12 — Production Rollout
**Objective:** Production launch

Tasks:
1. Production environment final setup
2. Production secrets configured
3. DNS and domain configuration
4. Mobile app store submission (iOS + Android)
5. Monitoring and alerting configured
6. On-call process established
7. Rollback plan documented and verified
8. Announcement to users
9. 30-day hypercare monitoring period

---

## 3. VERTICAL SLICE (First Implementation Milestone)

Before scaling out all modules, validate architecture end-to-end:

```
Login (web)
  → Role-aware Dashboard
  → Assign vehicle to engineer
  → Engineer login (mobile)
  → Scan VIN
  → View assigned vehicle
  → Create PDI
  → Complete 1 checklist category (3 items)
  → Add 1 finding (with photo)
  → Upload photo
  → Submit inspection
  → QA review (web)
  → Approve
  → Certificate generated
  → Download certificate PDF
  → Verify QR code
```

This vertical slice validates: auth, vehicle, assignment, PDI, checklist, findings, media, QA, certificate — all layers.

---

## 4. IMPLEMENTATION PRINCIPLES

- Implement ONE bounded milestone at a time
- After each milestone: typecheck + lint + unit tests + integration tests + build + migration validation + security checks + manual smoke test + git diff review + documentation update
- No "almost working" milestone exits
- Every milestone gate requires all tests to pass
- No unrelated code changes within a milestone
- No redesign without a change request

---

*End of IMPLEMENTATION_PLAN.md*
