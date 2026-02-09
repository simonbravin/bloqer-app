# Theme normalization report — Design system tokens

**Date**: 2026-02-05  
**Scope**: Replace hardcoded UI colors with semantic tokens; add theme layer and surface utilities.

---

## 1. Audit summary

**Patterns searched (ripgrep):**

- `bg-white`, `bg-black`, `text-white`, `text-black`
- `bg-gray-*`, `text-gray-*`, `border-gray-*`
- `bg-slate-*`, `text-slate-*`, `border-slate-*`
- `ring-orange-*`, `bg-blue-*`, `text-blue-*`, `bg-amber-*`, `border-amber-*`
- `bg-[#...]`, `text-[#...]`, `style={{ color: ... }}`

**Findings:**  
Hardcoded colors were present in layouts (sidebars, auth cards), shared components (tables, forms, budget, finance, reports, schedule, certifications), and many dashboard/report/project pages. Dark mode often looked like “dark sidebar + light content” because content used fixed light colors.

---

## 2. Changes applied

### 2.1 globals.css

- **Sidebar tokens**: Added `--sidebar` and `--sidebar-foreground` in `:root` and `.dark` (and in theme templates) so sidebars use semantic tokens.
- **Theme templates**: Added `[data-theme="midnight"]` and `[data-theme="slate"]` with overrides for background, foreground, card, sidebar, border, input, muted, primary, secondary, accent, popover, ring. Use with `class="dark"` on `<html>`.
- **Surface utilities**: Added `erp-page`, `erp-panel`, `erp-input-surface`, and `erp-table-surface` (see THEME-CONTRACT.md).
- **@theme**: Exposed `--color-sidebar` and `--color-sidebar-foreground` for Tailwind.

### 2.2 Layouts

- **global-sidebar.tsx**: `bg-slate-900` → `bg-sidebar`, `border-slate-800` → `border-border`, `text-white` → `text-sidebar-foreground`, nav active/hover → `bg-muted text-sidebar-foreground` / `text-muted-foreground hover:bg-muted hover:text-sidebar-foreground`, footer `text-slate-400` → `text-muted-foreground`.
- **project-sidebar.tsx**: Same pattern (sidebar, border, nav, sub-links).
- **super-admin layout.tsx**: Login gate and main layout use `bg-background`, card uses `border-border bg-card`, header strip `border-border bg-muted/80`, titles `text-foreground`, description `text-muted-foreground`, icon `text-accent`.
- **login-page-card.tsx**: Card container `bg-card`, tab strip `border-border bg-muted/50`, active tab `border-accent bg-accent/10 text-accent`, inactive tab `text-muted-foreground hover:text-foreground`, Google button area `border-border bg-background`, divider `bg-border`, text `text-muted-foreground`. Left brand block kept custom purple background; text uses `text-primary-foreground` for contrast.

### 2.3 Shared components (sample)

- **budget-line-table.tsx**: Empty state and table container use `border-border bg-card`, `text-muted-foreground` / `text-foreground`. Table header row `bg-muted` with `text-muted-foreground`. Rows `border-border hover:bg-muted/50`, cells `text-foreground` / `text-muted-foreground`. Footer strip `bg-muted text-foreground`. Client notice box `border-border bg-muted` and `text-muted-foreground`. Delete button `text-destructive`.
- **budget-lines-client.tsx**: Input and label use `border-input bg-background text-foreground`, `text-muted-foreground`.
- **budget-tree-table-client.tsx**: Table header `bg-muted`, row `border-border hover:bg-muted/80`, header cells `text-muted-foreground`.
- **planilla-compute-view.tsx**: Card and empty state use `border-border bg-card`, `text-muted-foreground`.
- **project-form.tsx**: Form container `border-border bg-card`, inputs `border-input bg-background text-foreground`.
- **company-transactions-list-client.tsx**: Headings `text-foreground`, filters and table container `border-border bg-card`, table header `border-border bg-muted`, rows and footer `border-border`, text `text-foreground` / `text-muted-foreground`.
- **project-transactions-list-client.tsx**: Container `border-border bg-card`.
- **report-builder.tsx**: Inputs `border-input bg-background text-foreground`, checkboxes `border-border`.
- **reports/page.tsx**: Cards `border-border bg-card`, links `hover:border-accent`, titles and descriptions `text-foreground` / `text-muted-foreground`, empty state `border-border`, `text-muted-foreground`.
- **reports/new/page.tsx**: Title and breadcrumb use `text-foreground`, `text-muted-foreground`.

### 2.4 Pages (titles and cards)

Many dashboard and report pages still contain patterns like `text-slate-900 dark:text-white` or `text-gray-900 dark:text-white` for titles and `text-slate-500 dark:text-slate-400` for descriptions. **Recommendation:** Run a follow-up pass to replace these with `text-foreground` and `text-muted-foreground` (see “Remaining work” below).

---

## 3. Top offending files (before → after)

| Area | File(s) | Change |
|------|---------|--------|
| Sidebars | `global-sidebar.tsx`, `project-sidebar.tsx` | All slate/navy/white replaced with `sidebar`, `border`, `muted`, `sidebar-foreground`, `muted-foreground`. |
| Auth | `login-page-card.tsx`, `super-admin/layout.tsx` | Cards and panels use `card`, `border`, `muted`, `accent`, `foreground`, `background`. |
| Budget tables | `budget-line-table.tsx`, `budget-tree-table-client.tsx`, `planilla-compute-view.tsx` | Tables use `card`, `border`, `muted`, `foreground`, `muted-foreground`, `destructive`. |
| Finance | `company-transactions-list-client.tsx`, `project-transactions-list-client.tsx` | Containers and tables use `card`, `border`, `muted`, `foreground`. |
| Reports | `report-builder.tsx`, `reports/page.tsx`, `reports/new/page.tsx` | Inputs and cards use `input`, `background`, `foreground`, `border`, `card`, `muted-foreground`, `accent`. |
| Projects | `project-form.tsx` | Form and inputs use `card`, `border`, `input`, `background`, `foreground`. |

---

## 4. What to verify in the UI

- **Sidebars**: Global and project sidebars: dark surface, light text, active/hover states readable in both light and dark mode.
- **Auth**: Login and super-admin login: card and tab strip respect theme; no white/gray flashes in dark mode.
- **Projects list / dashboard**: Page background and cards follow `background` and `card`; headings and body text use `foreground` and `muted-foreground`.
- **Tables**: Budget line table, company transactions, report preview: header row uses `muted`, rows and borders use `border` and `muted/50` hover.
- **Dropdowns / inputs**: Report builder and project form: inputs use `input` and `background`; focus ring uses `ring`.

---

## 5. Remaining work (follow-up)

- **Page titles and descriptions**: Replace remaining `text-slate-900 dark:text-white`, `text-gray-900 dark:text-white`, `text-slate-500 dark:text-slate-400`, `text-slate-900 dark:text-slate-100` with `text-foreground` and `text-muted-foreground` across:
  - Predefined report pages, certifications, finance, projects, team, schedule, suppliers, documents, quality, daily reports, etc.
- **Gantt / schedule**: `gantt-data-table.tsx`, `gantt-timeline-dynamic.tsx`, `schedule-view-client.tsx`: replace `bg-white`, `text-white`, `bg-slate-*`, `text-slate-*` with `card`, `muted`, `foreground`, `muted-foreground`.
- **Certifications**: `cert-form.tsx`, `cert-detail.tsx`, `cert-edit-form.tsx`: forms and tables to tokens.
- **Super-admin**: `super-admin-sidebar.tsx`, `super-admin-login-form.tsx`, and super-admin pages: replace amber/slate with `accent`, `border`, `card`, `foreground`, `muted-foreground`.
- **Primary action buttons**: Replace `bg-blue-600 text-white hover:bg-blue-700` with `bg-primary text-primary-foreground` (or Button variant) where appropriate.
- **Status pills / badges**: Where custom blue/amber/slate are used for status, prefer `status-info`, `status-warning`, `status-success`, `status-danger`, `status-neutral` or existing Badge variants that use these.
- **Charts and inline styles**: `cashflow-chart.tsx` uses `style={{ color: entry.color }}`; keep or map to `--chart-*` / status tokens where possible.
- **Brand purple on login**: Left panel still uses `BRAND_PURPLE`; acceptable as a single brand block. If desired, introduce `--brand-hero` and use it only there.

---

## 6. Theme template usage

To switch to a theme template (after enabling dark mode):

```html
<html class="dark" data-theme="midnight">
<!-- or -->
<html class="dark" data-theme="slate">
```

Templates only override CSS variables in `globals.css`; no component code changes required.

---

## 7. Deliverables

- **A) This report**: `docs/05-frontend/THEME-NORMALIZATION-REPORT.md`
- **B) Theme Contract**: `docs/05-frontend/THEME-CONTRACT.md` — token list, usage rules, surface utilities, theme templates.
- **C) globals.css**: New sidebar tokens, `[data-theme="midnight"]`, `[data-theme="slate"]`, and surface utility classes.
- **D) Code changes**: Layouts (sidebars, auth), budget tables, finance lists, report builder, reports page, project form; partial coverage of pages (see “Remaining work”).
