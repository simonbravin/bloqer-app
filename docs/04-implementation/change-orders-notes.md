# Change Orders - Implementation Notes

## Server Actions Pattern

All mutations are centralized in `app/actions/change-orders.ts` to avoid closure issues with inline server actions.

- **Edit form**: The edit page imports `updateChangeOrder` from actions and passes it to `COForm` as `editAction` along with `coId`. The client component calls `editAction(coId, data)` on submit—no inline server action on the page.
- **Create form**: The new change order page may use an inline server action that wraps `createChangeOrder` and redirects after success; core logic remains in `createChangeOrder` in actions.

## Budget Version Creation

When a CO is approved (`approveChangeOrder`):

1. A new budget version is created with:
   - **versionType**: `CHANGE_ORDER`
   - **versionCode**: Next sequence (V1, V2, …)
   - **notes**: e.g. "Change order {number}: {title}"
2. Lines are built from:
   - The latest project budget version (by `createdAt`), then
   - The CO lines (as new budget lines with `deltaCost` as cost).
3. The change order is updated:
   - **status**: `APPROVED`
   - **budgetVersionId**: ID of the new version (links CO → version).
4. **Project.totalBudget** is incremented by the CO’s `costImpact`.
5. A **ChangeOrderApproval** record is created with decision `APPROVED`.

The CO detail page shows a link to the created budget version when `co.budgetVersion` is set.

## Status Workflow

- **DRAFT** → editable (EDITOR+); can submit.
- **SUBMITTED** → read-only; only ADMIN/OWNER can Approve / Reject / Request changes.
- **APPROVED** → locked; `budgetVersionId` set; link to budget version shown.
- **REJECTED** → read-only; `rejectionReason` shown.
- **CHANGES_REQUESTED** → editable again; `feedbackRequested` shown; can resubmit.

Only **DRAFT** and **CHANGES_REQUESTED** are editable. Only ADMIN/OWNER can transition from SUBMITTED.

## Navigation

Project detail page (`app/(dashboard)/projects/[id]/page.tsx`) includes a “Change orders” link to `/projects/[id]/change-orders` in the project nav (Overview, WBS, Budget, Change orders, Certifications).

## Permissions

- **Create / Edit CO (header + lines)**: `requireRole(org.role, 'EDITOR')`; only when status is DRAFT or CHANGES_REQUESTED for edit.
- **Submit for approval**: EDITOR+; only when status is DRAFT or CHANGES_REQUESTED.
- **Approve / Reject / Request changes**: `requireRole(org.role, 'ADMIN')`.

## Multi-tenant

All CO actions scope by `orgId` (via `getOrgContext` and `ensureProjectInOrg` / `findFirst(..., orgId)`). Users cannot see or act on change orders from other organizations.
