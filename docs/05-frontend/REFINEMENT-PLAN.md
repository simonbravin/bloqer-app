# UI Refinement Plan — Structure, Hierarchy, Spacing, Motion

**Goal:** Modern, premium, consistent ERP UI without changing the token contract. Focus: typography, spacing, borders, shadows, focus, hover, motion.

**Scope:** apps/web (Next.js App Router, Tailwind, shadcn). No new color tokens; no business logic changes.

---

## Audit summary (patterns searched)

| Pattern | Purpose |
|--------|--------|
| `text-(xs\|sm\|base\|lg\|xl\|2xl)` | Typography scale consistency |
| `font-(normal\|medium\|semibold\|bold)` | Weight consistency |
| `p-4`, `p-6`, `p-8`, `px-4`, `px-6`, `py-2`, `py-3`, `py-4` | Panel/card padding |
| `h-9`, `h-10`, `h-11`, `h-12` | Input/button height |
| `rounded`, `rounded-md`, `rounded-lg` | Radius consistency |
| `shadow`, `shadow-sm`, `shadow-lg` | Shadow usage |
| `border-slate-`, `border-gray-`, `bg-white` | Leftover hardcoded colors (fix to tokens) |

**Primary screens audited:** Projects list, Project dashboard, Budget tables, Finance transactions list, Reports builder, Gantt/schedule.

---

## Prioritized refinement list (18 items)

| # | What | Why | Where | Effort | Risk |
|---|-----|-----|--------|--------|------|
| 1 | **Typography scale** | Page title / section title / body / helper inconsistent (text-2xl vs text-xl, font-semibold vs font-bold). | globals.css utilities + page headers | Low | Low |
| 2 | **PageHeader tokens** | Still uses border-slate-200, bg-white, text-slate-*. | components/layout/page-header.tsx | Low | Low |
| 3 | **Button destructive token** | Button variant uses bg-red-600 instead of destructive token. | components/ui/button.tsx | Low | Low |
| 4 | **Button default height** | Default size has no h-* so height can vary; standardize h-10. | components/ui/button.tsx | Low | Low |
| 5 | **Panel/card padding** | Normalize to single scale (e.g. p-4 for compact, p-6 for default). | erp-panel, erp-card, Card usage | Medium | Low |
| 6 | **Table cell padding** | TableHead/TableCell use px-3; some tables use px-4 py-3. Standardize to px-3 py-2 (dense) or px-4 py-3. | ui/table.tsx + erp-table-* | Low | Low |
| 7 | **Table header height** | TableHead h-10; ensure all list tables use same. | ui/table.tsx | Low | Low |
| 8 | **Filter bar alignment** | Search + selects: same height (h-10), gap-2, vertical align. | Projects list, Finance list, Reports | Medium | Low |
| 9 | **Empty state consistency** | Icon size (h-12 w-12), text (text-muted-foreground), padding (p-8 or p-12). | All 6 primary screens | Medium | Low |
| 10 | **Focus visible** | Ensure focus-visible:ring-2 focus-visible:ring-ring on all interactive elements; no focus: only. | Button, Input, Select, links | Low | Low |
| 11 | **Hover/active consistency** | Buttons: opacity or scale, not color change. Tables: hover:bg-muted/50. | Button variants, TableRow | Low | Low |
| 12 | **Badge padding/shape** | badge-* already use rounded-md px-2 py-0.5 text-xs; ensure no ad-hoc badges. | Status badges usage | Low | Low |
| 13 | **Sidebar item spacing** | Nav items: consistent py-2.5, gap-3, icon h-5 w-5. | global-sidebar, project-sidebar | Low | Low |
| 14 | **Modal/dialog padding** | Content area p-6; footer gap-2. | Dialog, AlertDialog | Low | Low |
| 15 | **Polish layer (motion + shadow)** | CSS vars for duration/easing; shadow utilities from tokens. | globals.css | Low | Low |
| 16 | **Compact table utility** | Optional .erp-table-compact for denser tables (py-1.5, text-xs). | globals.css | Low | Low |
| 17 | **Reports builder inputs** | Align input height and label spacing with erp-input-surface. | report-builder.tsx, query-builder.tsx | Medium | Low |
| 18 | **Gantt toolbar** | Consistent button sizes and spacing with rest of app. | gantt-control-panel.tsx, schedule-view-client.tsx | Low | Low |

---

## Implementation order

1. **Shared / globals:** Polish layer (motion, shadow), typography utilities, Button/PageHeader/Table fixes, compact table utility.
2. **Layout:** PageHeader tokens; sidebar spacing already consistent.
3. **Primary screens:** Projects list (filters, empty state), Project dashboard (cards padding), Budget tables (already use erp-table-*), Finance list (filters, empty state), Reports builder (inputs), Gantt (toolbar, empty state).

---

## Typography scale (standard)

| Role | Class / utility | Use |
|------|-----------------|-----|
| Page title | `text-2xl font-semibold text-foreground` or `erp-page-title` | H1 on page |
| Section title | `text-lg font-semibold text-foreground` or `erp-section-title` | H2 |
| Section description | `text-sm text-muted-foreground` or `erp-section-desc` | Below section title |
| Table header | `text-sm font-medium text-muted-foreground` | th |
| Body | `text-sm text-foreground` | Default content |
| Helper / caption | `text-xs text-muted-foreground` | Labels, hints |

---

## Spacing scale (standard)

| Context | Padding |
|---------|---------|
| Page container | px-4 py-6 sm:px-6 lg:px-8 (erp-view-container) |
| Card / panel | p-4 (compact) or p-6 (default) |
| Table cell | px-3 py-2 (dense) or px-4 py-3 |
| Filter bar | gap-2, controls h-10 |
| Empty state | p-8 or p-12 |
| Modal content | p-6 |

---

## Accessibility (checks)

- **Focus visible:** All buttons, inputs, selects, links must show focus-visible ring (ring-ring). No outline: none without ring replacement.
- **Contrast:** Rely on tokens (foreground on background, muted-foreground); no manual gray that reduces contrast.
- **Keyboard:** Tab order logical; no traps in modals (focus trap + escape to close).
- **Motion:** Prefer reduced-motion where supported (transition only when needed).

---

## PR-style patch summary (applied)

### globals.css
- **Polish layer:** `--shadow-dropdown`, `--motion-fast/base/slow`, `--motion-ease`; slight shadow-card tweak.
- **Typography:** `erp-page-title` (text-2xl font-semibold), `erp-section-title` (text-lg font-semibold), `erp-section-desc` (text-sm text-muted-foreground).
- **Table:** `.erp-table-compact` for denser th/td (px-3 py-1.5 text-xs).
- **Transition:** `.erp-transition-colors` with motion vars.

### Shared components
- **Button:** Destructive variant uses `bg-destructive text-destructive-foreground`; default size `h-10`, lg `h-11`; transition-opacity duration-200.
- **Input:** `bg-background text-foreground`, `focus-visible:ring-ring`, `transition-colors duration-150`.
- **Table (TableRow):** `transition-colors duration-150`.
- **PageHeader:** `border-border bg-card`, breadcrumbs/title/subtitle use tokens and `erp-page-title` / `erp-section-desc`.

### Primary screens (targeted)
- **Projects list:** Empty state icon `text-muted-foreground`.
- **Schedule page:** Empty state and main title use `erp-page-title` / `erp-section-desc`; border `border-border`.
- **Report builder:** Selects use `border-input bg-background h-10 text-foreground`.

### Docs added
- `REFINEMENT-PLAN.md` — prioritized list, typography/spacing scale, a11y notes.
- `REFINEMENT-VISUAL-QA.md` — before/after per screen.
- `REFINEMENT-ACCESSIBILITY.md` — focus, contrast, keyboard, motion.
