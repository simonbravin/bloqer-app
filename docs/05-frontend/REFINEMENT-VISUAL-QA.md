# Visual QA Checklist — UI Refinement

Use this checklist after applying the refinement patch. Compare **before** (ad-hoc spacing/typography) vs **after** (utilities + tokens).

---

## 1. Projects list page

| Area | Before | After |
|------|--------|--------|
| Page title | Inconsistent text-2xl / font-semibold / text-slate-900 | `erp-page-title` or PageHeader with tokens |
| Filter bar | Mixed h-9 / h-10, gaps | Search + selects h-10, gap-2, aligned |
| Table header | px-3 / px-4 mixed | TableHead h-10 px-3 text-muted-foreground |
| Table rows | Hover may vary | hover:bg-muted/50, transition-colors |
| Empty state | text-slate-300 icon, ad-hoc padding | text-muted-foreground, p-8 or p-12 |
| Primary button | bg-blue-600 | bg-primary text-primary-foreground |

**Verify:** List loads, sort/filter work, empty state shows when no projects, focus ring on search and buttons.

---

## 2. Project dashboard

| Area | Before | After |
|------|--------|--------|
| Cards | Mixed p-4 / p-6 | Consistent p-6 (or erp-card-body) |
| Chart containers | min-h-[280px] etc. | Same; ensure border-border bg-card |
| Section titles | text-lg / font-semibold mixed | erp-section-title |
| KPI cards | Consistent spacing | gap-4, same padding |

**Verify:** Cards align, charts render, export button has focus ring.

---

## 3. Budget tables (tree + lines)

| Area | Before | After |
|------|--------|--------|
| Table container | border-border bg-card | Same |
| Header row | bg-muted text-muted-foreground | Same; h-10 or py-2 |
| Cell padding | px-3 py-2 | Consistent; optional erp-table-compact |
| Numeric cells | text-right tabular-nums | Same |
| Empty state | text-muted-foreground | Same |

**Verify:** Tree expand/collapse, line table scrolls, hover on rows, no layout shift.

---

## 4. Finance transactions list

| Area | Before | After |
|------|--------|--------|
| Filters | Same height (h-10), gap-2 | Aligned with projects list |
| Table | border-border, bg-muted header | Same |
| Row hover | hover:bg-muted/50 | Same |
| Primary button (Nueva transacción) | bg-primary | Same |

**Verify:** Filters work, table sorts, focus order logical, modal opens/closes with focus trap.

---

## 5. Reports builder

| Area | Before | After |
|------|--------|--------|
| Inputs / selects | border-gray-300 dark:… | border-input bg-background h-10 text-foreground |
| Labels | Consistent mt-1 | Same |
| Section spacing | gap-4 | Same |

**Verify:** All form controls have focus-visible ring, no hardcoded gray/white.

---

## 6. Gantt / schedule view

| Area | Before | After |
|------|--------|--------|
| Toolbar | Button sizes consistent | h-10 or size="sm" |
| Empty state (no schedule) | border-slate-300, text-slate-* | border-border, erp-page-title, erp-section-desc |
| Timeline / data table | bg-card, borders | Same tokens |
| Focus | Focus visible on buttons/inputs | ring-ring |

**Verify:** Toolbar buttons same height, empty state centered, focus on date range and actions.

---

## Global checks

- **Headers:** PageHeader and standalone h1 use tokens (text-foreground / erp-page-title); no text-slate-900 or text-white.
- **Panels:** Cards use bg-card border-border; padding p-4 or p-6.
- **Buttons:** Primary = bg-primary; destructive = bg-destructive; all show focus-visible ring.
- **Inputs:** h-10, border-input, bg-background, focus-visible:ring-ring.
- **Tables:** Header bg-muted (or table-head token), row hover muted/50, borders border-border.
- **Motion:** No layout shift on hover/focus; transitions subtle (opacity/scale, not color).
