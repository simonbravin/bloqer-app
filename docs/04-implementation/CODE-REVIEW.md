# Code Review & Debugging Report — Construction ERP

**Date:** 2026-02-03  
**Scope:** Full codebase (apps/web, packages/database, packages/validators)

**Baseline:** Stack y arquitectura según [final-summary](../00-overview/final-summary.md): Next.js 15, Neon PostgreSQL, Prisma, next-auth v5, monorepo Turbo. Schema recomendado: **completo con proveedores globales** (57 tablas). Fuente de verdad del schema: `packages/database/prisma/schema.prisma`.

---

## 1. System Overview

- **Purpose:** Construction ERP-Lite SaaS: projects, WBS, budgets, daily reports, materials, finance, certifications, inventory, quality (RFI, submittals, inspections), global supplier directory, documents, exports.
- **Stack:** Next.js 15 (App Router), NextAuth 5 (JWT + Credentials), Prisma (PostgreSQL, multi-schema), TanStack Query, React Hook Form + Zod, next-intl.
- **Architecture:** Monorepo (Turbo); single web app; org-scoped data via `getOrgContext(userId)` (first org by `createdAt`); server actions with `getAuthContext()` → session + org; no org switcher (single-org UX).

---

## 2. Critical Paths Reviewed

| Path | Flow | Notes |
|------|------|--------|
| **Auth** | Middleware → `auth()` → protected paths redirect to `/login`; Credentials + bcrypt; JWT session (no org in token). | Session has only `user.id`, `email`, `name`. Org resolved in each action via `getOrgContext(session.user.id)`. **Production:** set `NEXTAUTH_SECRET` (see apps/web/.env.example). |
| **Budget** | List versions → get version + lines → create/update version/line; ensure project in org; `requireRole(org.role, 'EDITOR')` on mutations. | Consistent org + project checks. |
| **Daily reports** | List/create/update/approve; project status must be ACTIVE; audit log; tier2 (WBS progress, budget actuals, alerts). | detailsJson type fixed; optional chaining on `createdBy`. |
| **Export** | Budget export: get version with **budgetLines** (was wrongly `lines`) + project; org check. | Fixed include to `budgetLines`. |
| **Materials** | getConsolidatedMaterials / getMaterialsBySupplier / generatePurchaseOrder: **getOrgContext** can return null; was destructuring `orgId` from null. | Fixed: check `org?.orgId` and use `org.orgId`. |
| **API** | Reports export route: getToken + orgMember + report in org; visibility SHARED or createdBy. | Correct. |

---

## 3. Issue List (Prioritized)

### Critical (will break or corrupt data)

| # | File(s) | Root cause | Risk | Status |
|---|---------|------------|------|--------|
| 1 | `apps/web/app/actions/materials.ts` | `getOrgContext()` can return `null`; destructuring `{ orgId } = await getOrgContext()` throws when null. | Runtime crash for users with no org; possible confusion before crash. | **Fixed:** Check `org?.orgId`, then use `org.orgId`. |
| 2 | `apps/web/app/actions/export.ts` | Prisma relation is `budgetLines`, not `lines`; include used `lines` and code used `version.lines` / `version.project`. | Export would fail at runtime (property does not exist). | **Fixed:** Include and use `budgetLines` and `project`. |

### High (security, performance, scalability)

| # | File(s) | Root cause | Risk | Status |
|---|---------|------------|------|--------|
| 3 | `apps/web/lib/org-context.ts` | `getOrgContext(userId)` returns **first** org by `createdAt`. Users in multiple orgs have no way to switch. | Wrong-org data access if multi-org is ever used; no tenant switcher. | **Documented.** Recommend: add org switcher or explicit orgId in session/cookie. |
| 4 | `apps/web/app/api/reports/[id]/export/route.ts` | Uses `process.env.NEXTAUTH_SECRET` for getToken. If unset, token validation may be weak. | Fails open or undefined behavior in production. | **Documented.** Ensure NEXTAUTH_SECRET set in production (see .env.example). |
| 5 | `apps/web/app/actions/daily-reports.ts` | `detailsJson` passed as `Record<string, unknown>`; Prisma expects `InputJsonValue`. | Type error; possible runtime if Prisma strict. | **Fixed:** Cast to `Prisma.InputJsonValue`. |
| 6 | `apps/web/app/actions/daily-reports.ts` | List mapping used `r.createdBy.user.fullName`; type allowed `createdBy` to be undefined in some branches. | TS error; possible runtime if branch type differs. | **Fixed:** `r.createdBy?.user?.fullName ?? ''`. |

### Medium (design, maintainability)

| # | File(s) | Root cause | Risk | Status |
|---|---------|------------|------|--------|
| 7–20 | (various) | TS strict null, Button/Badge variants, form types, excel-exporter, separator, wbs-node-form. | TS errors. | **Fixed** in codebase (see below). |

### Low (style, cleanup)

| # | File(s) | Note |
|---|---------|------|
| 21 | Multiple | Duplicate `getAuthContext()` pattern across actions; could be a shared helper. |
| 22 | Env | R2 optional; NEXTAUTH_SECRET and DATABASE_URL required (documented in apps/web/.env.example). |

---

## 4. Security Summary

- **Auth:** Credentials + bcrypt; JWT session; middleware protects dashboard routes. No org in token; org resolved per action — consistent use of `getOrgContext` + `ensureProjectInOrg` in reviewed actions.
- **Authorization:** Role checks via `requireRole(org.role, 'EDITOR')` (or similar) on mutations; VIEWER/ACCOUNTANT/EDITOR/ADMIN/OWNER hierarchy.
- **Injection:** Prisma used throughout; no raw SQL/string concatenation in reviewed code.
- **Env:** Secrets (NEXTAUTH_SECRET, R2_*, DATABASE_URL) from env; no hardcoded secrets. **Production:** set NEXTAUTH_SECRET (generate with `openssl rand -base64 32`).

---

## 5. Fixes Applied (Summary)

1. **materials.ts:** Null-safe org: `const org = await getOrgContext(...)`; `if (!org?.orgId) throw/return`; then `orgId = org.orgId` in all three functions.
2. **export.ts:** `include: { project: true, budgetLines: { ... } }`; `version.budgetLines.map(...)` and `version.project`.
3. **daily-reports.ts:** `detailsJson` cast to `Prisma.InputJsonValue`; `authorName: r.createdBy?.user?.fullName ?? ''`.
4. **Alert component:** Added `components/ui/alert.tsx` so `import-budget-wizard` resolves.
5. **TS & auth:** Remaining TypeScript errors fixed; settings/profile and team null-safe; Button/Separator/Badge/form types aligned; schema documented as single source of truth.

---

## 6. Production Readiness

| Aspect | Status |
|--------|--------|
| Critical bugs (crash/data) | Addressed (materials null, export relation). |
| Auth & tenancy | Correct pattern; multi-org UX missing. NEXTAUTH_SECRET required in prod. |
| TypeScript | Errors resolved (strict null, variants, forms, excel). |
| Security | No injection; env-based secrets; ensure NEXTAUTH_SECRET in prod. |

**Verdict:** After completing doc organization, schema alignment, and TS/auth fixes, the application is in a good position for production with monitoring and regression tests. If multi-org is in scope, add org selection and context.
