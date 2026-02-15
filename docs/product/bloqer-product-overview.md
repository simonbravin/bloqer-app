# Bloqer — Product Overview

Commercial and functional catalog of Bloqer (Construction ERP), based on the actual codebase. Use this document for marketing site copy, feature handoff to another AI, and roadmap planning.

---

## A) Executive summary

**Bloqer** is a multi-tenant Construction ERP SaaS for construction companies and developers in Latin America. It centralizes projects, budgets, certifications, inventory, suppliers, daily reports, and finance in one platform so teams can control costs, certify progress, and keep a single source of truth from estimate to closeout. Core differentiation: presupuesto versionado y aprobado, certificaciones de avance inmutables, inventario por ubicaciones y movimientos, libro de obra diario con consumos y proveedores, directorio global de proveedores con enlaces por organización, y finanzas multi-moneda con flujo de caja y gastos generales.

**Value propositions (business language):**

- Presupuesto por versiones (baseline, aprobado) con líneas ligadas a WBS y códigos de costo.
- Certificaciones de avance por período (mensual/anual) con líneas por partida y sellado de integridad.
- Órdenes de cambio con impacto en presupuesto (desviación o cambio aprobado) y flujo de aprobación.
- Inventario por ítems, categorías, ubicaciones (central/obra) y movimientos (compra, transferencia, entrega, ajuste).
- Libro de obra diario: resumen, mano de obra, equipos, fotos, consumos de inventario e interacciones con proveedores.
- Directorio de proveedores: global (verificado/categorías) y locales por organización; enlace y términos por org.
- Finanzas: transacciones, pagos, gastos generales por proyecto y flujo de caja.
- Reportes predefinidos (presupuesto vs real, certificaciones, gastos por proveedor, compras multi-proyecto, materiales) y reportes guardados.
- Control de acceso por roles (Dueño, Administrador, Editor, Contador, Visualizador) y permisos por módulo.
- Multi-tenant por organización con invitaciones, equipos por proyecto y super-admin para suscripciones y bloqueos.

---

## B) Personas and target customers

| Persona | Pains | Top jobs-to-be-done | Success metrics |
|--------|--------|----------------------|------------------|
| **Owner / Developer** | Presupuestos en Excel, certificaciones en PDF, falta de visibilidad por proyecto. | Aprobar presupuestos y certificaciones; ver salud financiera y alertas en un solo lugar. | Tiempo de cierre de certificaciones reducido; visibilidad de compromisos vs presupuesto. |
| **Project Manager** | Cambios de alcance sin trazabilidad; cronogramas desalineados con el presupuesto. | Crear y editar proyectos, WBS, presupuestos y órdenes de cambio; asignar equipo y revisar avance. | Órdenes de cambio aprobadas con impacto claro; WBS y presupuesto alineados. |
| **Site Supervisor** | Libro de obra en papel; fotos y consumos dispersos. | Registrar reportes diarios (trabajo realizado, mano de obra, equipos, fotos, consumos, proveedores). | Reportes diarios aprobados a tiempo; consumos y costos reales vinculados a partidas. |
| **Accountant / Admin** | Facturas y pagos en hojas; gastos generales sin reparto. | Registrar transacciones, pagos y gastos generales; aprobar certificaciones; exportar reportes. | Flujo de caja actualizado; certificaciones aprobadas con trazabilidad. |
| **Procurement** | Proveedores en listas locales; sin historial de entregas ni calidad. | Buscar y enlazar proveedores globales; gestionar proveedores locales; (futuro: POs/compromisos desde la UI). | Proveedores enlazados y términos claros; (futuro: POs visibles por proyecto). |

**Evidence:** Roles and descriptions from `apps/web/lib/permissions.ts` (OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER; `ROLE_DESCRIPTIONS`). Schema: `OrgMember`, `ProjectMember`, `OrgRole` in `packages/database/prisma/schema.prisma`.

---

## C) Product modules catalog

For each module: commercial name, what it solves, key capabilities, core workflows, Prisma entities, and status with evidence (route paths and key files).

---

### Auth and organization

**Commercial name:** Autenticación y organización

**What it solves:** Login, registro e invitaciones por organización; control de acceso por rol y permisos por módulo; multi-tenant por organización.

**Key capabilities:**

- Login con email/contraseña; registro de nueva organización y usuario.
- Invitación por email con token; aceptación de invitación (ruta `/[locale]/(auth)/invite/[token]`).
- Roles: OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER; permisos por módulo (view, create, edit, delete, approve, export).
- Permisos personalizados por miembro (override por módulo).
- Sesión y contexto de organización; redirección a login cuando no hay sesión.

**Core workflows:**

1. Registrarse: formulario registro → crear Organization + OrgMember (OWNER) + User.
2. Iniciar sesión: credenciales → validar → sesión; redirigir a dashboard.
3. Invitar: OWNER/ADMIN envía invitación por email → invitado abre link con token → acepta y se une a la org con rol asignado.

**Data/entities:** `User`, `Organization`, `OrgMember`, `Invitation`, `Session`, `RefreshToken`, `UserOrgPreference`. Roles: `OrgRole` (OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(auth)/login/page.tsx`, `register/page.tsx`, `invite/[token]/page.tsx`, `unauthorized/page.tsx`. Actions: `apps/web/app/actions/auth.ts`. Permissions: `apps/web/lib/permissions.ts` (MODULES, ROLE_PERMISSIONS, canAccess). Hook: `apps/web/hooks/use-permissions.ts`. Middleware: `apps/web/middleware.ts` (canViewModule).

---

### Projects

**Commercial name:** Proyectos

**What it solves:** Creación y edición de proyectos; numeración, fase, fechas y cliente; equipos por proyecto; estructura WBS como base para presupuesto y avance.

**Key capabilities:**

- Listado de proyectos (org); filtros por estado/fase.
- Crear proyecto (número, nombre, descripción, cliente, ubicación, m², fase, fechas planificadas).
- Editar proyecto; importar datos (ruta `projects/import`).
- Equipo por proyecto: asignar miembros con rol (MANAGER, SUPERINTENDENT, VIEWER).
- WBS: nodos con código, nombre, categoría (PHASE, ZONE, BUDGET_ITEM, TASK, MILESTONE), cantidad, unidad, horas/costo planificado vs real, progreso, fechas y estado de salud.

**Core workflows:**

1. Crear proyecto: formulario → Project + (opcional) ProjectMember.
2. Configurar WBS: agregar/editar nodos jerárquicos (parentId); asociar a partidas de presupuesto después.
3. Asignar equipo: en proyecto → equipo → agregar miembro de la org con rol de proyecto.

**Data/entities:** `Project`, `ProjectMember`, `WbsNode`. Enums: `ProjectPhase` (PRE_CONSTRUCTION, CONSTRUCTION, CLOSEOUT, COMPLETE).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/page.tsx`, `projects/new/page.tsx`, `projects/[id]/page.tsx`, `projects/[id]/edit/page.tsx`, `projects/import/page.tsx`, `projects/[id]/team/page.tsx`, `projects/[id]/wbs/page.tsx`. Actions: `apps/web/app/actions/projects.ts`, `apps/web/app/actions/wbs.ts`. Validators: `packages/validators/src/project.ts`, `packages/validators/src/wbs.ts`.

---

### Budget / Presupuesto

**Commercial name:** Presupuesto

**What it solves:** Versiones de presupuesto por proyecto (baseline, aprobado); líneas por partida WBS con recursos (material, mano de obra, equipo); markups y aprobación; importación e informe de materiales.

**Key capabilities:**

- Múltiples versiones por proyecto (versionCode, versionType: BASELINE, etc.; status: DRAFT, BASELINE, APPROVED).
- Líneas de presupuesto: WBS, recurso opcional, cantidad, coste directo, precio de venta, porcentajes (overhead, indirecto, financiero, ganancia, impuesto, retención).
- Recursos por línea: tipo MATERIAL/LABOR/EQUIPMENT, descripción, unidad, cantidad, costo unitario.
- Modo markup: SIMPLE (global) o ADVANCED (por línea).
- Aprobación: approvedByOrgMemberId, approvedAt, lockedAt.
- Importar presupuesto; vista de materiales por versión; cómputo de APU (validadores budget-compute).

**Core workflows:**

1. Crear versión: desde proyecto → Presupuesto → Nueva versión (DRAFT).
2. Agregar líneas: seleccionar nodos WBS, descripción, unidad, cantidad, costes/venta; opcionalmente desglose por recursos.
3. Aprobar: cambiar estado a APPROVED; (solo roles con permiso approve).
4. Importar: subir archivo → parsear y crear version/líneas (actions/import-budget).

**Data/entities:** `BudgetVersion`, `BudgetLine`, `BudgetResource`. Relaciones con `Project`, `WbsNode`, `Resource` (catálogo org).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/budget/page.tsx`, `budget/[versionId]/page.tsx`, `budget/[versionId]/materials/page.tsx`, `budget/[versionId]/compute/page.tsx`, `budget/new/page.tsx`. Actions: `apps/web/app/actions/budget.ts`, `apps/web/app/actions/import-budget.ts`. Validators: `packages/validators/src/budget.ts`, `packages/validators/src/budget-compute.ts`.

---

### WBS / Takeoff (Cómputo)

**Commercial name:** WBS / Cómputo

**What it solves:** Estructura de desglose del trabajo (fases, zonas, partidas, tareas, hitos); cantidades y unidades; horas y costos planificados vs reales; progreso y estado para trazabilidad con presupuesto y reportes diarios.

**Key capabilities:**

- Árbol de nodos por proyecto (parentId, code, name, category, quantity, unit).
- Campos de avance: plannedHours, plannedCost, actualHours, actualCost, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, progressPct, healthStatus (ON_TRACK, AT_RISK, DELAYED, AHEAD).
- Orden y activación (sortOrder, active).

**Core workflows:**

1. Crear/editar WBS: en proyecto → WBS → agregar o editar nodos; jerarquía por parentId.
2. Vincular a presupuesto: al crear BudgetLine se asocia wbsNodeId.
3. Avance: actualizado desde daily reports (WbsProgressUpdate, BudgetLineActualCost) y/o schedule.

**Data/entities:** `WbsNode` (projectId, parentId, code, name, category, quantity, unit, plannedHours, plannedCost, actualHours, actualCost, progressPct, healthStatus, etc.).

**Status:** Implemented

**Evidence:** Route: `apps/web/app/[locale]/(dashboard)/projects/[id]/wbs/page.tsx`. Actions: `apps/web/app/actions/wbs.ts`. Validators: `packages/validators/src/wbs.ts`.

---

### Change orders / Adicionales

**Commercial name:** Órdenes de cambio / Adicionales

**What it solves:** Registro de cambios de alcance con impacto en costo y plazo; líneas por partida WBS (ADD/MODIFY/DELETE); flujo de aprobación y tipo de impacto (desviación vs cambio aprobado).

**Key capabilities:**

- Crear orden de cambio: número, título, tipo, budgetImpactType (DEVIATION | APPROVED_CHANGE), razón, justificación, costImpact, timeImpactDays, party (opcional).
- Líneas: wbsNodeId, changeType (ADD|MODIFY|DELETE), cantidades y costes original vs nuevo, deltaCost, justificación.
- Estados: DRAFT → aprobación (approvedByOrgMemberId, approvedDate); rechazo con rejectionReason.
- Vinculación opcional a BudgetVersion y WorkflowInstance.

**Core workflows:**

1. Solicitar: usuario crea CO (DRAFT) y líneas; envía a aprobación.
2. Aprobar/rechazar: ADMIN/OWNER aprueba o rechaza; se registra en ChangeOrderApproval.
3. Implementar: implementedDate cuando se aplica en obra.

**Data/entities:** `ChangeOrder`, `ChangeOrderLine`, `ChangeOrderApproval`. Relaciones: Project, BudgetVersion?, Party?, OrgMember (requestedBy, approvedBy).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/change-orders/page.tsx`, `change-orders/new/page.tsx`, `change-orders/[coId]/page.tsx`, `change-orders/[coId]/edit/page.tsx`. Actions: `apps/web/app/actions/change-orders.ts`. Validators: `packages/validators/src/change-order.ts`.

---

### Certifications / Progress billing

**Commercial name:** Certificaciones / Facturación por avance

**What it solves:** Emisión de certificaciones de avance por período (mes/año); líneas por partida con avance anterior, del período y total; montos y cantidades snapshot; emisión y aprobación con trazabilidad.

**Key capabilities:**

- Listado de certificaciones por proyecto (número, período, estado, monto total).
- Crear certificación: período (month/year), notas; líneas por BudgetLine con prevProgressPct, periodProgressPct, totalProgressPct, cantidades y montos snapshot.
- Estados: DRAFT → issued (issuedBy, issuedAt) → APPROVED (approvedBy, approvedAt); integritySeal para inmutabilidad.
- Vista desde proyecto: `projects/[id]/certifications` y también `projects/[id]/finance/certifications` (list, new, [certId], edit).

**Core workflows:**

1. Emitir: usuario con permiso crea certificación DRAFT; completa líneas de avance por partida; emite (issued).
2. Aprobar: contador/admin aprueba; certificación pasa a APPROVED.
3. Facturación: montos aprobados alimentan reportes de ingresos y flujo de caja.

**Data/entities:** `Certification`, `CertificationLine`. Relaciones: Project, BudgetVersion, OrgMember (issuedBy, approvedBy), BudgetLine, WbsNode.

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/certifications/page.tsx`, `certifications/new/page.tsx`, `certifications/[certId]/page.tsx`; `projects/[id]/finance/certifications/page.tsx`, `finance/certifications/new/page.tsx`, `finance/certifications/[certId]/page.tsx`, `[certId]/edit/page.tsx`. Actions: `apps/web/app/actions/certifications.ts`. Validators: `packages/validators/src/certification.ts`.

---

### Finance / Cashflow

**Commercial name:** Finanzas y flujo de caja

**What it solves:** Transacciones (ingresos, gastos, compras, ventas, gastos generales); pagos; asignación de gastos generales a proyectos; flujo de caja y dashboard financiero por organización y por proyecto.

**Key capabilities:**

- Transacciones: tipo (EXPENSE, INCOME, PURCHASE, SALE, OVERHEAD), número, fechas (emisión, vencimiento, pago), moneda, subtotal, impuesto, total, amountBaseCurrency; opcionalmente vinculadas a proyecto, proveedor (Party), daily report.
- Líneas por transacción: descripción, WBS opcional, cantidad, precio, total.
- Pagos: registro de pago sobre transacción (paidOn, amount, method, reference).
- Gastos generales: OverheadAllocation por transacción y proyecto (allocationPct, allocationAmount).
- Dashboard financiero org: KPIs y flujo de caja; por proyecto: transacciones, flujo de caja, certificaciones.

**Core workflows:**

1. Registrar transacción: crear FinanceTransaction + FinanceLine(s); asociar proyecto/party si aplica.
2. Registrar pago: crear Payment sobre transacción; actualizar paidDate si corresponde.
3. Asignar gastos generales: desde transacción OVERHEAD → asignar % o monto a proyectos (OverheadAllocation).
4. Ver flujo de caja: reportes por período (ingresos vs gastos).

**Data/entities:** `FinanceTransaction`, `FinanceLine`, `Payment`, `OverheadAllocation`. Schema finance: `Currency`, `ExchangeRate`. Relaciones: Organization, Project?, Party?, DailyReport?, OrgMember (createdBy, deletedBy).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/finance/page.tsx`, `finance/transactions/page.tsx`, `finance/cashflow/page.tsx`, `finance/overhead/page.tsx`; `projects/[id]/finance/page.tsx`, `projects/[id]/finance/cashflow/page.tsx`, `projects/[id]/finance/transactions/page.tsx`. Actions: `apps/web/app/actions/finance.ts`, `finance-transactions.ts`, `finance-cashflow.ts`, `finance-overhead.ts`, `finance-helpers.ts`, `finance-kpis.ts`. Validators: `packages/validators/src/finance.ts`.

---

### Commitments (PO / Contracts)

**Commercial name:** Compromisos (Órdenes de compra / Contratos)

**What it solves:** En schema, compromisos de compra o contrato por proyecto y proveedor (PO, CONTRACT, SUBCONTRACT); total y líneas por WBS. En la app se usan para métricas (commitment ratio) pero no hay CRUD en UI.

**Key capabilities (schema):**

- Commitment: projectId, partyId, commitmentType (PO|CONTRACT|SUBCONTRACT), commitmentNumber, status, issueDate, startDate, endDate, total, currency, totalBaseCurrency, createdBy, approvedBy.
- CommitmentLine: wbsNodeId, description, quantity, unitPrice, lineTotal.

**Core workflows (when UI exists):**

1. Crear PO/contrato: seleccionar proyecto y proveedor; agregar líneas (partida, cantidad, precio).
2. Aprobar: approvedBy; vincular a transacciones/pagos cuando se factura.

**Data/entities:** `Commitment`, `CommitmentLine`. Used in code: `apps/web/app/actions/project-dashboard.ts` (commitmentRatio: totalCommitted vs totalBudget).

**Status:** Partial — Data model and dashboard metric (commitment ratio) only; no dedicated UI routes for CRUD.

**Evidence:** Schema: `Commitment`, `CommitmentLine` in `packages/database/prisma/schema.prisma`. No routes under `projects/[id]/commitments` or equivalent. Project dashboard: `apps/web/app/actions/project-dashboard.ts` (prisma.commitment.aggregate).

---

### Suppliers / Proveedores

**Commercial name:** Proveedores

**What it solves:** Directorio global de proveedores (verificados, categorías, regiones) y enlaces por organización; proveedores locales (Party tipo SUPPLIER) por organización; búsqueda y gestión de términos.

**Key capabilities:**

- Directorio global: GlobalParty (nombre, categoría, subcategorías, países, regiones, verificado, valoraciones, productos GlobalProduct). Búsqueda por nombre/categoría.
- Enlace por org: OrgPartyLink (localAlias, contactos locales, preferred, status, paymentTerms, discountPct, creditLimit, totalOrders, totalSpent). Crear/editar enlace desde UI.
- Proveedores locales: Party con partyType SUPPLIER; CRUD en `suppliers/local` y `suppliers/local/new`.
- Claim/review: GlobalPartyClaim, GlobalPartyReview existen en schema; no se encontraron rutas de UI para reclamar o valorar proveedores globales.

**Core workflows:**

1. Buscar proveedor global: en Proveedores → búsqueda → resultados GlobalParty.
2. Enlazar a mi org: crear OrgPartyLink con alias, contacto, términos; queda en pestaña “Enlazados”.
3. Gestionar locales: en Proveedores → Locales → listado Party SUPPLIER; crear/editar.

**Data/entities:** `Party`, `PartyContact`; `GlobalParty`, `GlobalPartyContact`, `OrgPartyLink`, `GlobalPartyClaim`, `GlobalPartyReview`, `GlobalProduct`.

**Status:** Implemented (global directory + local Party + OrgPartyLink). Partial: GlobalParty claim/review UI not found (schema only).

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/suppliers/page.tsx`, `suppliers/local/page.tsx`. Actions: `apps/web/app/actions/global-suppliers.ts`. Validators: `packages/validators/src/global-suppliers.ts`.

---

### Inventory / Inventario

**Commercial name:** Inventario

**What it solves:** Catálogo de ítems por organización (categoría/subcategoría); ubicaciones (central, obra, proveedor); movimientos (compra, transferencia, entrega, ajuste) con idempotencia; stock por ubicación vía movimientos.

**Key capabilities:**

- Ítems: SKU, nombre, descripción, categoría/subcategoría (InventoryCategory, InventorySubcategory), unidad, minStockQty, reorderQty; CRUD y listado con filtros.
- Ubicaciones: tipo (CENTRAL_WAREHOUSE, PROJECT_SITE, SUPPLIER), nombre, proyecto opcional; CRUD.
- Movimientos: tipo PURCHASE|TRANSFER|ISSUE|ADJUSTMENT, fromLocationId, toLocationId, projectId, wbsNodeId opcional, quantity, unitCost, totalCost, idempotencyKey, createdBy; opcionalmente transactionId o dailyReportId.
- Consumos en reporte diario: InventoryConsumption (dailyReportId, inventoryItemId, quantity, costPerUnit, totalCost, movementId).

**Core workflows:**

1. Alta de ítem: Inventario → Ítems → Nuevo (categoría, SKU, nombre, unidad, mínimos).
2. Alta de ubicación: Inventario → Ubicaciones → Nueva (tipo, nombre, proyecto si es obra).
3. Compra: Movimientos → Nuevo → tipo PURCHASE, ítem, cantidad, costo, ubicación destino (ej. central).
4. Transferencia a obra: tipo TRANSFER, desde central → a ubicación proyecto.
5. Entrega a partida: tipo ISSUE, desde ubicación obra, wbsNodeId; opcionalmente vinculado a daily report (consumo).

**Data/entities:** `InventoryCategory`, `InventorySubcategory`, `InventoryItem`, `InventoryLocation`, `InventoryMovement`, `InventoryConsumption`. Schema inventory; Organization, Project?, WbsNode?, FinanceTransaction?, DailyReport?, OrgMember.

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/inventory/page.tsx`, `inventory/items/page.tsx`, `inventory/items/[id]/page.tsx`, `inventory/items/new/page.tsx`, `inventory/items/[id]/edit/page.tsx`, `inventory/locations/page.tsx`, `inventory/movements/page.tsx`, `inventory/movements/new/page.tsx`. Actions: `apps/web/app/actions/inventory.ts`. Validators: `packages/validators/src/inventory.ts`.

---

### Materials / Catalog (Recursos)

**Commercial name:** Materiales / Catálogo de recursos

**What it solves:** Catálogo de recursos reutilizables por organización (material, mano de obra, equipo, subcontrato) para usar en líneas de presupuesto; código, unidad, costo unitario, proveedor opcional.

**Key capabilities:**

- Resource: code, name, category (MATERIAL|LABOR|EQUIPMENT|SUBCONTRACT|OTHER), unit, unitCost, supplierId (Party); org-wide.
- Uso en BudgetLine (resourceId opcional) y en BudgetResource dentro de líneas.
- Vista “Materiales” por versión de presupuesto: `budget/[versionId]/materials` (resumen de materiales en esa versión).

**Core workflows:**

1. Dar de alta recurso: (desde contexto de presupuesto o catálogo si existe ruta) — código, nombre, categoría, unidad, costo, proveedor.
2. En presupuesto: al crear/editar BudgetLine, seleccionar recurso o desglose manual en BudgetResource.

**Data/entities:** `Resource` (orgId, code, name, category, unit, unitCost, supplierId). Relación con BudgetLine, Party.

**Status:** Implemented (via budget and Resource model; materials view per budget version).

**Evidence:** Route: `apps/web/app/[locale]/(dashboard)/projects/[id]/budget/[versionId]/materials/page.tsx`. Schema: Resource. Validators: `packages/validators/src/resource.ts`.

---

### Quality: RFIs

**Commercial name:** RFIs / Consultas técnicas

**What it solves:** Registro de solicitudes de información (RFI) por proyecto: pregunta, prioridad, partida WBS opcional, asignado, respuesta y cierre.

**Key capabilities:**

- Crear RFI: número, asunto, pregunta, prioridad (MEDIUM, etc.), wbsNodeId opcional, raisedBy, assignedTo, dueDate.
- Estados: OPEN → answered (answer, answeredDate) → closed (closedDate).
- Comentarios: RFIComment (orgMemberId, comment).

**Core workflows:**

1. Crear RFI: Calidad → RFIs → Nuevo; asignar responsable opcional.
2. Responder: editar RFI; completar answer, answeredDate.
3. Cerrar: closedDate cuando se resuelve.

**Data/entities:** `RFI`, `RFIComment`. Schema quality. Relaciones: Project, WbsNode?, OrgMember (raisedBy, assignedTo).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/quality/page.tsx`, `quality/rfis/page.tsx`, `quality/rfis/new/page.tsx`, `quality/rfis/[rfiId]/page.tsx`. Actions: `apps/web/app/actions/quality.ts`. Validators: `packages/validators/src/quality.ts` (createRfiSchema, addRfiCommentSchema, answerRfiSchema).

---

### Quality: Submittals

**Commercial name:** Submittals / Envíos a revisión

**What it solves:** Control de envíos a revisión por proyecto (tipo, sección de especificación, proveedor, fechas de envío y revisión, comentarios y revisión).

**Key capabilities:**

- Crear submittal: número, submittalType, specSection, submittedByPartyId, dueDate; status DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED.
- reviewedByOrgMemberId, reviewedDate, reviewComments; revisionNumber.

**Core workflows:**

1. Crear submittal: Calidad → Submittals → Nuevo (tipo, partida, proveedor, fecha límite).
2. Enviar: status SUBMITTED; submittedDate.
3. Revisar: revisor asigna reviewedDate y reviewComments; aprueba o rechaza.

**Data/entities:** `Submittal`. Schema quality. Relaciones: Project, WbsNode?, Party? (submittedBy), OrgMember? (reviewedBy).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/quality/submittals/page.tsx`, `quality/submittals/new/page.tsx`, `quality/submittals/[submittalId]/page.tsx`. Actions: `apps/web/app/actions/quality.ts`. Validators: `packages/validators/src/quality.ts` (createSubmittalSchema, reviewSubmittalSchema).

---

### Quality: Inspections

**Commercial name:** Inspecciones

**What it solves:** En schema, inspecciones por proyecto (tipo, partida WBS, programada, realizada, inspector, hallazgos, acciones correctivas) e ítems de inspección (PASS/FAIL/NA). En la app no hay rutas de UI.

**Key capabilities (schema):**

- Inspection: projectId, wbsNodeId, number, inspectionType, status (SCHEDULED, etc.), scheduledDate, completedDate, inspectorOrgMemberId, findings, correctiveActions.
- InspectionItem: itemDescription, status (PASS|FAIL|NA), notes.

**Data/entities:** `Inspection`, `InspectionItem`. Schema quality.

**Status:** Planned (schema only; no app routes found).

**Evidence:** Schema: `Inspection`, `InspectionItem` in `packages/database/prisma/schema.prisma`. No routes under `projects/[id]/quality/inspections` or similar.

---

### Daily reports / Libro de obra

**Commercial name:** Reportes diarios / Libro de obra

**What it solves:** Registro diario por proyecto: resumen, trabajo realizado, observaciones, clima, temperaturas, retrasos, incidentes, visitantes, entregas, mano de obra y equipos; fotos; vinculación a partidas WBS; consumos de inventario e interacciones con proveedores (Tier 2); actualización de avance y costos reales por partida.

**Key capabilities:**

- DailyReport: reportDate, summary, workAccomplished, observations, weather, temperatureHigh/Low, delays, safetyIncidents, visitors, deliveries, laborCountTotal, equipmentCountTotal; status DRAFT|SUBMITTED|APPROVED|PUBLISHED; approvedBy, approvedAt; wbsNodeId opcional; budgetLineId, laborCosts, materialCosts, otherCosts, totalCost.
- Labor: trade, workerCount, hoursWorked; Equipment: equipmentType, quantity, hoursUsed.
- Photos: DailyReportPhoto → Document.
- DailyReportWbsNode: vinculación a nodos WBS trabajados.
- InventoryConsumption: ítem, cantidad, costo; opcionalmente movementId.
- DailyReportSupplier: globalPartyId, type (PURCHASE|DELIVERY|ISSUE|COMMUNICATION|VISIT), amount, quantity, deliveryStatus, quality, etc.
- WbsProgressUpdate, BudgetLineActualCost: avance y costos reales por partida desde el reporte.
- Alertas: Alert (WBS_DELAYED, BUDGET_OVER, etc.) vinculadas a daily report.

**Core workflows:**

1. Crear reporte: Proyecto → Reportes diarios → Nuevo; completar fecha, resumen, trabajo, mano de obra, equipos, fotos; opcionalmente partidas WBS, consumos, proveedores.
2. Enviar: status SUBMITTED.
3. Aprobar: ADMIN/OWNER aprueba (APPROVED/PUBLISHED); se generan actualizaciones de avance y alertas si aplica.

**Data/entities:** `DailyReport`, `DailyReportWbsNode`, `DailyReportLabor`, `DailyReportEquipment`, `DailyReportPhoto`, `InventoryConsumption`, `DailyReportSupplier`, `WbsProgressUpdate`, `BudgetLineActualCost`, `Alert`. Relaciones: Project, OrgMember (createdBy, approvedBy), WbsNode?, BudgetLine?, Document, GlobalParty, InventoryItem.

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/daily-reports/page.tsx`, `daily-reports/new/page.tsx`, `daily-reports/[reportId]/page.tsx`, `daily-reports/[reportId]/edit/page.tsx`. Actions: `apps/web/app/actions/daily-reports.ts`, `apps/web/app/actions/daily-reports-tier2.ts`. Validators: `packages/validators/src/daily-reports.ts`, `packages/validators/src/daily-reports-tier2.ts`.

---

### Site log

**Commercial name:** Libro de obra (legacy / entradas simples)

**What it solves:** En schema, entradas simples por proyecto (fecha, título, descripción, clima, creador). Comentario en schema: “Legacy … can be deprecated later.” No rutas de UI encontradas.

**Data/entities:** `SiteLogEntry` (projectId, logDate, title, description, weather, createdByOrgMemberId).

**Status:** WIP / Legacy (schema only; no app routes).

**Evidence:** Schema: `SiteLogEntry` in `packages/database/prisma/schema.prisma` with comment “Legacy … can be deprecated later.” No routes under `projects/[id]/site-log` or similar.

---

### Scheduling / Gantt

**Commercial name:** Cronograma

**What it solves:** Cronogramas por proyecto (Schedule) con tareas (ScheduleTask) y dependencias (TaskDependency); creación y listado; avance (ProgressUpdate). La UI puede ser lista de cronogramas y tareas; vista tipo Gantt a confirmar en componentes.

**Key capabilities:**

- Schedule: projectId, nombre/descripción, createdBy, approvedBy; listado por proyecto.
- ScheduleTask: scheduleId, wbsNodeId opcional, nombre, fechas, duración, progreso, etc.
- TaskDependency: tareas predecesoras/sucesoras.
- ProgressUpdate: vinculación a avance de tareas/WBS.

**Core workflows:**

1. Crear cronograma: Proyecto → Cronograma → Nuevo (nombre, etc.).
2. Agregar tareas: dentro del cronograma; opcionalmente vincular a WBS; dependencias entre tareas.
3. Aprobar cronograma: approvedBy (si está implementado en UI).

**Data/entities:** `Schedule`, `ScheduleTask`, `TaskDependency`, `ProgressUpdate`.

**Status:** Partial — Schedules and tasks in DB; list and “new schedule” routes exist; full Gantt UI to be confirmed in `apps/web/components/schedule/schedule-view.tsx`.

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/schedule/page.tsx`, `schedule/new/page.tsx`. Component: `apps/web/components/schedule/schedule-view.tsx`. Schema: Schedule, ScheduleTask, TaskDependency, ProgressUpdate.

---

### Documents

**Commercial name:** Documentos

**What it solves:** Archivos por organización y opcionalmente por proyecto; versionado (DocumentVersion); enlaces a entidades (DocumentLink); tipos y categorías.

**Key capabilities:**

- Document: title, docType, category, description, projectId opcional, isPublic, deleted, createdBy.
- DocumentVersion: versionNumber, fileName, mimeType, sizeBytes, storageKey, checksum, uploadedBy, uploadedAt.
- DocumentLink: entityType, entityId (vincular a proyecto, RFI, etc.).

**Core workflows:**

1. Subir documento: Documentos → Nuevo; seleccionar tipo, categoría, proyecto opcional; subir archivo (primera versión).
2. Nueva versión: en documento existente, subir nuevo archivo (versionNumber incrementado).
3. Vincular: asociar documento a entidad (proyecto, RFI, etc.) vía DocumentLink.

**Data/entities:** `Document`, `DocumentVersion`, `DocumentLink`. Relaciones: Organization, Project?, OrgMember (createdBy, uploadedBy).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/documents/page.tsx`, `documents/[id]/page.tsx`. Actions: `apps/web/app/actions/documents.ts`. Validators: `packages/validators/src/document.ts`.

---

### Reporting / Dashboard

**Commercial name:** Reportes y dashboard

**What it solves:** Dashboard principal con KPIs (proyectos activos, presupuesto total, certificaciones pendientes, gastos del mes), flujo de caja, alertas y actividad reciente; reportes predefinidos (presupuesto vs real, certificaciones, gastos por proveedor, compras multi-proyecto, materiales, etc.); reportes guardados y constructor de consultas (CustomReport, SavedReport).

**Key capabilities:**

- Dashboard org: getOrgKPIs, getCashflowData, getAlerts, getRecentActivity; widgets (KPICards, CashflowChart, AlertsWidget, RecentActivityFeed).
- Reportes predefinidos: budget-vs-actual, top-materials, purchases-multi-project, expenses-by-supplier, certifications; rutas bajo `reports/predefined/*`.
- Reportes guardados: listado CustomReport/SavedReport; ejecución con filtros/columnas; reporte “new” y por id.
- Export: ExportRun (exportType, format, status, fileStorageKey).

**Core workflows:**

1. Ver dashboard: entrar a dashboard → KPIs, gráfico de caja, alertas, actividad.
2. Ejecutar predefinido: Reportes → elegir predefinido → filtrar (proyecto, fechas, etc.) → ver resultado.
3. Crear reporte guardado: Reportes → Nuevo; definir entidad, filtros, columnas; guardar y ejecutar.

**Data/entities:** `SavedReport`, `SavedReportRun`, `CustomReport`, `ExportRun`. AuditLog/activity for recent activity.

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/dashboard/page.tsx`; `reports/page.tsx`, `reports/new/page.tsx`, `reports/[id]/page.tsx`, `reports/predefined/page.tsx`, `reports/predefined/budget-vs-actual/page.tsx`, `reports/predefined/top-materials/page.tsx`, `reports/predefined/purchases-multi-project/page.tsx`, `reports/predefined/expenses-by-supplier/page.tsx`, `reports/predefined/certifications/page.tsx`; `projects/[id]/reports/page.tsx`. Actions: `apps/web/app/actions/dashboard.ts`, `apps/web/app/actions/reports.ts`, `apps/web/app/actions/export.ts`. Validators: `packages/validators/src/reports.ts`.

---

### Settings

**Commercial name:** Configuración

**What it solves:** Perfil de usuario, datos de la organización, equipo e invitaciones, permisos por miembro, seguridad, suscripción y notificaciones.

**Key capabilities:**

- Perfil: nombre, email, avatar (settings/profile).
- Organización: datos legales, moneda, impuestos, logo (settings/organization).
- Equipo: listado de miembros, roles; invitaciones (settings/team, settings/team/invite); permisos por miembro (team/[memberId]/permissions).
- Páginas: security, subscription, notifications (existencia de rutas; contenido puede ser placeholder o funcional según implementación).

**Core workflows:**

1. Editar perfil: Configuración → Perfil; actualizar nombre/avatar.
2. Invitar usuario: Configuración → Equipo → Invitar; email y rol; invitado recibe link con token.
3. Ajustar permisos: en miembro → Permisos; override de permisos por módulo (customPermissions).

**Data/entities:** User, Organization, OrgProfile, OrgMember, Invitation. ModuleActivation, ApiKey (si se exponen en UI).

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/(dashboard)/settings/page.tsx`, `settings/profile/page.tsx`, `settings/organization/page.tsx`, `settings/team/page.tsx`, `settings/team/invite/page.tsx`, `settings/security/page.tsx`, `settings/subscription/page.tsx`, `settings/notifications/page.tsx`; `team/[memberId]/permissions/page.tsx`. Actions: `apps/web/app/actions/team.ts`, auth and org context.

---

### Super-admin

**Commercial name:** Super-admin

**What it solves:** Gestión de organizaciones (suscripción, plan, límites, bloqueo), usuarios y logs para administradores de la plataforma.

**Key capabilities:**

- Login super-admin: ruta separada `(auth)/super-admin/login`.
- Organizaciones: listado, detalle por orgId (subscriptionStatus, subscriptionPlan, maxProjects, maxUsers, maxStorageGB, isBlocked, blockedReason, etc.).
- Usuarios: listado, detalle por userId.
- Logs: SuperAdminLog (acciones sobre orgs, usuarios, suscripciones).

**Data/entities:** Organization (subscription fields, isBlocked, etc.), User (isSuperAdmin), SuperAdminLog, OrgUsageMetrics.

**Status:** Implemented

**Evidence:** Routes: `apps/web/app/[locale]/super-admin/page.tsx`, `super-admin/organizations/page.tsx`, `super-admin/organizations/[orgId]/page.tsx`, `super-admin/users/page.tsx`, `super-admin/users/[userId]/page.tsx`, `super-admin/logs/page.tsx`; `(auth)/super-admin/login/page.tsx`. Actions: `apps/web/app/actions/super-admin.ts`.

---

## D) End-to-end “Day in the life” flows

### 1) Start a project → build budget → approve → start tracking

- Usuario (PM o Admin) crea un **proyecto** desde Proyectos → Nuevo: número, nombre, cliente, ubicación, fase, fechas. Guarda.
- En el mismo proyecto, va a **WBS** y arma la estructura: fases y partidas (código, nombre, categoría, cantidad, unidad). Guarda nodos.
- Entra a **Presupuesto** → Nueva versión. Crea una versión en DRAFT y agrega **líneas** eligiendo nodos WBS, descripción, cantidades, costes y precios de venta; opcionalmente desglose por recursos (material/mano de obra/equipo). Aplica markups si usa modo SIMPLE.
- Cuando el presupuesto está listo, un **Owner/Admin** cambia la versión a aprobada (APPROVED); queda como baseline para certificaciones y control.
- A partir de ahí, el equipo usa **reportes diarios** para registrar avance por partida y **certificaciones** para facturar por período; el **dashboard** del proyecto y de la org muestran KPIs y alertas (presupuesto vs real, retrasos).

### 2) Inventory intake → movement to site → consumption

- En **Inventario → Ítems**, se crea un ítem (ej. cemento, categoría materiales, unidad m³, mínimo de stock). En **Ubicaciones** se tiene “Almacén central” (CENTRAL_WAREHOUSE) y “Obra Norte” (PROJECT_SITE ligada al proyecto).
- Se registra una **compra**: Inventario → Movimientos → Nuevo, tipo PURCHASE, ítem cemento, cantidad, costo unitario, destino “Almacén central”. Queda registrado el movimiento con idempotencyKey.
- Se hace una **transferencia**: tipo TRANSFER, desde Almacén central → a “Obra Norte”, misma cantidad (y opcionalmente proyecto/WBS si se desea trazar).
- En un **reporte diario** del proyecto, en la sección de consumos (Tier 2), se indica consumo de cemento en X m³ para la partida Y; se puede generar o vincular un movimiento tipo ISSUE y quedar ligado a BudgetLine/DailyReport para costos reales.

### 3) Change order → cost impact → certification → billing

- Surge un cambio de alcance. En el proyecto, **Órdenes de cambio** → Nueva: título, tipo, budgetImpactType (ej. APPROVED_CHANGE), razón, impacto en costo y días. Se agregan **líneas** por partida WBS (ADD/MODIFY/DELETE) con cantidades y costes original vs nuevo y justificación.
- Un **Admin/Owner** aprueba la orden de cambio; queda approvedDate y approvedBy. (Opcionalmente el presupuesto se actualiza o se refleja en una nueva versión según implementación.)
- En **Certificaciones** (o Finanzas → Certificaciones del proyecto), se emite una **certificación** del período: se cargan líneas de avance por partida (incluidas las de la orden de cambio si ya están en el presupuesto vigente); se emite y luego un **Contador** la aprueba.
- Los montos aprobados se reflejan en **Finanzas**: flujo de caja e ingresos; se pueden registrar **transacciones** de facturación y **pagos** cuando el cliente paga. Así el cambio de alcance queda trazado desde la CO hasta la cobranza.

---

## E) Feature gaps and roadmap suggestions

| Gap | Commercial rationale | Recommended MVP scope | Technical notes |
|-----|----------------------|------------------------|-----------------|
| **Commitments UI (PO/contracts)** | Los compradores necesitan ver y crear POs/contratos por proyecto y proveedor; hoy solo existe el ratio comprometido en el dashboard. | CRUD de Commitment por proyecto: listado, nueva PO/contrato, líneas por partida, aprobación. Listado de transacciones/pagos vinculados (opcional). | New routes: `apps/web/app/[locale]/(dashboard)/projects/[id]/commitments/page.tsx`, `commitments/new/page.tsx`, `commitments/[commitmentId]/page.tsx`. Actions: create/update/list commitments and lines. Reuse Party (supplier) and WbsNode. |
| **Inspections UI** | Calidad y contratistas piden inspecciones formales (programadas, realizadas, ítems PASS/FAIL). | Listado de inspecciones por proyecto; crear/editar inspección (tipo, partida, fecha, inspector); ítems de inspección (descripción, PASS/FAIL/NA). | New routes: `projects/[id]/quality/inspections/page.tsx`, `inspections/new/page.tsx`, `inspections/[inspectionId]/page.tsx`. Actions for Inspection and InspectionItem. Schema already exists. |
| **Site log** | Libro de obra “simple” por fecha (título, descripción, clima) puede coexistir o reemplazarse por daily reports. | Decidir: (a) deprecar SiteLogEntry y usar solo DailyReport, o (b) ofrecer una vista simple de “entradas de obra” basada en SiteLogEntry con una ruta `projects/[id]/site-log`. | If (b): add `projects/[id]/site-log/page.tsx` and create/list SiteLogEntry. Low priority if daily reports cover the need. |
| **Scheduling (full Gantt)** | Cronograma visual (Gantt) mejora planificación y comunicación con cliente. | Confirmar si `schedule-view` ya renderiza Gantt; si no, añadir vista de barras por tarea con dependencias y fechas. | Component: `apps/web/components/schedule/schedule-view.tsx`. Consider library (e.g. gantt-task-react or similar) for drag-and-drop and dependencies. |
| **GlobalParty claim/review UI** | Proveedores quieren reclamar su ficha en el directorio; compradores quieren valorar. | Página “Reclamar proveedor” (form → GlobalPartyClaim); listado de reclamos para staff. Revisiones: formulario de valoración desde org (GlobalPartyReview) y listado de reseñas en ficha del proveedor. | Routes: e.g. `/suppliers/claim`, `/suppliers/[globalPartyId]/review`; super-admin or org-scoped list of claims. Schema: GlobalPartyClaim, GlobalPartyReview. |
| **Procurement (purchase requests)** | Flujo “solicitud de compra → aprobación → PO” no está modelado como primera clase. | Opcional: modelo PurchaseRequest con líneas y aprobaciones; luego derivar Commitment (PO). Si no, seguir con POs (Commitments) directos como MVP. | If added: new model PurchaseRequest, routes under `projects/[id]/procurement` or org-level; workflow similar to ChangeOrder. |

---

## F) Marketing website — Handoff spec (Next.js)

Handoff spec for implementing a **Next.js marketing site** that drives sign-ups and sends users to the Bloqer app. No code; structure, routes, components, copy, and integration points only.

---

### 1. Purpose and scope

- **Goal:** Inform visitors about Bloqer, capture interest, and send them to the **deployed Bloqer app** to register or log in.
- **Out of scope:** Auth (login/register) lives in the app; the marketing site only links to the app. No forms that create accounts on the marketing site unless you add a separate lead-capture form that posts to a CRM or API.

---

### 2. Routes (Next.js app)

| Route | Purpose |
|-------|--------|
| `/` | Home |
| `/producto` | Product overview |
| `/modulos` | Features / modules (one section per module) |
| `/precios` | Pricing (placeholder or tiers) |
| `/seguridad` | Security / trust |
| `/nosotros` | About (company / mission) |
| `/contacto` | Contact (form or email / demo CTA) |

- **No** `/login` or `/registro` on the marketing site. Login and register are **app routes** only.
- Optional: locale prefix (e.g. `/es/...`) if the marketing site is multi-locale; default Spanish (LatAm).

---

### 3. Required link to the app (login)

- **Login** must go to the **Bloqer app**, not to a page on the marketing site.
- **App login path:** The Bloqer app uses locale-prefixed routes with default locale `es`. The canonical login path is: **`{APP_BASE_URL}/es/login`** (e.g. `https://app.bloqer.com/es/login`).
- **Implementation:** Define an **environment variable** (e.g. `NEXT_PUBLIC_APP_URL` or `BLOQER_APP_URL`) for the app base URL. All “Iniciar sesión” / “Login” links and the header/footer login button must use: **`{APP_BASE_URL}/es/login`**.
- **Register:** Same base URL; path **`/es/register`** (e.g. `{APP_BASE_URL}/es/register`) for “Crear cuenta” / “Registrarse”.
- **After login:** The app redirects authenticated users to its dashboard (e.g. `/es/dashboard`). No change needed on the marketing site; the user leaves the marketing site when they click Login/Register.

---

### 4. Pages (content structure)

| Page | Route | Content structure |
|------|--------|-------------------|
| **Home** | `/` | Hero (headline + subhead + primary CTA “Empezar” / “Crear cuenta” → app register; secondary CTA “Iniciar sesión” → app login). Value props (short bullets or cards). Optional: social proof / logos. Footer with nav + Login link. |
| **Producto** | `/producto` | Short overview of the platform; 1–2 paragraphs. CTA to “Ver módulos” (`/modulos`) and “Empezar” / “Crear cuenta” (app register). |
| **Módulos** | `/modulos` | One subsection per main module: Presupuesto, Certificaciones, Inventario, Proveedores, Libro de obra (reportes diarios), Finanzas, Reportes y dashboard. Each: short commercial title + 1–2 lines. Optional anchor links. CTA “Empezar” / “Crear cuenta” (app register). |
| **Precios** | `/precios` | Placeholder: “Próximamente” or basic tier names + short description. CTA “Contactanos” (`/contacto`) or “Empezar” (app register). |
| **Seguridad** | `/seguridad` | Trust copy: datos en la nube, control de acceso por roles y organizaciones, buenas prácticas (según lo que se ofrezca). CTA “Empezar” (app register). |
| **Nosotros** | `/nosotros` | Company/team and mission. CTA “Contacto” (`/contacto`) or “Empezar” (app register). |
| **Contacto** | `/contacto` | Form (nombre, email, mensaje) and/or email link; optional “Agendá una demo” (Calendly or similar). No login form. |

---

### 5. Layout and components (suggested)

- **Root layout:** Wraps all pages; includes header and footer.
- **Header:** Logo (link to `/`), nav links (Producto, Módulos, Precios, Seguridad, Nosotros, Contacto), and a prominent **Login** button/link → `{APP_BASE_URL}/es/login`. Optionally a **“Crear cuenta”** or **“Empezar”** button → `{APP_BASE_URL}/es/register`.
- **Footer:** Same nav links (optional), Login link again → `{APP_BASE_URL}/es/login`, legal links if needed (Privacidad, Términos). Optional: small print “¿Ya tenés cuenta? Iniciar sesión” with same app login URL.
- **Reusable:** Hero (headline, subhead, primary + secondary CTA); ValueCards or ValueList; CTAButton (configurable label + href, e.g. app register or app login); Section (title + body + optional CTA).
- **Contact page:** Form component (fields: nombre, email, mensaje; submit to API route, email service, or mailto) and/or DemoCTA block.

---

### 6. Copy blocks (Spanish LatAm, voseo)

Use these as-is or adapt; all CTAs that go to the app must use the app base URL from env.

**Global (header/footer)**

- Login button/link label: **“Iniciar sesión”**
- Register/primary CTA label: **“Crear cuenta gratis”** or **“Empezar con Bloqer”**

**Home**

- Hero headline: **“Controlá presupuestos, certificaciones e inventario de obra en un solo lugar.”**
- Hero subhead: **“Bloqer es la plataforma de gestión para constructoras y desarrolladores.”**
- Primary CTA: **“Empezar con Bloqer”** or **“Crear cuenta gratis”** → app register.
- Secondary CTA: **“Iniciar sesión”** → app login.
- Value bullets (short): Presupuesto versionado y aprobado · Certificaciones de avance con trazabilidad · Inventario por ubicaciones y movimientos · Libro de obra diario con fotos y consumos · Directorio de proveedores · Finanzas y flujo de caja por proyecto

**Producto**

- Title: **“Producto”** or **“La plataforma”**
- Body (short): Todo lo que necesitás para controlar proyectos, presupuestos, certificaciones e inventario de obra en una sola plataforma. Multi-tenant para equipos y organizaciones.
- CTA: **“Ver módulos”** → `/modulos`; **“Empezar con Bloqer”** → app register.

**Módulos**

- Title: **“Módulos y funcionalidades”**
- Per module (title + one line): Presupuesto — Versiones, aprobación y líneas por partida · Certificaciones — Avance por período con trazabilidad · Inventario — Ítems, ubicaciones y movimientos · Proveedores — Directorio global y locales · Libro de obra — Reportes diarios, fotos y consumos · Finanzas — Transacciones, pagos y flujo de caja · Reportes y dashboard — KPIs y reportes predefinidos
- CTA: **“Empezar con Bloqer”** → app register.

**Precios**

- Title: **“Precios”**
- Placeholder: **“Planes para equipos y empresas. Contactanos para ver opciones.”**
- CTA: **“Contactanos”** → `/contacto` or **“Empezar”** → app register.

**Seguridad**

- Title: **“Seguridad”**
- Short copy: **“Tus datos en infraestructura segura; control de acceso por roles y organizaciones.”**
- CTA: **“Empezar con Bloqer”** → app register.

**Contacto**

- Title: **“Contacto”**
- Intro: **“¿Consultas? Escribinos o agendá una demo.”**
- Form labels: Nombre, Email, Mensaje (or equivalent). Submit: “Enviar” or “Enviar mensaje”.

**Nosotros**

- Title: **“Nosotros”**
- Body: Company/team and mission (to be filled). CTA: **“Contacto”** → `/contacto` or **“Empezar”** → app register.

---

### 7. SEO (page title and meta description)

| Page | Title | Meta description |
|------|--------|-------------------|
| Home | Bloqer — Gestión de construcción y presupuestos | Plataforma de gestión para constructoras: presupuesto, certificaciones, inventario, reportes diarios y finanzas. Multi-tenant para LatAm. |
| Producto | Producto — Bloqer | Todo lo que necesitás para controlar proyectos, presupuestos, certificaciones e inventario de obra en una sola plataforma. |
| Módulos | Módulos y funcionalidades — Bloqer | Presupuesto, certificaciones, inventario, proveedores, libro de obra, finanzas y reportes en Bloqer. |
| Precios | Precios — Bloqer | Planes para equipos y empresas. Contactanos para conocer opciones. |
| Seguridad | Seguridad — Bloqer | Cómo protegemos tus datos y el acceso a tu organización en Bloqer. |
| Nosotros | Nosotros — Bloqer | Conocé al equipo y la misión de Bloqer. |
| Contacto | Contacto — Bloqer | Contactanos para consultas, demos o soporte. |

---

### 8. Checklist for implementer

- [ ] All “Iniciar sesión” / “Login” links use `{APP_BASE_URL}/es/login` (env-driven).
- [ ] All “Crear cuenta” / “Empezar” / “Registrarse” links use `{APP_BASE_URL}/es/register` (env-driven).
- [ ] No login or register page on the marketing site; auth is app-only.
- [ ] Header and footer each have a visible Login link to the app.
- [ ] Routes match the table in section 2 (or documented if different).
- [ ] Copy blocks and SEO titles/descriptions applied per page.
- [ ] Contact form or contact method wired (API, email, or mailto).

---

## Quick index

- [A) Executive summary](#a-executive-summary)
- [B) Personas and target customers](#b-personas-and-target-customers)
- [C) Product modules catalog](#c-product-modules-catalog)
  - [Auth and organization](#auth-and-organization)
  - [Projects](#projects)
  - [Budget / Presupuesto](#budget--presupuesto)
  - [WBS / Takeoff](#wbs--takeoff-cómputo)
  - [Change orders / Adicionales](#change-orders--adicionales)
  - [Certifications / Progress billing](#certifications--progress-billing)
  - [Finance / Cashflow](#finance--cashflow)
  - [Commitments (PO / Contracts)](#commitments-po--contracts)
  - [Suppliers / Proveedores](#suppliers--proveedores)
  - [Inventory / Inventario](#inventory--inventario)
  - [Materials / Catalog](#materials--catalog-recursos)
  - [Quality: RFIs](#quality-rfis)
  - [Quality: Submittals](#quality-submittals)
  - [Quality: Inspections](#quality-inspections)
  - [Daily reports / Libro de obra](#daily-reports--libro-de-obra)
  - [Site log](#site-log)
  - [Scheduling / Gantt](#scheduling--gantt)
  - [Documents](#documents)
  - [Reporting / Dashboard](#reporting--dashboard)
  - [Settings](#settings)
  - [Super-admin](#super-admin)
- [D) End-to-end “Day in the life” flows](#d-end-to-end-day-in-the-life-flows)
- [E) Feature gaps and roadmap suggestions](#e-feature-gaps-and-roadmap-suggestions)
- [F) Marketing website — Handoff spec](#f-marketing-website--handoff-spec-nextjs)
