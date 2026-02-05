# Reporte de limpieza — Next.js 15 / Monorepo

**Fecha:** 5 de febrero de 2025  
**Alcance:** Dependencias no importadas y archivos huérfanos (.ts, .tsx, .css).

---

## 1. Dependencias (package.json)

### 1.1 Raíz (`package.json`)

- **Conclusión:** No hay dependencias de producción. Solo `devDependencies` (prettier, turbo, typescript, @types/node, @types/react). Todas necesarias para scripts y tooling.
- **Acción:** Ninguna.

### 1.2 `apps/web/package.json`

Se revisaron todas las dependencias listadas. **Todas tienen al menos un `import` o `require` en el código** (excluyendo package.json, lockfile y tsbuildinfo):

| Dependencia | Dónde se usa |
|-------------|--------------|
| `@auth/prisma-adapter` | `lib/auth.ts` |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | `lib/r2-client.ts` |
| `@dnd-kit/*` | `components/wbs/wbs-tree.tsx`, `wbs-sortable-row.tsx` |
| `@hookform/resolvers` | Varios formularios (zodResolver) |
| `@radix-ui/*` | `components/ui/*` (alert-dialog, avatar, checkbox, dialog, dropdown-menu, radio-group, select, switch) |
| `@repo/database`, `@repo/validators` | Múltiples actions, páginas, componentes |
| `@tanstack/react-query` | `components/providers.tsx` |
| `@tanstack/react-table` | `components/projects/projects-list-client.tsx` |
| `bcryptjs` | `lib/auth.ts`, `app/actions/auth.ts`, `app/actions/team.ts`, `app/actions/super-admin.ts`, y paquete database |
| `clsx` | `lib/utils.ts` (junto con `tailwind-merge`) |
| `date-fns` | Schedule, super-admin, dashboard, reports, settings, inventory |
| `exceljs` | `lib/report-generator.ts` |
| `html2canvas` | `hooks/use-chart-export.ts` |
| `jspdf`, `jspdf-autotable` | `lib/export/chart-to-pdf.ts` |
| `lucide-react` | Decenas de componentes |
| `next`, `next-auth`, `next-intl`, `next-themes` | Framework y auth/i18n/tema |
| `pdfkit` | `lib/export/gantt-pdf-exporter.ts`, `lib/export/pdf-exporter.ts` |
| `react`, `react-dom`, `react-hook-form` | Uso global y formularios |
| `recharts` | Dashboards y reportes (charts) |
| `resend` | `lib/email.ts` |
| `sonner` | Toasts en muchos componentes + `app/layout.tsx` (Toaster) |
| `tailwind-merge` | `lib/utils.ts` |
| `xlsx` | `lib/export/excel-exporter.ts`, `lib/excel/excel-parser.ts` |
| `zod` | Formularios y validación (también vía @repo/validators) |

- **Conclusión:** **No hay librerías que se puedan desinstalar** en `apps/web`. Todas están referenciadas en el código.

### 1.3 `packages/database/package.json`

- `@prisma/client`, `bcryptjs`: usados en `src/` y por la app vía `@repo/database`.
- **Acción:** Ninguna.

### 1.4 `packages/validators/package.json`

- `zod`: usado en todo el paquete y reexportado.
- **Acción:** Ninguna.

---

## 2. Archivos huérfanos (sin referencias de import)

Se consideran **huérfanos** los archivos que **nunca son importados** por ningún otro `.ts`/`.tsx` (scripts ejecutados solo por `package.json` o a mano se listan como candidatos a borrar si ya no se usan).

### 2.1 En `packages/database/src/`

| Archivo | Notas |
|---------|--------|
| `check-user.ts` | Script de utilidad (ejecutar con `pnpm exec tsx src/check-user.ts`). No importado por ningún otro archivo. |
| `migrate-subcontract-to-equipment.ts` | Script de migración one-off. No importado. |
| `seed-global-suppliers.ts` | Script de seed. **No está en los scripts de `package.json`** ni es importado por `seed.ts`. |

**Recomendación:**  
- Si ya no usas `check-user` ni la migración `migrate-subcontract-to-equipment`, se pueden **borrar**.  
- Para `seed-global-suppliers.ts`: o lo incorporas al flujo de seed (p. ej. llamándolo desde `seed.ts`) o, si no lo necesitas, **borrarlo**.

### 2.2 En `packages/validators/src/`

- Todos los módulos están reexportados desde `index.ts` y son importados por la app (vía `@repo/validators`).
- **No hay archivos huérfanos.**

### 2.3 En `apps/web/` (código fuente de la app)

La app no tiene carpeta `src/`; se consideran “fuente” `app/`, `components/`, `lib/`, etc.

| Archivo | Notas |
|---------|--------|
| `lib/db.ts` | Solo reexporta `prisma` desde `@repo/database`. **Ningún archivo importa `@/lib/db`**; todo usa `@repo/database` directamente. Candidato a **borrar** (redundante). |
| `components/schedule/gantt-timeline.tsx` | No importado en ningún sitio. La vista de schedule usa `gantt-timeline-dynamic.tsx`. Candidato a **borrar** (código legacy sustituido por la versión dinámica). |

### 2.4 CSS en `apps/web/`

- Solo existe `app/globals.css`, importado en `app/layout.tsx`.
- **No hay archivos .css huérfanos.**

---

## 3. Resumen ejecutivo

| Categoría | Acción |
|-----------|--------|
| **Dependencias a desinstalar** | **Ninguna.** Todas las listadas en los `package.json` revisados tienen al menos una referencia en el código. |
| **Archivos que se pueden borrar (tras tu OK)** | **5 archivos** (3 en database, 2 en web). |

### Lista de archivos propuestos para borrar (solo tras tu aprobación)

1. `packages/database/src/check-user.ts`
2. `packages/database/src/migrate-subcontract-to-equipment.ts`
3. `packages/database/src/seed-global-suppliers.ts`
4. `apps/web/lib/db.ts`
5. `apps/web/components/schedule/gantt-timeline.tsx`

**Nota:** No se ha borrado nada; este documento es solo el reporte para tu aprobación. Si quieres, en un siguiente paso se pueden eliminar solo los archivos que confirmes.
