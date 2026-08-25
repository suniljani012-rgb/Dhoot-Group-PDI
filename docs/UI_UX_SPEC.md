# UI/UX SPECIFICATION
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. DESIGN PHILOSOPHY

The platform must feel like a serious automotive enterprise operations system. It must be:

- **Restrained:** No decoration for its own sake
- **Clean:** High signal-to-noise ratio
- **Precise:** Every element earns its space
- **Professional:** Matches the authority of an enterprise workflow tool
- **Functional:** Interactions optimize for speed and accuracy
- **Accessible:** Meets WCAG 2.1 AA as baseline

Not:
- Neon / gradient-heavy
- Glassmorphism excessive
- Template marketplace aesthetic
- AI-generated dashboard appearance
- Startup landing page style

---

## 2. AUDIENCE CONTEXT

### Mobile Engineer (Stockyard / Workshop)
- May have gloves or wet hands
- Operating in bright sunlight
- One hand may be occupied
- Under time pressure
- Weak or intermittent network
- Design response: large touch targets (minimum 44x44pt), high contrast, minimal typing, camera-first, offline-capable, clear current-state indicator

### Web Admin / Manager (Office / Desk)
- Focused on data density
- Multiple tasks simultaneously
- Desktop-first for complex dashboards
- Design response: dense data tables, filters, keyboard shortcuts, export controls, drill-down navigation

---

## 3. SCREEN INVENTORY

### Mobile Screens

| Screen | Role | Description |
|--------|------|-------------|
| Splash | All | App initialization, biometric check |
| Login | All | Employee ID + password |
| Biometric Prompt | Mobile users | Face ID / Fingerprint unlock |
| App Lock | All (mobile) | Lock screen when timed out |
| Home / Dashboard | Engineer | Assigned inspections, quick actions |
| Task List | Engineer | All assigned tasks with status |
| Scan VIN | Engineer | Camera scanner + manual entry |
| Vehicle Detail | Engineer | Vehicle info + current status |
| Create PDI | Engineer | Start new inspection |
| Inspection Progress | Engineer | Category list with completion status |
| Checklist Category | Engineer | Items in a category with responses |
| Item Response | Engineer | Individual item response capture |
| Photo Capture | Engineer | Guided camera capture with overlay |
| Finding Capture | Engineer | Structured damage/issue entry |
| Damage Body Map | Engineer | Visual body area selection |
| Sync Status | Engineer | Pending uploads, sync progress |
| Notifications | All | Notification list |
| Profile | All | Account, biometric settings, app lock config |

### Web Screens

| Screen | Role | Description |
|--------|------|-------------|
| Login | All | Employee ID + password |
| Overview Dashboard | HO/Regional/Branch | KPI tiles, trend charts |
| Vehicle List | Manager+ | Table with filters, search, pagination |
| Vehicle Detail | Manager+ | VIN, history, PDI records, media |
| PDI Queue | Branch/QA | Pending, in-progress, completed |
| PDI Detail | Manager/QA | Full inspection view |
| QA Review | QA Manager | Checklist review, approve/reject |
| Repair Queue | Workshop | Open tickets, priority, aging |
| Repair Detail | Workshop | Full ticket + actions |
| Certificate View | Manager+ | PDF preview + QR |
| Analytics | HO/Regional | Charts, trends, comparisons |
| Reports | Manager+ | Report generation, download |
| User Management | Admin | Create, edit, deactivate users |
| Role Management | Admin | Role assignment |
| Branch Management | Admin | Branch, stockyard config |
| Checklist Templates | Admin | Template editor |
| Settings | Admin | System config |
| Audit Logs | Admin/Manager | Filterable event log |
| Notifications | All | Notification list + preferences |
| Profile | All | Account settings |

---

## 4. NAVIGATION

### Mobile Navigation Structure

```
Bottom Tabs:
├── Home (Dashboard)
├── Tasks (Inspection list)
├── Scan (VIN scanner — prominent)
├── Notifications
└── Profile

Context-sensitive FAB:
└── Start Inspection (on Task List when vehicle selected)
```

### Web Navigation Structure

```
Left Sidebar:
├── Overview
├── Vehicles
│   ├── All Vehicles
│   └── Pending Queue
├── PDI
│   ├── Active Inspections
│   └── History
├── Repairs
├── QA
│   ├── Pending Approvals
│   └── Reinspection Queue
├── Branches (Manager+)
├── Users (Admin)
├── Reports
├── Analytics
├── Audit Logs (Admin)
├── Notifications
└── Settings (Admin)
```

Navigation is role-aware. Items are not shown for unauthorized roles. Backend authorization is still enforced regardless of navigation visibility.

---

## 5. UI STATES — ALL SCREENS

Every screen MUST implement all applicable states:

| State | Description |
|-------|-------------|
| Loading | Data fetch in progress (skeleton preferred) |
| Skeleton | Structural placeholder matching content shape |
| Empty | No data available (clear message + action) |
| Success | Data loaded, normal display |
| Error | Network or server failure (message + retry) |
| Offline | No network (indicator + offline content if available) |
| Unauthorized | User lacks permission (clear message, no stack trace) |
| Forbidden | Authenticated but not authorized for this resource |
| Stale | Data may be outdated (subtle indicator) |
| Syncing | Local changes being uploaded |
| Synced | All local changes persisted to server |
| Partial Failure | Some items failed sync |
| Retry | User-triggered re-attempt in progress |

---

## 6. LOADING EXPERIENCE

- Use skeletons for structured content (tables, cards, lists)
- Use subtle progress indicators for actions (save, submit, upload)
- Show upload progress as percentage for media
- Show sync progress in sync status screen
- Use optimistic UI only for safe local-only operations (marking item as read, collapsing section)
- Never show fake progress that misrepresents actual backend state

---

## 7. FORMS

All forms must have:
- Accessible labels (not placeholder-as-label)
- Field-level validation with inline error messages
- Required field indicators
- Submit button disabled during active request
- Server error mapping to field or form level
- Clear recovery path on error
- Keyboard-aware behavior (mobile: correct keyboard type per field)
- Shared Zod validation schema (same schema used in API)

---

## 8. MOBILE INSPECTION FLOW UX

### Sequencing
- Engineer guided through categories in defined order
- Cannot skip mandatory items without explicit NA justification
- Progress bar shows category count and item count

### Touch Targets
- Minimum 44x44 points (iOS HIG)
- PASS action: full-width prominent tap target
- FAIL action: clearly distinct from PASS (color + icon + label)

### Photo Capture
- Camera opens with overlay showing expected photo composition
- Preview shown immediately after capture
- Retake option always available before confirmation
- Upload queued locally if offline

### Autosave
- Every response saved locally immediately on interaction
- Save indicator shown briefly
- No data loss on app backgrounding

---

## 9. TYPOGRAPHY SYSTEM

System font stack (no custom fonts unless business requirement raised):

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;
```

| Scale | Usage | Size | Weight |
|-------|-------|------|--------|
| Display | Page titles (admin dashboards) | 2rem / 32px | 600 |
| H1 | Section headings | 1.5rem / 24px | 600 |
| H2 | Card headings | 1.25rem / 20px | 600 |
| H3 | Sub-section | 1rem / 16px | 600 |
| Body | Default content | 0.875rem / 14px | 400 |
| Body Large | Important content | 1rem / 16px | 400 |
| Caption | Secondary info | 0.75rem / 12px | 400 |
| Data | Tables, metrics | 0.875rem / 14px | 500 (tabular) |
| Overline | Labels above content | 0.6875rem / 11px | 500 uppercase |

---

## 10. ACCESSIBILITY

- WCAG 2.1 AA contrast ratios minimum
- All interactive elements have visible focus states
- Non-decorative icons have accessible labels
- Touch targets minimum 44x44pt (mobile)
- Keyboard navigation functional on all web forms and tables
- Status never conveyed by color alone (always paired with icon + text label)
- Reduced motion: animations respect prefers-reduced-motion
- Screen reader semantics: proper ARIA roles where HTML semantics insufficient

---

## 11. RESPONSIVE BREAKPOINTS (WEB)

| Breakpoint | Name | Min Width |
|------------|------|-----------|
| Mobile | sm | 0px |
| Tablet | md | 768px |
| Desktop | lg | 1024px |
| Large Desktop | xl | 1280px |

- Mobile-first inspection views
- Desktop-first dense admin dashboard views
- Sidebar collapses to overlay on tablet
- Data tables adapt to horizontal scroll on mobile

---

## 12. AI-GENERATED UI PREVENTION CHECKLIST

Before shipping any UI component, verify:
1. Does this solve a real workflow problem?
2. Is this component justified by a functional requirement?
3. Does it match the design system tokens?
4. Is the hierarchy clear?
5. Is this interaction faster than the previous screen design?
6. Is the visual element decorative or functional?
7. Could this be simplified?
8. Is it consistent across web and mobile (where applicable)?

---

*End of UI_UX_SPEC.md*
