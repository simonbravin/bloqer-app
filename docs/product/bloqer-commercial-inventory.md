# Bloqer — Inventario comercial y blueprint de marketing

Documento de handoff para Product Marketing + Solutions Architect: inventario comercial y funcional de la app Bloqer (Construction ERP), arquitectura de información por rol, y blueprint del sitio de marketing para implementar en Next.js. Lengua: español (LatAm) con voseo. Referencia base: `bloqer-product-overview.md`. Rutas del sitio de marketing: `/`, `/producto`, `/modulos`, `/precios`, `/seguridad`, `/nosotros`, `/contacto`. CTAs de login/registro apuntan a la app: Login `{APP_BASE_URL}/es/login`, Register `{APP_BASE_URL}/es/register`.

---

## 1) Executive summary

Bloqer es un ERP de construcción multi-tenant (SaaS) para constructoras y desarrolladores en LatAm. Centraliza proyectos, presupuestos versionados y aprobados, certificaciones de avance, inventario por ubicaciones y movimientos, libro de obra diario con consumos y proveedores, directorio global y local de proveedores, finanzas multi-moneda con flujo de caja y gastos generales, y reportes predefinidos y guardados. La app está desplegada; el sitio de marketing no implementa auth y debe enlazar a la app para login (`{APP_BASE_URL}/es/login`) y registro (`{APP_BASE_URL}/es/register`). Este documento entrega: (1) catálogo comercial de todos los módulos con propuesta de valor, problemas que resuelven, capacidades, flujos, entidades, rutas, estado y evidencia en código; (2) IA propuesta del sidebar por rol (admin de constructora, PM, supervisor de obra, finanzas); (3) blueprint página a página del sitio de marketing con copy, CTAs y componentes reutilizables; (4) preguntas abiertas y gaps.

---

## 2) Modules catalog (App Commercial Module Map)

Para cada módulo: nombre comercial (español), propuesta de valor en una línea, problemas que resuelve, capacidades clave, flujos principales, entidades/datos, puntos de entrada en UI, estado y evidencia (rutas, actions, validators, componentes, schema).

---

### 2.1 Autenticación y organización (Auth & Organization)

**Nombre comercial:** Autenticación y organización

**Propuesta de valor en una línea:** Inicio de sesión, registro e invitaciones por organización con control de acceso por roles y permisos por módulo en un entorno multi-tenant.

**Problemas que resuelve (resultados de negocio):**

- Evitar accesos no autorizados y mantener un único lugar de identidad por organización.
- Reducir fricción al sumar usuarios (invitación por email con token).
- Asegurar que cada rol vea solo lo que corresponde (dashboard, proyectos, finanzas, etc.).
- Permitir ajustes granulares por usuario (permisos personalizados por módulo).
- Soportar múltiples organizaciones (tenant) con límites por suscripción (super-admin).

**Capacidades clave:**

- Login con email y contraseña; registro que crea organización + primer usuario como OWNER.
- Invitación por email con token; aceptación en ruta `/[locale]/(auth)/invite/[token]`.
- Roles: OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER; permisos por módulo (view, create, edit, delete, approve, export).
- Permisos personalizados por miembro (override por módulo).
- Sesión y contexto de organización; redirección a login cuando no hay sesión.

**Flujos principales:**

1. Registrarse: completar formulario → crear Organization + OrgMember (OWNER) + User.
2. Iniciar sesión: ingresar credenciales → validar → sesión; redirigir a dashboard.
3. Invitar: OWNER/ADMIN envía invitación por email → invitado abre link con token → acepta y se une a la org con rol asignado.

**Entidades / modelo de datos:** `User`, `Organization`, `OrgMember`, `Invitation`, `Session`, `RefreshToken`, `UserOrgPreference`. Enum `OrgRole` (OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER). Campos relevantes: OrgMember.role, OrgMember.customPermissions (JSON).

**Puntos de entrada en UI:** Rutas: `/[locale]/(auth)/login`, `/[locale]/(auth)/register`, `/[locale]/(auth)/invite/[token]`, `/[locale]/(auth)/unauthorized`. Nav: no aparece en sidebar; acceso desde landing y redirecciones.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(auth)/login/page.tsx`, `register/page.tsx`, `invite/[token]/page.tsx`, `unauthorized/page.tsx`. `apps/web/app/actions/auth.ts`. `apps/web/lib/permissions.ts` (MODULES, ROLE_PERMISSIONS, canAccess). `apps/web/hooks/use-permissions.ts`. `apps/web/middleware.ts` (canViewModule). Schema: `packages/database/prisma/schema.prisma` (User, Organization, OrgMember, Invitation, Session, OrgRole).

---

### 2.2 Proyectos (Projects)

**Nombre comercial:** Proyectos

**Propuesta de valor en una línea:** Creación y edición de proyectos con numeración, fase, fechas y cliente; equipos por proyecto y estructura WBS como base para presupuesto y avance.

**Problemas que resuelve:**

- Dejar de depender de hojas sueltas o carpetas por proyecto; una sola fuente de verdad por obra.
- Trazabilidad de fase (pre-construcción, construcción, cierre, completo) y fechas planificadas/reales.
- Asignar quién trabaja en cada proyecto (equipo por proyecto con rol).
- Soportar presupuesto y reportes diarios ligados a partidas (WBS).

**Capacidades clave:**

- Listado de proyectos por organización; filtros por estado/fase.
- Crear y editar proyecto: número, nombre, descripción, cliente, ubicación, m², fase, fechas planificadas/fin real.
- Importar datos de proyecto (ruta `projects/import`).
- Equipo por proyecto: asignar miembros de la org con rol (MANAGER, SUPERINTENDENT, VIEWER).
- WBS: nodos con código, nombre, categoría (PHASE, ZONE, BUDGET_ITEM, TASK, MILESTONE), cantidad, unidad, horas/costo planificado vs real, progreso, fechas y estado de salud.

**Flujos principales:**

1. Crear proyecto: Proyectos → Nuevo → completar formulario → guardar (Project + opcional ProjectMember).
2. Configurar WBS: entrar al proyecto → WBS → agregar/editar nodos jerárquicos (parentId); luego asociar a partidas de presupuesto.
3. Asignar equipo: Proyecto → Equipo del proyecto → agregar miembro de la org con rol.

**Entidades / modelo de datos:** `Project`, `ProjectMember`, `WbsNode`. Enum `ProjectPhase` (PRE_CONSTRUCTION, CONSTRUCTION, CLOSEOUT, COMPLETE). Campos: Project.projectNumber, name, phase, status, startDate, plannedEndDate, actualEndDate, totalBudget; WbsNode.code, name, category, quantity, plannedHours, actualHours, progressPct, healthStatus.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/page.tsx`, `projects/new/page.tsx`, `projects/[id]/page.tsx`, `projects/[id]/edit/page.tsx`, `projects/import/page.tsx`, `projects/[id]/team/page.tsx`, `projects/[id]/wbs/page.tsx`. Nav global: “Proyectos” → `/projects`. Dentro de proyecto: “Equipo del Proyecto”, “WBS” en project-sidebar.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/page.tsx`, `projects/new/page.tsx`, `projects/[id]/page.tsx`, `projects/[id]/edit/page.tsx`, `projects/import/page.tsx`, `projects/[id]/team/page.tsx`, `projects/[id]/wbs/page.tsx`. `apps/web/app/actions/projects.ts`, `apps/web/app/actions/wbs.ts`. `packages/validators/src/project.ts`, `packages/validators/src/wbs.ts`. Schema: Project, ProjectMember, WbsNode, ProjectPhase.

---

### 2.3 Presupuesto (Budget)

**Nombre comercial:** Presupuesto

**Propuesta de valor en una línea:** Versiones de presupuesto por proyecto (baseline, aprobado) con líneas por partida WBS, recursos (material, mano de obra, equipo), markups y aprobación; importación y vista de materiales.

**Problemas que resuelve:**

- Evitar presupuestos en Excel sin versionado ni aprobación formal.
- Trazabilidad de qué versión está aprobada y cuál es la baseline.
- Control de coste directo vs venta por partida (overhead, indirecto, ganancia, impuesto, retención).
- Desglose por recurso (material/mano de obra/equipo) por línea.
- Importar presupuestos existentes y ver resumen de materiales por versión.

**Capacidades clave:**

- Múltiples versiones por proyecto (versionCode, versionType: BASELINE, etc.; status: DRAFT, BASELINE, APPROVED).
- Líneas de presupuesto: wbsNodeId, resourceId opcional, cantidad, coste directo, precio de venta, porcentajes (overhead, indirecto, financiero, ganancia, impuesto, retención).
- Recursos por línea (BudgetResource): tipo MATERIAL/LABOR/EQUIPMENT, descripción, unidad, cantidad, costo unitario.
- Modo markup: SIMPLE (global) o ADVANCED (por línea).
- Aprobación: approvedByOrgMemberId, approvedAt, lockedAt.
- Importar presupuesto; vista “Materiales” por versión; cómputo de APU (validadores budget-compute).

**Flujos principales:**

1. Crear versión: Proyecto → Presupuesto → Nueva versión (DRAFT).
2. Agregar líneas: elegir nodos WBS, descripción, unidad, cantidad, costes/venta; opcionalmente desglose por recursos.
3. Aprobar: cambiar estado a APPROVED (roles con permiso approve).
4. Importar: subir archivo desde `projects/import` o flujo de importación → crear versión/líneas.

**Entidades / modelo de datos:** `BudgetVersion`, `BudgetLine`, `BudgetResource`. Relaciones: Project, WbsNode, Resource (org). Campos: BudgetVersion.versionCode, versionType, status, markupMode, globalOverheadPct, etc.; BudgetLine.quantity, directCostTotal, salePriceTotal, actualCostTotal.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/budget/page.tsx`, `budget/[versionId]/page.tsx`, `budget/[versionId]/materials/page.tsx`, `budget/[versionId]/compute/page.tsx`, `budget/new/page.tsx`. Nav proyecto: “Presupuesto” → `/projects/[id]/budget`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/budget/page.tsx`, `budget/[versionId]/page.tsx`, `budget/[versionId]/materials/page.tsx`, `budget/[versionId]/compute/page.tsx`, `budget/new/page.tsx`. `apps/web/app/actions/budget.ts`, `apps/web/app/actions/import-budget.ts`. `packages/validators/src/budget.ts`, `packages/validators/src/budget-compute.ts`. Schema: BudgetVersion, BudgetLine, BudgetResource.

---

### 2.4 Cómputo / WBS (Takeoff)

**Nombre comercial:** Cómputo / WBS

**Propuesta de valor en una línea:** Estructura de desglose del trabajo (fases, zonas, partidas, tareas, hitos) con cantidades, unidades y avance (horas/costo planificado vs real, progreso, estado de salud).

**Problemas que resuelve:**

- Unificar la estructura de partidas entre presupuesto, certificaciones y reportes diarios.
- Medir avance por partida (progreso, horas reales, coste real).
- Detectar partidas atrasadas o en riesgo (healthStatus: ON_TRACK, AT_RISK, DELAYED, AHEAD).

**Capacidades clave:**

- Árbol de nodos por proyecto (parentId, code, name, category, quantity, unit).
- Campos de avance: plannedHours, plannedCost, actualHours, actualCost, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, progressPct, healthStatus.
- Orden y activación (sortOrder, active).

**Flujos principales:**

1. Crear/editar WBS: Proyecto → WBS → agregar o editar nodos; jerarquía por parentId.
2. Vincular a presupuesto: al crear BudgetLine se asocia wbsNodeId.
3. Avance: actualizado desde reportes diarios (WbsProgressUpdate, BudgetLineActualCost) y/o cronograma.

**Entidades / modelo de datos:** `WbsNode` (projectId, parentId, code, name, category, quantity, unit, plannedHours, plannedCost, actualHours, actualCost, progressPct, healthStatus, fechas).

**Puntos de entrada en UI:** Ruta: `/[locale]/(dashboard)/projects/[id]/wbs/page.tsx`. Nav proyecto: “WBS” / “Cómputo” → `/projects/[id]/wbs`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/wbs/page.tsx`. `apps/web/app/actions/wbs.ts`. `packages/validators/src/wbs.ts`. Schema: WbsNode.

---

### 2.5 Materiales / Catálogo de recursos (Materials / Resource catalog)

**Nombre comercial:** Materiales / Catálogo de recursos

**Propuesta de valor en una línea:** Catálogo de recursos reutilizables por organización (material, mano de obra, equipo, subcontrato) para usar en líneas de presupuesto; vista de materiales por versión.

**Problemas que resuelve:**

- Evitar duplicar ítems en cada presupuesto; reutilizar códigos y costos por organización.
- Ver resumen de materiales por versión de presupuesto (cantidades y costes).
- Vincular recurso a proveedor (Party) para trazabilidad.

**Capacidades clave:**

- Resource: code, name, category (MATERIAL|LABOR|EQUIPMENT|SUBCONTRACT|OTHER), unit, unitCost, supplierId (Party); org-wide.
- Uso en BudgetLine (resourceId opcional) y en BudgetResource dentro de líneas.
- Vista “Materiales” por versión: `budget/[versionId]/materials`.

**Flujos principales:**

1. Dar de alta recurso: (desde contexto de presupuesto o catálogo si existe ruta) — código, nombre, categoría, unidad, costo, proveedor.
2. En presupuesto: al crear/editar BudgetLine, seleccionar recurso o desglose manual en BudgetResource.

**Entidades / modelo de datos:** `Resource` (orgId, code, name, category, unit, unitCost, supplierId). Relación con BudgetLine, Party.

**Puntos de entrada en UI:** Ruta: `/[locale]/(dashboard)/projects/[id]/budget/[versionId]/materials/page.tsx`. Acceso desde Presupuesto → versión → Materiales.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/budget/[versionId]/materials/page.tsx`. Schema: Resource. `packages/validators/src/resource.ts`.

---

### 2.6 Órdenes de cambio / Adicionales (Change Orders)

**Nombre comercial:** Órdenes de cambio / Adicionales

**Propuesta de valor en una línea:** Registro de cambios de alcance con impacto en costo y plazo; líneas por partida WBS (ADD/MODIFY/DELETE) y flujo de aprobación; tipo de impacto (desviación vs cambio aprobado).

**Problemas que resuelve:**

- Trazabilidad de adicionales y variaciones frente al presupuesto original.
- Aprobación formal (quién pidió, quién aprobó, fecha).
- Diferenciar desviación de costo vs cambio de alcance aprobado (budgetImpactType).
- Vincular CO a partida WBS y opcionalmente a BudgetVersion y Party.

**Capacidades clave:**

- Crear orden de cambio: número, título, changeType, budgetImpactType (DEVIATION | APPROVED_CHANGE), razón, justificación, costImpact, timeImpactDays, party (opcional).
- Líneas: wbsNodeId, changeType (ADD|MODIFY|DELETE), cantidades y costes original vs nuevo, deltaCost, justificación.
- Estados: DRAFT → aprobación (approvedByOrgMemberId, approvedDate); rechazo con rejectionReason.
- Vinculación opcional a BudgetVersion y WorkflowInstance.

**Flujos principales:**

1. Solicitar: usuario crea CO (DRAFT) y líneas; envía a aprobación.
2. Aprobar/rechazar: ADMIN/OWNER aprueba o rechaza; se registra en ChangeOrderApproval.
3. Implementar: implementedDate cuando se aplica en obra.

**Entidades / modelo de datos:** `ChangeOrder`, `ChangeOrderLine`, `ChangeOrderApproval`. Relaciones: Project, BudgetVersion?, Party?, OrgMember (requestedBy, approvedBy).

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/change-orders/page.tsx`, `change-orders/new/page.tsx`, `change-orders/[coId]/page.tsx`, `change-orders/[coId]/edit/page.tsx`. Nav proyecto: no aparece como ítem en project-sidebar; acceso desde detalle del proyecto o breadcrumb (evidencia: rutas existen).

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/change-orders/page.tsx`, `change-orders/new/page.tsx`, `change-orders/[coId]/page.tsx`, `change-orders/[coId]/edit/page.tsx`. `apps/web/app/actions/change-orders.ts`. `packages/validators/src/change-order.ts`. Schema: ChangeOrder, ChangeOrderLine, ChangeOrderApproval.

---

### 2.7 Certificaciones / Facturación por avance (Certifications)

**Nombre comercial:** Certificaciones / Facturación por avance

**Propuesta de valor en una línea:** Emisión de certificaciones de avance por período (mes/año) con líneas por partida, montos y cantidades snapshot, emisión y aprobación con trazabilidad e integridad.

**Problemas que resuelve:**

- Sustituir certificaciones en PDF/Excel por registros inmutables con sellado.
- Trazabilidad de quién emitió y quién aprobó; fechas de emisión y aprobación.
- Cálculo de avance acumulado y período por partida (prevProgressPct, periodProgressPct, totalProgressPct).
- Alimentar reportes de ingresos y flujo de caja.

**Capacidades clave:**

- Listado de certificaciones por proyecto (número, período, estado, monto total).
- Crear certificación: período (month/year), notas; líneas por BudgetLine con prevProgressPct, periodProgressPct, totalProgressPct, cantidades y montos snapshot.
- Estados: DRAFT → issued (issuedBy, issuedAt) → APPROVED (approvedBy, approvedAt); integritySeal.
- Vista desde proyecto: `projects/[id]/certifications` y `projects/[id]/finance/certifications` (list, new, [certId], edit).

**Flujos principales:**

1. Emitir: usuario con permiso crea certificación DRAFT; completa líneas de avance por partida; emite (issued).
2. Aprobar: contador/admin aprueba; certificación pasa a APPROVED.
3. Facturación: montos aprobados alimentan reportes de ingresos y flujo de caja.

**Entidades / modelo de datos:** `Certification`, `CertificationLine`. Relaciones: Project, BudgetVersion, OrgMember (issuedBy, approvedBy), BudgetLine, WbsNode. Campos: CertificationLine.prevProgressPct, periodProgressPct, totalProgressPct, contractualQtySnapshot, unitPriceSnapshot, periodAmount, totalAmount.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/certifications/page.tsx`, `certifications/new/page.tsx`, `certifications/[certId]/page.tsx`; `projects/[id]/finance/certifications/page.tsx`, `finance/certifications/new/page.tsx`, `finance/certifications/[certId]/page.tsx`, `[certId]/edit/page.tsx`. Nav proyecto: “Certificaciones” → `/projects/[id]/certifications`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/certifications/page.tsx`, `certifications/new/page.tsx`, `certifications/[certId]/page.tsx`; `projects/[id]/finance/certifications/page.tsx`, `finance/certifications/new/page.tsx`, `finance/certifications/[certId]/page.tsx`, `[certId]/edit/page.tsx`. `apps/web/app/actions/certifications.ts`. `packages/validators/src/certification.ts`. Schema: Certification, CertificationLine.

---

### 2.8 Finanzas y flujo de caja (Finance / Cashflow)

**Nombre comercial:** Finanzas y flujo de caja

**Propuesta de valor en una línea:** Transacciones (ingresos, gastos, compras, ventas, gastos generales), pagos y asignación de gastos generales a proyectos; flujo de caja y dashboard financiero por organización y por proyecto.

**Problemas que resuelve:**

- Centralizar facturas y pagos en un solo lugar por organización y por proyecto.
- Repartir gastos generales entre proyectos (OverheadAllocation).
- Ver flujo de caja por período (ingresos vs gastos).
- Multi-moneda (Currency, ExchangeRate) y amountBaseCurrency.

**Capacidades clave:**

- Transacciones: tipo (EXPENSE, INCOME, PURCHASE, SALE, OVERHEAD), número, fechas (emisión, vencimiento, pago), moneda, subtotal, impuesto, total, amountBaseCurrency; opcionalmente projectId, partyId, dailyReportId.
- Líneas por transacción (FinanceLine): descripción, wbsNodeId opcional, cantidad, precio, total.
- Pagos: Payment (paidOn, amount, method, reference) sobre transacción.
- Gastos generales: OverheadAllocation por transacción y proyecto (allocationPct, allocationAmount).
- Dashboard financiero org: KPIs y flujo de caja; por proyecto: transacciones, flujo de caja, certificaciones.

**Flujos principales:**

1. Registrar transacción: crear FinanceTransaction + FinanceLine(s); asociar proyecto/party si aplica.
2. Registrar pago: crear Payment sobre transacción; actualizar paidDate si corresponde.
3. Asignar gastos generales: desde transacción OVERHEAD → asignar % o monto a proyectos (OverheadAllocation).
4. Ver flujo de caja: reportes por período (ingresos vs gastos).

**Entidades / modelo de datos:** `FinanceTransaction`, `FinanceLine`, `Payment`, `OverheadAllocation`. Schema finance: `Currency`, `ExchangeRate`. Relaciones: Organization, Project?, Party?, DailyReport?, OrgMember (createdBy, deletedBy).

**Puntos de entrada en UI:** Rutas org: `/[locale]/(dashboard)/finance/page.tsx`, `finance/transactions/page.tsx`, `finance/cashflow/page.tsx`, `finance/overhead/page.tsx`. Rutas proyecto: `projects/[id]/finance/page.tsx`, `projects/[id]/finance/cashflow/page.tsx`, `projects/[id]/finance/transactions/page.tsx`. Nav global: “Finanzas” → `/finance`. Nav proyecto: “Finanzas” (y sub ítems Transacciones, Flujo de caja).

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/finance/page.tsx`, `finance/transactions/page.tsx`, `finance/cashflow/page.tsx`, `finance/overhead/page.tsx`; `apps/web/app/[locale]/(dashboard)/projects/[id]/finance/page.tsx`, `finance/cashflow/page.tsx`, `finance/transactions/page.tsx`. `apps/web/app/actions/finance.ts`, `finance-transactions.ts`, `finance-cashflow.ts`, `finance-overhead.ts`, `finance-helpers.ts`, `finance-kpis.ts`. `packages/validators/src/finance.ts`. Schema: FinanceTransaction, FinanceLine, Payment, OverheadAllocation, Currency, ExchangeRate.

---

### 2.9 Compromisos / Órdenes de compra (Commitments / PO)

**Nombre comercial:** Compromisos (Órdenes de compra / Contratos)

**Propuesta de valor en una línea:** En schema, compromisos de compra o contrato por proyecto y proveedor (PO, CONTRACT, SUBCONTRACT) con total y líneas por WBS; en la app se usan para métrica de compromiso vs presupuesto pero no hay CRUD en UI.

**Problemas que resuelve (cuando exista UI):**

- Registrar POs y contratos por proyecto y proveedor.
- Comparar comprometido vs presupuesto (commitment ratio).
- Trazabilidad de líneas por partida (CommitmentLine.wbsNodeId).

**Capacidades clave (schema):**

- Commitment: projectId, partyId, commitmentType (PO|CONTRACT|SUBCONTRACT), commitmentNumber, status, issueDate, startDate, endDate, total, currency, totalBaseCurrency, createdBy, approvedBy.
- CommitmentLine: wbsNodeId, description, quantity, unitPrice, lineTotal.

**Flujos principales (cuando exista UI):**

1. Crear PO/contrato: seleccionar proyecto y proveedor; agregar líneas (partida, cantidad, precio).
2. Aprobar: approvedBy; vincular a transacciones/pagos cuando se factura.

**Entidades / modelo de datos:** `Commitment`, `CommitmentLine`. Usado en código: `apps/web/app/actions/project-dashboard.ts` (commitmentRatio: totalCommitted vs totalBudget).

**Puntos de entrada en UI:** No hay rutas dedicadas para CRUD de compromisos. Métrica “commitment ratio” aparece en dashboard del proyecto (project-dashboard.ts).

**Estado:** Partial — Modelo de datos y métrica en dashboard; sin rutas de UI para CRUD.

**Evidencia:** Schema: `packages/database/prisma/schema.prisma` (Commitment, CommitmentLine). `apps/web/app/actions/project-dashboard.ts` (prisma.commitment.aggregate). No existen `projects/[id]/commitments/*` en app.

---

### 2.10 Proveedores (Suppliers)

**Nombre comercial:** Proveedores

**Propuesta de valor en una línea:** Directorio global de proveedores (verificados, categorías, regiones) y enlaces por organización; proveedores locales (Party tipo SUPPLIER); búsqueda y gestión de términos.

**Problemas que resuelve:**

- Encontrar proveedores por categoría/región sin depender solo de listas locales.
- Mantener un enlace por organización con alias, contacto local, términos de pago y preferencia.
- Gestionar proveedores propios (Party SUPPLIER) para compras y contratos.
- (Futuro) Reclamar ficha global y valorar proveedores (schema existe; UI no encontrada).

**Capacidades clave:**

- Directorio global: GlobalParty (nombre, categoría, subcategorías, países, regiones, verificado, valoraciones, productos GlobalProduct). Búsqueda por nombre/categoría.
- Enlace por org: OrgPartyLink (localAlias, contactos locales, preferred, status, paymentTerms, discountPct, creditLimit, totalOrders, totalSpent). Crear/editar enlace desde UI.
- Proveedores locales: Party con partyType SUPPLIER; CRUD en `suppliers/local` y `suppliers/local/new`.
- Claim/review: GlobalPartyClaim, GlobalPartyReview en schema; no se encontraron rutas de UI.

**Flujos principales:**

1. Buscar proveedor global: Proveedores → búsqueda → resultados GlobalParty.
2. Enlazar a mi org: crear OrgPartyLink con alias, contacto, términos; queda en pestaña “Enlazados”.
3. Gestionar locales: Proveedores → Locales → listado Party SUPPLIER; crear/editar.

**Entidades / modelo de datos:** `Party`, `PartyContact`; `GlobalParty`, `GlobalPartyContact`, `OrgPartyLink`, `GlobalPartyClaim`, `GlobalPartyReview`, `GlobalProduct`.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/suppliers/page.tsx`, `suppliers/local/page.tsx`. Nav global: “Proveedores” (Suppliers) → `/suppliers`; en `global-sidebar.tsx` el ítem usa module PROJECTS para canView.

**Estado:** Implemented (directorio global + Party locales + OrgPartyLink). Partial: UI de reclamar/valorar proveedores globales no encontrada (Schema-only para claim/review).

**Evidencia:** `apps/web/app/[locale]/(dashboard)/suppliers/page.tsx`, `suppliers/local/page.tsx`. `apps/web/app/actions/global-suppliers.ts`. `packages/validators/src/global-suppliers.ts`. Schema: Party, GlobalParty, OrgPartyLink, GlobalPartyContact, GlobalPartyClaim, GlobalPartyReview, GlobalProduct.

---

### 2.11 Inventario (Inventory)

**Nombre comercial:** Inventario

**Propuesta de valor en una línea:** Catálogo de ítems por organización (categoría/subcategoría), ubicaciones (central, obra, proveedor) y movimientos (compra, transferencia, entrega, ajuste) con idempotencia; stock por ubicación vía movimientos.

**Problemas que resuelve:**

- Dejar de llevar inventario en planillas; un solo catálogo por organización.
- Trazabilidad de entradas y salidas por ubicación y proyecto.
- Evitar doble registro de movimientos (idempotencyKey).
- Vincular consumos a reportes diarios (InventoryConsumption) para costos reales por partida.

**Capacidades clave:**

- Ítems: SKU, nombre, descripción, categoría/subcategoría (InventoryCategory, InventorySubcategory), unidad, minStockQty, reorderQty; CRUD y listado.
- Ubicaciones: tipo (CENTRAL_WAREHOUSE, PROJECT_SITE, SUPPLIER), nombre, proyecto opcional; CRUD.
- Movimientos: tipo PURCHASE|TRANSFER|ISSUE|ADJUSTMENT, fromLocationId, toLocationId, projectId, wbsNodeId opcional, quantity, unitCost, totalCost, idempotencyKey, createdBy; opcionalmente transactionId o dailyReportId.
- Consumos en reporte diario: InventoryConsumption (dailyReportId, inventoryItemId, quantity, costPerUnit, totalCost, movementId).

**Flujos principales:**

1. Alta de ítem: Inventario → Ítems → Nuevo (categoría, SKU, nombre, unidad, mínimos).
2. Alta de ubicación: Inventario → Ubicaciones → Nueva (tipo, nombre, proyecto si es obra).
3. Compra: Movimientos → Nuevo → tipo PURCHASE, ítem, cantidad, costo, ubicación destino.
4. Transferencia a obra: tipo TRANSFER, desde central → a ubicación proyecto.
5. Entrega a partida: tipo ISSUE, desde ubicación obra, wbsNodeId; opcionalmente vinculado a daily report (consumo).

**Entidades / modelo de datos:** `InventoryCategory`, `InventorySubcategory`, `InventoryItem`, `InventoryLocation`, `InventoryMovement`, `InventoryConsumption`. Schema inventory. Relaciones: Organization, Project?, WbsNode?, FinanceTransaction?, DailyReport?, OrgMember.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/inventory/page.tsx`, `inventory/items/page.tsx`, `inventory/items/[id]/page.tsx`, `inventory/items/new/page.tsx`, `inventory/items/[id]/edit/page.tsx`, `inventory/locations/page.tsx`, `inventory/movements/page.tsx`, `inventory/movements/new/page.tsx`. Nav global: “Inventario” → `/inventory`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/inventory/page.tsx`, `inventory/items/page.tsx`, `inventory/items/[id]/page.tsx`, `inventory/items/new/page.tsx`, `inventory/items/[id]/edit/page.tsx`, `inventory/locations/page.tsx`, `inventory/movements/page.tsx`, `inventory/movements/new/page.tsx`. `apps/web/app/actions/inventory.ts`. `packages/validators/src/inventory.ts`. Schema: InventoryCategory, InventorySubcategory, InventoryItem, InventoryLocation, InventoryMovement, InventoryConsumption.

---

### 2.12 Calidad: RFIs (Quality — RFIs)

**Nombre comercial:** RFIs / Consultas técnicas

**Propuesta de valor en una línea:** Registro de solicitudes de información (RFI) por proyecto: pregunta, prioridad, partida WBS opcional, asignado, respuesta y cierre.

**Problemas que resuelve:**

- Centralizar consultas técnicas en el proyecto (no en correos sueltos).
- Asignar responsable y fecha límite; registrar respuesta y cierre.
- Trazabilidad por partida WBS y por autor/asignado.

**Capacidades clave:**

- Crear RFI: número, asunto, pregunta, prioridad, wbsNodeId opcional, raisedBy, assignedTo, dueDate.
- Estados: OPEN → answered (answer, answeredDate) → closed (closedDate).
- Comentarios: RFIComment (orgMemberId, comment).

**Flujos principales:**

1. Crear RFI: Calidad → RFIs → Nuevo; asignar responsable opcional.
2. Responder: editar RFI; completar answer, answeredDate.
3. Cerrar: closedDate cuando se resuelve.

**Entidades / modelo de datos:** `RFI`, `RFIComment`. Schema quality. Relaciones: Project, WbsNode?, OrgMember (raisedBy, assignedTo).

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/quality/page.tsx`, `quality/rfis/page.tsx`, `quality/rfis/new/page.tsx`, `quality/rfis/[rfiId]/page.tsx`. Nav proyecto: Calidad → RFIs.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/quality/page.tsx`, `quality/rfis/page.tsx`, `quality/rfis/new/page.tsx`, `quality/rfis/[rfiId]/page.tsx`. `apps/web/app/actions/quality.ts`. `packages/validators/src/quality.ts` (createRfiSchema, addRfiCommentSchema, answerRfiSchema). Schema: RFI, RFIComment.

---

### 2.13 Calidad: Submittals (Quality — Submittals)

**Nombre comercial:** Submittals / Envíos a revisión

**Propuesta de valor en una línea:** Control de envíos a revisión por proyecto (tipo, sección de especificación, proveedor, fechas de envío y revisión, comentarios y decisión).

**Problemas que resuelve:**

- Registrar qué se envió a revisión, quién revisó y la decisión (aprobado/rechazado).
- Trazabilidad por partida WBS y por proveedor (Party).
- Revisiones con comentarios y fecha.

**Capacidades clave:**

- Crear submittal: número, submittalType, specSection, submittedByPartyId, dueDate; status DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED.
- reviewedByOrgMemberId, reviewedDate, reviewComments; revisionNumber.

**Flujos principales:**

1. Crear submittal: Calidad → Submittals → Nuevo (tipo, partida, proveedor, fecha límite).
2. Enviar: status SUBMITTED; submittedDate.
3. Revisar: revisor asigna reviewedDate y reviewComments; aprueba o rechaza.

**Entidades / modelo de datos:** `Submittal`. Schema quality. Relaciones: Project, WbsNode?, Party? (submittedBy), OrgMember? (reviewedBy).

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/quality/submittals/page.tsx`, `quality/submittals/new/page.tsx`, `quality/submittals/[submittalId]/page.tsx`. Nav proyecto: Calidad → Submittals.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/quality/submittals/page.tsx`, `quality/submittals/new/page.tsx`, `quality/submittals/[submittalId]/page.tsx`. `apps/web/app/actions/quality.ts`. `packages/validators/src/quality.ts` (createSubmittalSchema, reviewSubmittalSchema). Schema: Submittal.

---

### 2.14 Calidad: Inspecciones (Quality — Inspections)

**Nombre comercial:** Inspecciones

**Propuesta de valor en una línea:** En schema, inspecciones por proyecto (tipo, partida WBS, programada, realizada, inspector, hallazgos, acciones correctivas) e ítems de inspección (PASS/FAIL/NA); en la app no hay rutas de UI.

**Problemas que resuelve (cuando exista UI):**

- Registrar inspecciones programadas y realizadas.
- Trazabilidad por partida y por inspector.
- Ítems de inspección con resultado (PASS/FAIL/NA) y notas.

**Capacidades clave (schema):**

- Inspection: projectId, wbsNodeId, number, inspectionType, status (SCHEDULED, etc.), scheduledDate, completedDate, inspectorOrgMemberId, findings, correctiveActions.
- InspectionItem: itemDescription, status (PASS|FAIL|NA), notes.

**Entidades / modelo de datos:** `Inspection`, `InspectionItem`. Schema quality.

**Puntos de entrada en UI:** No hay rutas bajo `projects/[id]/quality/inspections`.

**Estado:** Schema-only — Modelo en Prisma; sin rutas ni componentes de UI.

**Evidencia:** Schema: `packages/database/prisma/schema.prisma` (Inspection, InspectionItem). No existen páginas en `apps/web/app` para inspecciones.

---

### 2.15 Libro de obra / Reportes diarios (Daily reports)

**Nombre comercial:** Libro de obra / Reportes diarios

**Propuesta de valor en una línea:** Registro diario por proyecto: resumen, trabajo realizado, observaciones, clima, mano de obra y equipos, fotos, partidas WBS trabajadas, consumos de inventario e interacciones con proveedores; actualización de avance y costos reales por partida.

**Problemas que resuelve:**

- Sustituir libro de obra en papel por registros digitales con fotos y aprobación.
- Vincular trabajo del día a partidas WBS y a consumos de inventario.
- Registrar interacciones con proveedores (entrega, compra, calidad) para trazabilidad.
- Actualizar avance y costos reales por partida (WbsProgressUpdate, BudgetLineActualCost) y generar alertas (retraso, sobrecoste).

**Capacidades clave:**

- DailyReport: reportDate, summary, workAccomplished, observations, weather, temperatureHigh/Low, delays, safetyIncidents, visitors, deliveries, laborCountTotal, equipmentCountTotal; status DRAFT|SUBMITTED|APPROVED|PUBLISHED; approvedBy, approvedAt; wbsNodeId opcional; budgetLineId, laborCosts, materialCosts, otherCosts, totalCost.
- Labor: trade, workerCount, hoursWorked; Equipment: equipmentType, quantity, hoursUsed.
- Photos: DailyReportPhoto → Document.
- DailyReportWbsNode: vinculación a nodos WBS trabajados.
- InventoryConsumption: ítem, cantidad, costo; opcionalmente movementId.
- DailyReportSupplier: globalPartyId, type (PURCHASE|DELIVERY|ISSUE|COMMUNICATION|VISIT), amount, quantity, deliveryStatus, quality, etc.
- WbsProgressUpdate, BudgetLineActualCost: avance y costos reales por partida desde el reporte.
- Alert: WBS_DELAYED, BUDGET_OVER, BUDGET_CRITICAL, CASHFLOW_RISK vinculadas a daily report.

**Flujos principales:**

1. Crear reporte: Proyecto → Reportes diarios → Nuevo; completar fecha, resumen, trabajo, mano de obra, equipos, fotos; opcionalmente partidas WBS, consumos, proveedores.
2. Enviar: status SUBMITTED.
3. Aprobar: ADMIN/OWNER aprueba (APPROVED/PUBLISHED); se generan actualizaciones de avance y alertas si aplica.

**Entidades / modelo de datos:** `DailyReport`, `DailyReportWbsNode`, `DailyReportLabor`, `DailyReportEquipment`, `DailyReportPhoto`, `InventoryConsumption`, `DailyReportSupplier`, `WbsProgressUpdate`, `BudgetLineActualCost`, `Alert`. Relaciones: Project, OrgMember (createdBy, approvedBy), WbsNode?, BudgetLine?, Document, GlobalParty, InventoryItem.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/daily-reports/page.tsx`, `daily-reports/new/page.tsx`, `daily-reports/[reportId]/page.tsx`, `daily-reports/[reportId]/edit/page.tsx`. Nav proyecto: “Reportes diarios” / “Libro de obra” → `/projects/[id]/daily-reports`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/daily-reports/page.tsx`, `daily-reports/new/page.tsx`, `daily-reports/[reportId]/page.tsx`, `daily-reports/[reportId]/edit/page.tsx`. `apps/web/app/actions/daily-reports.ts`, `apps/web/app/actions/daily-reports-tier2.ts`. `packages/validators/src/daily-reports.ts`, `packages/validators/src/daily-reports-tier2.ts`. Schema: DailyReport, DailyReportWbsNode, DailyReportLabor, DailyReportEquipment, DailyReportPhoto, InventoryConsumption, DailyReportSupplier, WbsProgressUpdate, BudgetLineActualCost, Alert.

---

### 2.16 Libro de obra legacy / Site log (Site Log)

**Nombre comercial:** Libro de obra (entradas simples) / Site log

**Propuesta de valor en una línea:** En schema, entradas simples por proyecto (fecha, título, descripción, clima, creador); comentario en schema: “Legacy … can be deprecated later.” No hay rutas de UI.

**Entidades / modelo de datos:** `SiteLogEntry` (projectId, logDate, title, description, weather, createdByOrgMemberId).

**Puntos de entrada en UI:** Ninguno.

**Estado:** Schema-only / Legacy — Modelo en Prisma; sin rutas; puede deprecarse si el libro de obra diario (Daily reports) cubre el caso.

**Evidencia:** Schema: `packages/database/prisma/schema.prisma` (SiteLogEntry). No hay páginas en app para site-log.

---

### 2.17 Cronograma / Gantt (Scheduling)

**Nombre comercial:** Cronograma / Gantt

**Propuesta de valor en una línea:** Cronogramas por proyecto (Schedule) con tareas (ScheduleTask) y dependencias (TaskDependency); creación y listado; avance (ProgressUpdate). La UI incluye lista de cronogramas y tareas; vista tipo Gantt a confirmar en componentes.

**Problemas que resuelve:**

- Planificar hitos y tareas por proyecto con fechas y dependencias.
- Vincular tareas a WBS (ScheduleTask.wbsNodeId) para trazabilidad.
- (Con Gantt completo) Visualizar barras y dependencias para comunicación con cliente.

**Capacidades clave:**

- Schedule: projectId, nombre/descripción, createdBy, approvedBy; listado por proyecto.
- ScheduleTask: scheduleId, wbsNodeId opcional, nombre, fechas, duración, progreso.
- TaskDependency: tareas predecesoras/sucesoras.
- ProgressUpdate: vinculación a avance de tareas/WBS.

**Flujos principales:**

1. Crear cronograma: Proyecto → Cronograma → Nuevo (nombre, etc.).
2. Agregar tareas: dentro del cronograma; opcionalmente vincular a WBS; dependencias entre tareas.
3. Aprobar cronograma: approvedBy (si está implementado en UI).

**Entidades / modelo de datos:** `Schedule`, `ScheduleTask`, `TaskDependency`, `ProgressUpdate`.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/projects/[id]/schedule/page.tsx`, `schedule/new/page.tsx`. Nav proyecto: “Cronograma” → `/projects/[id]/schedule`. Componente: `apps/web/components/schedule/schedule-view.tsx`.

**Estado:** Partial — Schedules y tasks en DB; listado y “nuevo cronograma” implementados; vista Gantt completa a confirmar en schedule-view.

**Evidencia:** `apps/web/app/[locale]/(dashboard)/projects/[id]/schedule/page.tsx`, `schedule/new/page.tsx`. `apps/web/components/schedule/schedule-view.tsx`. Schema: Schedule, ScheduleTask, TaskDependency, ProgressUpdate.

---

### 2.18 Documentos (Documents)

**Nombre comercial:** Documentos

**Propuesta de valor en una línea:** Archivos por organización y opcionalmente por proyecto; versionado (DocumentVersion); enlaces a entidades (DocumentLink); tipos y categorías.

**Problemas que resuelve:**

- Centralizar planos, especificaciones y contratos en un solo lugar.
- Mantener historial de versiones (DocumentVersion) y vincular a proyecto, RFI, etc. (DocumentLink).
- Control de visibilidad (isPublic) y borrado lógico (deleted).

**Capacidades clave:**

- Document: title, docType, category, description, projectId opcional, isPublic, deleted, createdBy.
- DocumentVersion: versionNumber, fileName, mimeType, sizeBytes, storageKey, checksum, uploadedBy, uploadedAt.
- DocumentLink: entityType, entityId (vincular a proyecto, RFI, etc.).

**Flujos principales:**

1. Subir documento: Documentos → Nuevo; seleccionar tipo, categoría, proyecto opcional; subir archivo (primera versión).
2. Nueva versión: en documento existente, subir nuevo archivo (versionNumber incrementado).
3. Vincular: asociar documento a entidad (proyecto, RFI, etc.) vía DocumentLink.

**Entidades / modelo de datos:** `Document`, `DocumentVersion`, `DocumentLink`. Relaciones: Organization, Project?, OrgMember (createdBy, uploadedBy).

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/documents/page.tsx`, `documents/[id]/page.tsx`. Nav global: “Documentos” → `/documents`. Nav proyecto: “Documentos” → `/projects/[id]/documents`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/documents/page.tsx`, `documents/[id]/page.tsx`. `apps/web/app/actions/documents.ts`. `packages/validators/src/document.ts`. Schema: Document, DocumentVersion, DocumentLink.

---

### 2.19 Dashboard y reportes (Reporting / Dashboard)

**Nombre comercial:** Dashboard y reportes

**Propuesta de valor en una línea:** Dashboard principal con KPIs (proyectos activos, presupuesto total, certificaciones pendientes, gastos del mes), flujo de caja, alertas y actividad reciente; reportes predefinidos y reportes guardados/constructor de consultas.

**Problemas que resuelve:**

- Dar visibilidad ejecutiva de la salud de la organización (KPIs, flujo de caja, alertas).
- Ofrecer reportes listos (presupuesto vs real, certificaciones, gastos por proveedor, compras multi-proyecto, materiales) sin configurar desde cero.
- Permitir guardar reportes personalizados (CustomReport, SavedReport) con filtros y columnas.

**Capacidades clave:**

- Dashboard org: getOrgKPIs, getCashflowData, getAlerts, getRecentActivity; widgets (KPICards, CashflowChart, AlertsWidget, RecentActivityFeed).
- Reportes predefinidos: budget-vs-actual, top-materials, purchases-multi-project, expenses-by-supplier, certifications; rutas bajo `reports/predefined/*`.
- Reportes guardados: listado CustomReport/SavedReport; ejecución con filtros/columnas; reporte “new” y por id.
- Export: ExportRun (exportType, format, status, fileStorageKey).
- Dashboard por proyecto: project-dashboard con KPIs y commitment ratio.

**Flujos principales:**

1. Ver dashboard: entrar a dashboard → KPIs, gráfico de caja, alertas, actividad.
2. Ejecutar predefinido: Reportes → elegir predefinido → filtrar (proyecto, fechas, etc.) → ver resultado.
3. Crear reporte guardado: Reportes → Nuevo; definir entidad, filtros, columnas; guardar y ejecutar.

**Entidades / modelo de datos:** `SavedReport`, `SavedReportRun`, `CustomReport`, `ExportRun`. AuditLog para actividad reciente. Alert para alertas.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/dashboard/page.tsx`; `reports/page.tsx`, `reports/new/page.tsx`, `reports/[id]/page.tsx`, `reports/predefined/page.tsx`, `reports/predefined/budget-vs-actual/page.tsx`, `reports/predefined/top-materials/page.tsx`, `reports/predefined/purchases-multi-project/page.tsx`, `reports/predefined/expenses-by-supplier/page.tsx`, `reports/predefined/certifications/page.tsx`; `projects/[id]/reports/page.tsx`, `projects/[id]/dashboard/page.tsx`. Nav global: “Dashboard” → `/dashboard`, “Reportes” → `/reports`. Nav proyecto: “Reportes” → `/projects/[id]/reports`, “Dashboard” del proyecto → `/projects/[id]/dashboard`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/dashboard/page.tsx`; `reports/page.tsx`, `reports/new/page.tsx`, `reports/[id]/page.tsx`, `reports/predefined/*`. `apps/web/app/actions/dashboard.ts`, `apps/web/app/actions/reports.ts`, `apps/web/app/actions/project-dashboard.ts`. Schema: SavedReport, SavedReportRun, CustomReport, ExportRun, Alert.

---

### 2.20 Equipo y permisos (Team / Permissions)

**Nombre comercial:** Equipo y permisos

**Propuesta de valor en una línea:** Listado de miembros de la organización, invitaciones por email con rol, y permisos personalizados por miembro por módulo.

**Problemas que resuelve:**

- Ver quién pertenece a la org y con qué rol.
- Invitar nuevos usuarios sin dar acceso total (rol por defecto).
- Ajustar permisos por usuario (override por módulo: view, create, edit, delete, approve, export).

**Capacidades clave:**

- Listado de miembros (org); ver rol y estado.
- Invitación: email + rol (OWNER, ADMIN, EDITOR, ACCOUNTANT, VIEWER); token con expiración; aceptación en `/[locale]/(auth)/invite/[token]`.
- Permisos por miembro: team/[memberId]/permissions — customPermissions (JSON) por módulo.

**Flujos principales:**

1. Invitar: Configuración → Equipo → Invitar; email y rol; invitado recibe link con token.
2. Ajustar permisos: en miembro → Permisos; override de permisos por módulo (customPermissions).

**Entidades / modelo de datos:** `OrgMember`, `Invitation`, `User`. OrgMember.customPermissions (JSON). OrgRole.

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/team/page.tsx`, `team/[memberId]/permissions/page.tsx`; `settings/team/page.tsx`, `settings/team/invite/page.tsx`. Nav global: “Equipo” → `/team`; Configuración → Equipo, Invitar.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/team/page.tsx`, `team/[memberId]/permissions/page.tsx`; `settings/team/page.tsx`, `settings/team/invite/page.tsx`. `apps/web/app/actions/team.ts`. `apps/web/lib/permissions.ts`, `apps/web/api/member-permissions/[memberId]/route.ts`. Schema: OrgMember, Invitation, OrgRole.

---

### 2.21 Configuración (Settings)

**Nombre comercial:** Configuración

**Propuesta de valor en una línea:** Perfil de usuario, datos de la organización, equipo e invitaciones, seguridad, suscripción y notificaciones (preferencias).

**Problemas que resuelve:**

- Centralizar preferencias de usuario y de la organización.
- Editar perfil (nombre, avatar) y datos legales de la org (moneda, impuestos, logo).
- Gestionar equipo e invitaciones desde un mismo lugar (también bajo Equipo).
- Páginas de seguridad, suscripción y notificaciones (contenido puede ser placeholder o funcional).

**Capacidades clave:**

- Perfil: nombre, email, avatar (settings/profile).
- Organización: datos legales, moneda, impuestos, logo (settings/organization).
- Equipo: listado, invitaciones (settings/team, settings/team/invite); permisos por miembro (team/[memberId]/permissions).
- Páginas: security, subscription, notifications (rutas existen; contenido según implementación).

**Flujos principales:**

1. Editar perfil: Configuración → Perfil; actualizar nombre/avatar.
2. Editar organización: Configuración → Organización; actualizar datos legales, moneda, logo.
3. Invitar usuario: Configuración → Equipo → Invitar; email y rol.

**Entidades / modelo de datos:** User, Organization, OrgProfile, OrgMember, Invitation. ModuleActivation, ApiKey (si se exponen en UI).

**Puntos de entrada en UI:** Rutas: `/[locale]/(dashboard)/settings/page.tsx`, `settings/profile/page.tsx`, `settings/organization/page.tsx`, `settings/team/page.tsx`, `settings/team/invite/page.tsx`, `settings/security/page.tsx`, `settings/subscription/page.tsx`, `settings/notifications/page.tsx`. Nav global: “Configuración” → `/settings`.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/(dashboard)/settings/page.tsx`, `settings/profile/page.tsx`, `settings/organization/page.tsx`, `settings/team/page.tsx`, `settings/team/invite/page.tsx`, `settings/security/page.tsx`, `settings/subscription/page.tsx`, `settings/notifications/page.tsx`. Schema: User, Organization, OrgProfile, OrgMember.

---

### 2.22 Notificaciones (Notifications)

**Nombre comercial:** Notificaciones

**Propuesta de valor en una línea:** En schema, notificaciones por usuario/org (Notification); en la app hay un listener global (GlobalNotificationsListener) y una página de preferencias de notificaciones bajo Configuración; no hay listado dedicado de notificaciones in-app como bandeja.

**Problemas que resuelve:**

- Permitir que el sistema envíe notificaciones a usuarios (eventos, alertas, recordatorios).
- Configurar preferencias de notificaciones (página settings/notifications).

**Capacidades clave (schema y UI existente):**

- Notification: userId, orgId, type, title, body, read, link, etc. (schema).
- GlobalNotificationsListener: componente que escucha notificaciones (layout raíz).
- settings/notifications: página de preferencias (título y subtítulo según traducciones).

**Entidades / modelo de datos:** `Notification` (userId, orgId, type, title, body, read, link, etc.).

**Puntos de entrada en UI:** No hay ruta tipo “/notifications” como bandeja de notificaciones. Aparece: componente GlobalNotificationsListener en `apps/web/app/layout.tsx`; página `settings/notifications/page.tsx` para preferencias.

**Estado:** Partial — Schema + listener global + página de preferencias; sin bandeja de notificaciones (inbox) en nav.

**Evidencia:** Schema: `packages/database/prisma/schema.prisma` (Notification). `apps/web/app/layout.tsx` (GlobalNotificationsListener). `apps/web/app/[locale]/(dashboard)/settings/notifications/page.tsx`.

---

### 2.23 Super-admin (Super Admin)

**Nombre comercial:** Super-admin

**Propuesta de valor en una línea:** Gestión de organizaciones (suscripción, plan, límites, bloqueo), usuarios y logs para administradores de la plataforma.

**Problemas que resuelve:**

- Controlar estado de suscripción y límites (proyectos, usuarios, almacenamiento) por organización.
- Bloquear/desbloquear organizaciones y ver motivo.
- Auditar acciones de super-admin (SuperAdminLog).
- Gestionar usuarios (listado, detalle) y organizaciones (listado, detalle por orgId).

**Capacidades clave:**

- Login super-admin: ruta separada `(auth)/super-admin/login`.
- Organizaciones: listado, detalle por orgId (subscriptionStatus, subscriptionPlan, maxProjects, maxUsers, maxStorageGB, isBlocked, blockedReason, etc.).
- Usuarios: listado, detalle por userId.
- Logs: SuperAdminLog (acciones sobre orgs, usuarios, suscripciones).

**Entidades / modelo de datos:** Organization (subscription fields, isBlocked, etc.), User (isSuperAdmin), SuperAdminLog, OrgUsageMetrics.

**Puntos de entrada en UI:** Rutas: `/[locale]/super-admin/page.tsx`, `super-admin/organizations/page.tsx`, `super-admin/organizations/[orgId]/page.tsx`, `super-admin/users/page.tsx`, `super-admin/users/[userId]/page.tsx`, `super-admin/logs/page.tsx`; `(auth)/super-admin/login/page.tsx`. No aparece en sidebar de usuarios normales; acceso directo por URL para super-admins.

**Estado:** Implemented

**Evidencia:** `apps/web/app/[locale]/super-admin/page.tsx`, `super-admin/organizations/page.tsx`, `super-admin/organizations/[orgId]/page.tsx`, `super-admin/users/page.tsx`, `super-admin/users/[userId]/page.tsx`, `super-admin/logs/page.tsx`; `(auth)/super-admin/login/page.tsx`. `apps/web/app/actions/super-admin.ts`. Schema: Organization (subscription fields), User.isSuperAdmin, SuperAdminLog, OrgUsageMetrics.

---

## 3) Role-based navigation / IA (Information Architecture)

Propuesta de **sidebar izquierdo** de la app por rol. La app usa un sidebar global (org) y, dentro de un proyecto, un sidebar de proyecto. La visibilidad se controla con `canView(module)` según `apps/web/lib/permissions.ts` (MODULES y ROLE_PERMISSIONS). Suppliers en global-sidebar usa module PROJECTS para canView. A continuación se indica qué módulos ve cada rol y cómo agruparlos.

**Módulos globales (sidebar org):** Dashboard, Proyectos, Reportes, Equipo, Finanzas, Inventario, Proveedores, Documentos, Configuración.

**Módulos dentro de proyecto (sidebar proyecto):** Dashboard del proyecto, Presupuesto, Cronograma, Finanzas (Transacciones, Flujo de caja), Certificaciones, Reportes, Equipo del proyecto, Calidad (RFIs, Submittals), Reportes diarios, Documentos. (Órdenes de cambio existen como rutas pero no como ítem explícito en project-sidebar; se accede por ruta/breadcrumb.)

**Permisos por rol (resumen):** OWNER y ADMIN ven todo y pueden editar/eliminar/aprobar según módulo; EDITOR ve todo y puede crear/editar (no eliminar en algunos módulos ni aprobar); ACCOUNTANT ve dashboard, proyectos (solo ver), presupuesto (ver/exportar), finanzas y certificaciones (crear/editar/aprobar/exportar), inventario/calidad/documentos/reportes/equipo (solo ver), sin configuración; VIEWER solo lectura en todo excepto configuración (no ve settings).

---

### 3.1 Construction company admin (OWNER / ADMIN)

**Sidebar global (org):**

- Dashboard → `/dashboard`
- Proyectos → `/projects`
- Reportes → `/reports`
- Equipo → `/team`
- Finanzas → `/finance`
- Inventario → `/inventory`
- Proveedores → `/suppliers`
- Documentos → `/documents`
- Configuración → `/settings`

**Sidebar proyecto (al entrar a un proyecto):**

- Dashboard del proyecto → `/projects/[id]/dashboard`
- Presupuesto → `/projects/[id]/budget`
- Cronograma → `/projects/[id]/schedule`
- Finanzas → `/projects/[id]/finance` (con hijos: Transacciones, Flujo de caja)
- Certificaciones → `/projects/[id]/certifications`
- Reportes → `/projects/[id]/reports`
- Equipo del proyecto → `/projects/[id]/team`
- Calidad → `/projects/[id]/quality` (hijos: RFIs, Submittals)
- Reportes diarios → `/projects/[id]/daily-reports`
- Documentos → `/projects/[id]/documents`

**Nota:** Órdenes de cambio: acceso por `/projects/[id]/change-orders` (añadir ítem “Órdenes de cambio” bajo Presupuesto o como ítem propio si se desea).

**Qué ve:** Todos los módulos listados. Puede crear, editar, eliminar y aprobar según matriz de permisos (OWNER/ADMIN en permissions.ts).

---

### 3.2 Project manager (EDITOR con acceso a proyectos y presupuesto)

**Sidebar global (org):**

- Dashboard → `/dashboard`
- Proyectos → `/projects`
- Reportes → `/reports`
- Equipo → `/team` (solo ver)
- Finanzas → `/finance`
- Inventario → `/inventory`
- Proveedores → `/suppliers`
- Documentos → `/documents`
- Configuración → `/settings` (solo ver)

**Sidebar proyecto:**

- Mismo árbol que admin (Dashboard proyecto, Presupuesto, Cronograma, Finanzas, Certificaciones, Reportes, Equipo proyecto, Calidad, Reportes diarios, Documentos).
- No puede eliminar proyectos ni aprobar presupuestos/certificaciones (según EDITOR en permissions.ts); sí crear/editar.

**Qué ve:** Todo lo anterior. Crear/editar en proyectos, presupuesto, finanzas, certificaciones, inventario, calidad, documentos, reportes; solo lectura en equipo org; sin eliminar en módulos críticos ni aprobar presupuestos/certificaciones.

---

### 3.3 Site supervisor (EDITOR con foco en obra)

**Sidebar global (org):**

- Dashboard → `/dashboard`
- Proyectos → `/projects`
- Reportes → `/reports`
- Equipo → `/team` (solo ver)
- Finanzas → `/finance`
- Inventario → `/inventory`
- Proveedores → `/suppliers`
- Documentos → `/documents`
- Configuración → `/settings` (solo ver)

**Sidebar proyecto:**

- Dashboard del proyecto
- Presupuesto (ver/editar líneas si tiene permiso)
- Cronograma
- Finanzas (ver/editar transacciones si aplica)
- Certificaciones (ver/editar)
- Reportes
- Equipo del proyecto
- Calidad (RFIs, Submittals) — uso típico: crear/cerrar RFIs, revisar submittals
- **Reportes diarios** — uso principal: crear y editar reportes diarios, fotos, consumos, proveedores
- Documentos

**Qué ve:** Igual que PM (EDITOR); uso típico: mucho tiempo en Reportes diarios, Calidad (RFIs), Inventario (movimientos a obra), Documentos (subir fotos/planos).

---

### 3.4 Finance (ACCOUNTANT)

**Sidebar global (org):**

- Dashboard → `/dashboard`
- Proyectos → `/projects` (solo ver)
- Reportes → `/reports`
- Equipo → `/team` (solo ver)
- **Finanzas** → `/finance` (crear, editar, aprobar, exportar)
- Inventario → `/inventory` (solo ver)
- Proveedores → `/suppliers` (solo ver)
- Documentos → `/documents` (solo ver)
- Sin Configuración (settings: [] para ACCOUNTANT)

**Sidebar proyecto:**

- Dashboard del proyecto (solo ver)
- Presupuesto (solo ver + exportar)
- Finanzas (Transacciones, Flujo de caja) — crear, editar, aprobar
- **Certificaciones** — ver, aprobar, exportar
- Reportes (ver, exportar)
- Resto: solo lectura (Equipo, Calidad, Reportes diarios, Documentos). No necesita editar WBS ni presupuesto ni reportes diarios.

**Qué ve:** Enfoque en dashboard org, finanzas org y por proyecto, certificaciones (aprobar) y reportes; solo lectura en proyectos, inventario, proveedores, documentos, equipo.

---

## 4) Marketing site blueprint (for Claude to implement)

Rutas del sitio de marketing (alineadas con `bloqer-product-overview.md`): `/`, `/producto`, `/modulos`, `/precios`, `/seguridad`, `/nosotros`, `/contacto`. El sitio **no** implementa auth; todos los CTAs de login y registro deben apuntar a la app usando una variable de entorno:

- **Login:** `{APP_BASE_URL}/es/login`
- **Register:** `{APP_BASE_URL}/es/register`

Ejemplo: si `APP_BASE_URL=https://app.bloqer.com`, entonces Login = `https://app.bloqer.com/es/login` y Register = `https://app.bloqer.com/es/register`.

Idioma: español (LatAm), voseo. Componentes reutilizables sugeridos: Header, Footer, Hero, ValueCards, ModuleSection, CTAButton, FAQ, Testimonials (placeholder), SecurityBullets.

---

### 4.1 Page-by-page outline

| Página | Ruta | Contenido |
|--------|------|-----------|
| **Home** | `/` | Hero (headline + subhead + CTA principal “Empezar con Bloqer” → register + CTA secundario “Iniciar sesión” → login). Sección de valor (ValueCards o bullets). Opcional: testimonios placeholder, logos. Footer con nav + Login. |
| **Producto** | `/producto` | Título “Producto” o “La plataforma”. Párrafo corto: qué es Bloqer, para quién, beneficio principal. CTA “Ver módulos” → `/modulos` y “Empezar con Bloqer” → register. |
| **Módulos** | `/modulos` | Título “Módulos y funcionalidades”. Una ModuleSection por módulo (ver lista en 4.2) con título comercial y blurb de 1–2 líneas. Enlaces internos opcionales (anchors). CTA “Empezar con Bloqer” → register. |
| **Precios** | `/precios` | Título “Precios”. Placeholder: “Próximamente” o nombres de planes + descripción breve. CTA “Contactanos” → `/contacto` o “Empezar con Bloqer” → register. |
| **Seguridad** | `/seguridad` | Título “Seguridad”. SecurityBullets: datos en infraestructura segura, control de acceso por roles y organizaciones, buenas prácticas (según oferta). CTA “Empezar con Bloqer” → register. |
| **Nosotros** | `/nosotros` | Título “Nosotros”. Cuerpo: empresa y misión (a rellenar). CTA “Contacto” → `/contacto` o “Empezar con Bloqer” → register. |
| **Contacto** | `/contacto` | Título “Contacto”. Intro: “¿Consultas? Escribinos o agendá una demo.” Formulario (nombre, email, mensaje) y/o enlace a demo (Calendly, etc.). Sin formulario de login. CTA “Iniciar sesión” → login en header/footer. |

---

### 4.2 Hero copy and section headings

**Hero (Home):**

- Headline: **“Controlá presupuestos, certificaciones e inventario de obra en un solo lugar.”**
- Subhead: **“Bloqer es la plataforma de gestión para constructoras y desarrolladores.”**
- CTA principal (botón): **“Empezar con Bloqer”** → `{APP_BASE_URL}/es/register`
- CTA secundario (link o botón outline): **“Iniciar sesión”** → `{APP_BASE_URL}/es/login`

**Section heading (valor / por qué Bloqer):**

- **“Todo lo que necesitás para llevar la obra”** (o similar). Bullets o ValueCards: Presupuesto versionado y aprobado · Certificaciones de avance con trazabilidad · Inventario por ubicaciones y movimientos · Libro de obra diario con fotos y consumos · Directorio de proveedores · Finanzas y flujo de caja por proyecto

**Producto:**

- Heading: **“La plataforma”** o **“Producto”**
- Body: Todo lo que necesitás para controlar proyectos, presupuestos, certificaciones e inventario de obra en una sola plataforma. Multi-tenant para equipos y organizaciones.

**Módulos:**

- Heading: **“Módulos y funcionalidades”**
- Subheadings y blurbs por módulo (1–2 líneas cada uno):

| Módulo | Blurb |
|--------|--------|
| Presupuesto | Versiones, aprobación y líneas por partida. Controlá costes y ventas desde el baseline. |
| Certificaciones | Avance por período con trazabilidad. Emití y aprobá certificaciones con integridad. |
| Inventario | Ítems, ubicaciones y movimientos (compra, transferencia, entrega). Stock por obra. |
| Proveedores | Directorio global y proveedores locales. Enlazá y definí términos por organización. |
| Libro de obra | Reportes diarios con fotos, mano de obra, equipos y consumos. Vinculado a partidas. |
| Finanzas | Transacciones, pagos y flujo de caja. Gastos generales por proyecto. |
| Reportes y dashboard | KPIs, alertas y reportes predefinidos (presupuesto vs real, certificaciones, por proveedor). |
| Proyectos y WBS | Proyectos, equipos y estructura de partidas (WBS) como base de presupuesto y avance. |
| Órdenes de cambio | Adicionales y variaciones con impacto en costo y plazo. Flujo de aprobación. |
| Calidad (RFIs y submittals) | Consultas técnicas (RFI) y envíos a revisión. Trazabilidad por partida. |
| Cronograma | Cronogramas y tareas por proyecto. Planificación y avance. |
| Documentos | Archivos versionados por organización y proyecto. Vinculación a entidades. |

---

### 4.3 CTAs and URLs (env-driven)

Todas las URLs que apuntan a la app deben construirse con `APP_BASE_URL` (ej. `NEXT_PUBLIC_APP_URL` o `BLOQER_APP_URL`).

| CTA label | URL | Uso |
|-----------|-----|-----|
| Iniciar sesión | `{APP_BASE_URL}/es/login` | Header, footer, botón secundario en hero. |
| Crear cuenta gratis / Empezar con Bloqer / Registrarse | `{APP_BASE_URL}/es/register` | Hero principal, Producto, Módulos, Precios, Seguridad, Nosotros. |
| Ver módulos | `/modulos` | Producto (link interno). |
| Contactanos | `/contacto` | Precios, Nosotros. |
| Contacto | `/contacto` | Nosotros, footer. |

No incluir `/login` ni `/registro` como rutas del sitio de marketing; son solo de la app.

---

### 4.4 Reusable components (suggested)

- **Header:** Logo (link a `/`), nav (Producto, Módulos, Precios, Seguridad, Nosotros, Contacto), botón destacado “Iniciar sesión” → `{APP_BASE_URL}/es/login`, opcional “Crear cuenta” / “Empezar” → `{APP_BASE_URL}/es/register`.
- **Footer:** Misma nav (opcional), “Iniciar sesión” de nuevo → `{APP_BASE_URL}/es/login`, legal (Privacidad, Términos si aplica). Opcional: “¿Ya tenés cuenta? Iniciar sesión”.
- **Hero:** Headline, subhead, CTA principal (configurable href → register), CTA secundario (href → login).
- **ValueCards:** Lista o grid de ítems (icono + título + 1 línea); contenido desde copy de “valor” (presupuesto, certificaciones, inventario, etc.).
- **ModuleSection:** Título del módulo + blurb de 1–2 líneas; opcional imagen o icono. Usar en `/modulos` para cada módulo.
- **CTAButton:** Botón o link con etiqueta y href configurables (ej. “Empezar con Bloqer” → register, “Iniciar sesión” → login).
- **FAQ:** Acordeón o lista de preguntas frecuentes (contenido a definir).
- **Testimonials:** Placeholder (título “Lo que dicen nuestros clientes” + 2–3 slots para cita, nombre, rol; contenido TBD).
- **SecurityBullets:** Lista corta de mensajes de confianza (infraestructura segura, roles y organizaciones, buenas prácticas).
- **ContactForm:** Campos nombre, email, mensaje; submit a API/email o mailto. Opcional: bloque “Agendá una demo” (link externo).

---

### 4.5 SEO basics

| Página | Title | Meta description |
|--------|--------|------------------|
| Home | Bloqer — Gestión de construcción y presupuestos | Plataforma de gestión para constructoras: presupuesto, certificaciones, inventario, reportes diarios y finanzas. Multi-tenant para LatAm. |
| Producto | Producto — Bloqer | Todo lo que necesitás para controlar proyectos, presupuestos, certificaciones e inventario de obra en una sola plataforma. |
| Módulos | Módulos y funcionalidades — Bloqer | Presupuesto, certificaciones, inventario, proveedores, libro de obra, finanzas y reportes en Bloqer. |
| Precios | Precios — Bloqer | Planes para equipos y empresas. Contactanos para conocer opciones. |
| Seguridad | Seguridad — Bloqer | Cómo protegemos tus datos y el acceso a tu organización en Bloqer. |
| Nosotros | Nosotros — Bloqer | Conocé al equipo y la misión de Bloqer. |
| Contacto | Contacto — Bloqer | Contactanos para consultas, demos o soporte. |

**Schema.org hints (sugeridos):**

- Organization: nombre “Bloqer”, url al sitio de marketing, logo.
- WebSite: url, name, description; SearchAction (opcional) si hay búsqueda.
- SoftwareApplication: name “Bloqer”, applicationCategory “BusinessApplication”, description (meta description de producto), offers (si hay precios públicos).

---

## 5) Open questions / gaps

- **Órdenes de cambio en IA:** Las rutas existen (`projects/[id]/change-orders/*`) pero no hay ítem “Órdenes de cambio” en el project-sidebar; el acceso es por URL o breadcrumb. Decidir si se añade como ítem en el sidebar de proyecto (junto a Presupuesto o como ítem propio).
- **Commitments (PO/contratos):** Solo modelo de datos y métrica (commitment ratio) en dashboard; no hay CRUD en UI. Para ventas y materiales de marketing conviene aclarar si se anuncia como “próximamente” o no se menciona hasta tener UI.
- **Inspecciones (Quality):** Modelo en schema; sin rutas ni UI. Mismo criterio: mencionar como “en desarrollo” o omitir en copy hasta implementar.
- **Site log (SiteLogEntry):** Schema legacy; sin UI. Decidir si se depreca y se usa solo reportes diarios como “libro de obra”.
- **Cronograma / Gantt:** Listado de cronogramas y tareas implementado; vista tipo Gantt (barras, dependencias) a confirmar en `schedule-view.tsx`. Si no hay Gantt visual, el copy de “Cronograma” puede decir “planificación por tareas y fechas” sin prometer gráfico Gantt.
- **Proveedores — reclamar/valorar:** GlobalPartyClaim y GlobalPartyReview en schema; no hay UI encontrada. Para marketing: no prometer “reclamar tu ficha” o “valorar proveedores” hasta tener pantallas.
- **Notificaciones:** Hay listener global y página de preferencias; no hay bandeja de notificaciones (inbox) en el nav. Decidir si se añade ítem “Notificaciones” en header o sidebar con dropdown/panel.
- **Permisos por proyecto:** ProjectMember tiene projectRole (MANAGER, SUPERINTENDENT, VIEWER) pero la visibilidad actual del sidebar de proyecto no parece filtrar por rol de proyecto (sí por rol de org). Aclarar si en el futuro se ocultan ítems del sidebar proyecto según projectRole.
- **Marketing site — locale:** El doc de referencia usa rutas sin prefijo `/es/` para el sitio de marketing (/, /producto, etc.). Si el sitio de marketing usa locale, definir si las rutas son `/es/`, `/es/producto`, etc., y que los CTAs a la app sigan siendo `{APP_BASE_URL}/es/login` y `{APP_BASE_URL}/es/register`.
- **Testimonios y casos de éxito:** Placeholder en blueprint; no hay contenido real. Definir si se dejan slots vacíos o se quitan hasta tener casos.
