# DESIGN SYSTEM
## Autoprime Tata PDI Management Platform — Dhoot Group

**Version:** 1.0.0
**Status:** BASELINE
**Last Updated:** 2026-08-25

---

## 1. DESIGN TOKENS

### 1.1 Color Tokens

The primary brand color is a deep professional blue aligned with Tata automotive brand direction. The semantic palette is restrained and functional.

#### Brand Colors
```css
:root {
  --color-brand-primary:       #1A3A6B; /* Deep navy — primary actions, active states */
  --color-brand-primary-light: #2C5298; /* Lighter navy — hover states */
  --color-brand-primary-dark:  #0F2445; /* Darker navy — pressed states */
  --color-brand-secondary:     #C8102E; /* Tata red — secondary accent, alerts */
  --color-brand-secondary-light: #E8364A;
}
```

#### Surface Colors
```css
:root {
  --color-surface:             #FFFFFF;
  --color-surface-elevated:    #F8F9FA;
  --color-surface-subtle:      #F1F3F5;
  --color-surface-overlay:     rgba(0, 0, 0, 0.04);
  --color-surface-inverse:     #1A1A2E;
}
```

#### Border Colors
```css
:root {
  --color-border:              #DEE2E8;
  --color-border-strong:       #B5BEC9;
  --color-border-focus:        #1A3A6B;
}
```

#### Text Colors
```css
:root {
  --color-text-primary:        #1A1A2E;
  --color-text-secondary:      #4A5568;
  --color-text-tertiary:       #718096;
  --color-text-disabled:       #A0AEC0;
  --color-text-inverse:        #FFFFFF;
  --color-text-brand:          #1A3A6B;
  --color-text-link:           #1A3A6B;
}
```

#### Semantic Colors
```css
:root {
  --color-success:             #1A7C4A;
  --color-success-light:       #EBF7F1;
  --color-success-border:      #A8DFC0;

  --color-warning:             #92600A;
  --color-warning-light:       #FEF7E8;
  --color-warning-border:      #F5D48E;

  --color-danger:              #C62828;
  --color-danger-light:        #FEECEC;
  --color-danger-border:       #F5A8A8;

  --color-info:                #1565A8;
  --color-info-light:          #EBF3FD;
  --color-info-border:         #9DC7F0;
}
```

#### Status Colors (Vehicle / PDI)
```css
:root {
  --color-status-pending:      #92600A;   /* Amber */
  --color-status-active:       #1565A8;   /* Blue */
  --color-status-pass:         #1A7C4A;   /* Green */
  --color-status-fail:         #C62828;   /* Red */
  --color-status-na:           #718096;   /* Grey */
  --color-status-ready:        #1A7C4A;   /* Green */
  --color-status-delivered:    #4A5568;   /* Muted */
}
```

> **Rule:** Status is NEVER conveyed by color alone. Every status indicator pairs color with an icon AND a text label.

---

### 1.2 Spacing Tokens

```css
:root {
  --space-0:   0px;
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
}
```

### 1.3 Border Radius Tokens

```css
:root {
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;
}
```

### 1.4 Shadow Tokens

Elevation is subtle. No decorative shadows.

```css
:root {
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.10);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05);
}
```

### 1.5 Z-Index Scale

```css
:root {
  --z-base:     0;
  --z-raised:   100;
  --z-dropdown: 200;
  --z-sticky:   300;
  --z-overlay:  400;
  --z-modal:    500;
  --z-toast:    600;
}
```

---

## 2. COMPONENT SPECIFICATIONS

### 2.1 Button Variants

| Variant | Usage |
|---------|-------|
| Primary | Main action (Submit, Approve, Confirm) |
| Secondary | Alternative action (Save Draft, Cancel) |
| Destructive | Irreversible actions (Reject, Delete) — requires confirmation |
| Ghost | Low-emphasis action |
| Icon Only | Compact icon buttons (with accessible label) |

Rules:
- Submit button disabled during active request
- Loading state shows spinner + "Please wait..." text
- Minimum touch target 44x44pt on mobile

### 2.2 Status Badge

```
[icon] [label]
```
- Icon + text always (never color alone)
- Compact, no decorative padding

### 2.3 Data Table

- Sortable column headers (web)
- Pagination controls
- Row click navigates to detail
- Empty state with context-appropriate message
- Loading skeleton matches table structure
- Filter bar above table
- Row selection for bulk actions (where applicable)

### 2.4 Cards (Admin Dashboard)

- Subtle shadow-sm only
- Clear heading hierarchy
- Data presented compactly
- No decorative illustrations
- No excessive padding

### 2.5 Form Fields

- Label above field (not inside)
- Error message below field in danger color with icon
- Focus ring uses --color-border-focus
- Required indicator: asterisk with accessible label

### 2.6 Checklist Item (Mobile)

```
[Category Badge]
[Item Code] [Title]
[Instructions — collapsed by default, expandable]

[NA]  [FAIL]  [PASS ✓]    <- Touch targets min 44pt height
```

### 2.7 Inspection Progress

```
Category 3 of 8 — Exterior Lighting
[=====-----] 62%

Item 5 of 12
[■■■■□□□□□□□□]
```

---

## 3. ICON SYSTEM

- Use a single consistent icon library (Lucide React for web; Lucide React Native for mobile)
- Icons always paired with text label or accessible aria-label
- No custom decorative icons unless business-required
- Icon sizes: 16px (small), 20px (default), 24px (large)

---

## 4. MOTION / ANIMATION

- Transitions only where they aid comprehension (not decoration)
- Duration: 150ms for micro-interactions, 250ms for panel reveals
- Easing: ease-out for enter, ease-in for exit
- All motion respects `prefers-reduced-motion: reduce`
- No looping animations in data-dense views

---

## 5. DARK MODE

- Architecture supports CSS custom property theming
- Dark mode implementation deferred to post-v1.0 (see ASSUMPTIONS.md)
- Tokens defined to accommodate future dark theme addition

---

## 6. PRINT / PDF (CERTIFICATE)

PDI certificate rendered for PDF output:
- Mono-spaced numeric data for scanability
- High contrast (print-safe)
- Tata / Autoprime branding (logo placeholder)
- QR code for verification
- Signature fields
- No decorative web-specific effects

---

*End of DESIGN_SYSTEM.md*
