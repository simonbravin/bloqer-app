# Accessibility Checks Summary — UI Refinement

After applying the refinement patch, validate the following. No new color tokens; contrast relies on existing foreground/background/muted tokens.

---

## 1. Focus visible

| Element | Requirement | Where to check |
|---------|-------------|----------------|
| Buttons | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | All Button variants (default, outline, ghost, destructive) |
| Inputs | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` | Input, textarea, select in forms |
| Select (Trigger) | Focus ring from shadcn or custom ring-ring | Report builder, filters (projects, finance) |
| Links | Underline or ring on focus-visible | Breadcrumbs, nav, table links |
| Icon buttons | Minimum 44×44 or ring visible | Sidebar expand, Gantt toolbar, table actions |

**Action:** Tab through Projects list, Project dashboard, Budget table, Finance list, Reports builder, Gantt. Ensure focus is always visible (no outline: none without ring replacement).

---

## 2. Contrast hot spots

| Area | Risk | Mitigation |
|------|------|------------|
| Muted text on card | Low contrast in some themes | Use text-muted-foreground (already token-based) |
| Disabled buttons | Too faint | disabled:opacity-50; ensure not only color change |
| Table row hover | Similar to background | hover:bg-muted/50 (token) |
| Badges | Status colors vs foreground | Use status-*-foreground tokens (already in badge-* classes) |

**Action:** In both light and dark mode, check: page title, section description, table header text, disabled primary button, status badges. No manual gray that reduces contrast.

---

## 3. Keyboard navigation

| Screen | Check |
|--------|--------|
| Projects list | Tab: search → status filter → phase filter → view toggle → table (if any row has link/button) → export. No trap. |
| Project dashboard | Tab: export button → cards/links. Escape does not need to close anything unless modal is open. |
| Budget tables | Tab through table actions (edit/delete) if present; Enter/Space activate. |
| Finance list | Filters → table → “Nueva transacción” → modal (focus trap inside; Escape closes). |
| Reports builder | All form fields reachable in order; Run report button; no trap. |
| Gantt | Toolbar buttons → timeline (if interactive) → task rows. Date range control focusable. |

**Action:** Use only Tab, Shift+Tab, Enter, Space, Escape. Ensure no keyboard trap (e.g. focus stuck in a modal without Escape closing it).

---

## 4. Layout and motion

| Check | Requirement |
|-------|-------------|
| No layout shift on focus | Focus ring (ring-offset-2) can add 2px; ensure no content jump. |
| No layout shift on hover | Hover bg-muted/50 or opacity only; no size change. |
| Reduced motion | Optional: prefer `@media (prefers-reduced-motion: reduce)` to shorten or disable transitions. |

**Action:** Focus and hover over buttons and table rows; confirm no visible jump. If your polish layer adds transitions, consider reducing duration when prefers-reduced-motion: reduce.

---

## 5. Summary

- **Focus visible:** All interactive elements use ring-ring on focus-visible.
- **Contrast:** Use only tokens (foreground, muted-foreground, destructive, etc.); no hardcoded low-contrast gray.
- **Keyboard:** Logical tab order; modals trap focus and close on Escape.
- **Layout:** No focus/hover layout shift; optional reduced-motion for transitions.

These checks do not require new tokens; they validate that the refinement patch keeps accessibility consistent with the existing theme contract.
