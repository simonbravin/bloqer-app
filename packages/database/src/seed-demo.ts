/**
 * Seed tenant "Demo" con datos precargados para demos y testing.
 *
 * CREDENCIALES:
 *   Usuario:  Desarrolladora Bloqer  (o email: demo@bloqer.app)
 *   Contraseña: BloqerDemo
 *
 * Ejecutar desde repo root: pnpm --filter @repo/database db:seed-demo
 * Para Neon/producción: DATABASE_URL="..." pnpm --filter @repo/database db:seed-demo
 */
import bcrypt from 'bcryptjs'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from './client'

const DEMO_ORG_SLUG = 'demo'
const DEMO_USER_EMAIL = 'demo@bloqer.app'
const DEMO_USER_USERNAME = 'Desarrolladora Bloqer'
const DEMO_USER_PASSWORD = 'BloqerDemo'

async function ensureCurrencies() {
  await prisma.currency.createMany({
    data: [
      { code: 'ARS', name: 'Peso Argentino', symbol: '$', decimalPlaces: 2, active: true },
      { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', decimalPlaces: 2, active: true },
    ],
    skipDuplicates: true,
  })
}

async function getOrCreateDemoOrg(): Promise<{ orgId: string; orgMemberId: string; userId: string }> {
  let org = await prisma.organization.findFirst({ where: { slug: DEMO_ORG_SLUG }, select: { id: true } })
  if (org) {
    const profile = await prisma.orgProfile.findFirst({ where: { orgId: org.id }, select: { id: true } })
    if (!profile) {
      await prisma.orgProfile.create({
        data: { orgId: org.id, legalName: 'Demo (empresa ficticia)', baseCurrency: 'ARS', defaultTaxPct: 21 },
      })
    }
    const member = await prisma.orgMember.findFirst({
      where: { orgId: org.id, active: true },
      select: { id: true, userId: true },
    })
    if (!member) throw new Error('Demo org exists but has no members')
    return { orgId: org.id, orgMemberId: member.id, userId: member.userId }
  }

  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10)
  let user = await prisma.user.findFirst({
    where: { OR: [{ email: DEMO_USER_EMAIL }, { username: DEMO_USER_USERNAME }] },
    select: { id: true },
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        username: DEMO_USER_USERNAME,
        fullName: 'Desarrolladora Bloqer',
        passwordHash,
        active: true,
      },
      select: { id: true },
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, fullName: 'Desarrolladora Bloqer', active: true },
    })
  }

  const orgCreated = await prisma.organization.create({
    data: {
      name: 'Demo',
      slug: DEMO_ORG_SLUG,
      active: true,
      maxProjects: 10,
      maxUsers: 20,
    },
  })
  await prisma.orgProfile.create({
    data: {
      orgId: orgCreated.id,
      legalName: 'Demo (empresa ficticia)',
      baseCurrency: 'ARS',
      defaultTaxPct: 21,
    },
  })
  const member = await prisma.orgMember.create({
    data: { orgId: orgCreated.id, userId: user.id, role: 'OWNER', active: true },
  })
  return { orgId: orgCreated.id, orgMemberId: member.id, userId: user.id }
}

async function ensureParties(orgId: string) {
  const names = [
    'Constructora Sur S.A.',
    'Materiales del Norte',
    'Herrería y Estructuras López',
    'Electricidad Central',
    'Sanitarios y Gas Pérez',
  ]
  const existing = await prisma.party.findMany({ where: { orgId }, select: { name: true } })
  const existingSet = new Set(existing.map((p) => p.name))
  for (const name of names) {
    if (!existingSet.has(name)) {
      await prisma.party.create({ data: { orgId, partyType: 'SUPPLIER', name, active: true } })
    }
  }
}

async function createDemoProjects(orgId: string, orgMemberId: string) {
  const existingProjects = await prisma.project.count({ where: { orgId } })
  if (existingProjects >= 3) return

  const projectsToCreate = [
    {
      projectNumber: 'DEMO-001',
      name: 'Obra Edificio Norte',
      startDate: new Date('2025-02-01'),
      plannedEndDate: new Date('2026-02-28'),
      actualEndDate: new Date('2026-02-28'),
      status: 'COMPLETE',
      phase: 'COMPLETE' as const,
    },
    {
      projectNumber: 'DEMO-002',
      name: 'Remodelación Centro',
      startDate: new Date('2025-06-01'),
      plannedEndDate: new Date('2026-06-30'),
      actualEndDate: null,
      status: 'ACTIVE',
      phase: 'CONSTRUCTION' as const,
    },
    {
      projectNumber: 'DEMO-003',
      name: 'Instalaciones Sitio Sur',
      startDate: new Date('2025-10-01'),
      plannedEndDate: new Date('2026-09-30'),
      actualEndDate: null,
      status: 'ACTIVE',
      phase: 'CONSTRUCTION' as const,
    },
  ]

  for (const p of projectsToCreate) {
    const exists = await prisma.project.findFirst({
      where: { orgId, projectNumber: p.projectNumber },
      select: { id: true },
    })
    if (exists) continue

    await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          orgId,
          projectNumber: p.projectNumber,
          name: p.name,
          createdByOrgMemberId: orgMemberId,
          startDate: p.startDate,
          plannedEndDate: p.plannedEndDate ?? undefined,
          actualEndDate: p.actualEndDate ?? undefined,
          status: p.status,
          phase: p.phase,
          active: true,
        },
      })
      await tx.projectMember.create({
        data: { projectId: project.id, orgMemberId, projectRole: 'MANAGER', active: true },
      })

      const wbsData = [
        { code: '1', name: 'Cimentación', category: 'PHASE', parentId: null, sortOrder: 1 },
        { code: '1.1', name: 'Excavación', category: 'TASK', parentCode: '1', quantity: 50, unit: 'm3', plannedCost: 15000, progressPct: 100, actualCost: 15000 },
        { code: '1.2', name: 'Hormigón de cimentación', category: 'TASK', parentCode: '1', quantity: 20, unit: 'm3', plannedCost: 80000, progressPct: 100, actualCost: 80000 },
        { code: '2', name: 'Estructura', category: 'PHASE', parentId: null, sortOrder: 2 },
        { code: '2.1', name: 'Columnas y vigas', category: 'TASK', parentCode: '2', quantity: 30, unit: 'm3', plannedCost: 120000, progressPct: p.projectNumber === 'DEMO-001' ? 100 : p.projectNumber === 'DEMO-002' ? 80 : 40, actualCost: p.projectNumber === 'DEMO-001' ? 120000 : p.projectNumber === 'DEMO-002' ? 96000 : 48000 },
        { code: '2.2', name: 'Losa de entrepiso', category: 'TASK', parentCode: '2', quantity: 200, unit: 'm2', plannedCost: 100000, progressPct: p.projectNumber === 'DEMO-001' ? 100 : p.projectNumber === 'DEMO-002' ? 60 : 0, actualCost: p.projectNumber === 'DEMO-001' ? 100000 : p.projectNumber === 'DEMO-002' ? 60000 : 0 },
        { code: '3', name: 'Instalaciones', category: 'PHASE', parentId: null, sortOrder: 3 },
        { code: '3.1', name: 'Instalación eléctrica', category: 'TASK', parentCode: '3', quantity: 1, unit: 'global', plannedCost: 45000, progressPct: p.projectNumber === 'DEMO-001' ? 100 : p.projectNumber === 'DEMO-002' ? 30 : 0, actualCost: p.projectNumber === 'DEMO-001' ? 45000 : p.projectNumber === 'DEMO-002' ? 13500 : 0 },
        { code: '3.2', name: 'Instalación sanitaria', category: 'TASK', parentCode: '3', quantity: 1, unit: 'global', plannedCost: 38000, progressPct: p.projectNumber === 'DEMO-001' ? 100 : 0, actualCost: p.projectNumber === 'DEMO-001' ? 38000 : 0 },
        { code: '4', name: 'Acabados', category: 'PHASE', parentId: null, sortOrder: 4 },
        { code: '4.1', name: 'Revoque y pintura', category: 'TASK', parentCode: '4', quantity: 300, unit: 'm2', plannedCost: 60000, progressPct: p.projectNumber === 'DEMO-001' ? 100 : 0, actualCost: p.projectNumber === 'DEMO-001' ? 60000 : 0 },
      ]
      const codeToId = new Map<string, string>()
      for (const w of wbsData) {
        if (w.category === 'PHASE') {
          const node = await tx.wbsNode.create({
            data: {
              orgId,
              projectId: project.id,
              code: w.code,
              name: w.name,
              category: w.category,
              sortOrder: w.sortOrder!,
            },
          })
          codeToId.set(w.code, node.id)
        }
      }
      for (const w of wbsData) {
        if (w.category === 'TASK') {
          const parentId = w.parentCode ? codeToId.get(w.parentCode) ?? null : null
          const node = await tx.wbsNode.create({
            data: {
              orgId,
              projectId: project.id,
              parentId,
              code: w.code,
              name: w.name,
              category: w.category,
              unit: w.unit!,
              quantity: new Decimal(w.quantity!),
              plannedCost: new Decimal(w.plannedCost!),
              actualCost: new Decimal(w.actualCost ?? 0),
              progressPct: new Decimal(w.progressPct ?? 0),
              sortOrder: 0,
            },
          })
          codeToId.set(w.code, node.id)
        }
      }

      const budgetVersion = await tx.budgetVersion.create({
        data: {
          orgId,
          projectId: project.id,
          versionCode: 'BASELINE',
          versionType: 'BASELINE',
          status: 'APPROVED',
          createdByOrgMemberId: orgMemberId,
          approvedByOrgMemberId: orgMemberId,
          approvedAt: new Date(),
        },
      })
      const allNodes = await tx.wbsNode.findMany({
        where: { projectId: project.id },
        select: { id: true, code: true, name: true, category: true, plannedCost: true, quantity: true, unit: true },
        orderBy: { code: 'asc' },
      })
      let sortOrder = 0
      for (const node of allNodes) {
        const isPhase = node.category === 'PHASE'
        const planned = isPhase ? 0 : Number(node.plannedCost ?? 0)
        const qty = isPhase ? new Decimal(0) : (node.quantity ?? new Decimal(1))
        await tx.budgetLine.create({
          data: {
            orgId,
            budgetVersionId: budgetVersion.id,
            wbsNodeId: node.id,
            description: node.name,
            unit: isPhase ? 'global' : (node.unit ?? 'un'),
            quantity: qty,
            directCostTotal: new Decimal(planned),
            salePriceTotal: new Decimal(planned * 1.21),
            actualCostTotal: new Decimal(0),
            sortOrder: sortOrder++,
          },
        })
      }
    })
  }
}

/** Parchea presupuestos demo ya existentes: añade BudgetLine para nodos PHASE que falten (para que el árbol en UI muestre fases y tareas). */
async function patchDemoBudgetPhaseLines(orgId: string) {
  const projects = await prisma.project.findMany({
    where: { orgId },
    select: { id: true },
  })
  for (const project of projects) {
    const versions = await prisma.budgetVersion.findMany({
      where: { projectId: project.id },
      select: { id: true },
    })
    for (const v of versions) {
      const existingLineWbsIds = await prisma.budgetLine.findMany({
        where: { budgetVersionId: v.id },
        select: { wbsNodeId: true },
      })
      const existingSet = new Set(existingLineWbsIds.map((l) => l.wbsNodeId))
      const phaseNodes = await prisma.wbsNode.findMany({
        where: { projectId: project.id, category: 'PHASE' },
        select: { id: true, code: true, name: true },
        orderBy: { code: 'asc' },
      })
      let sortOrder = await prisma.budgetLine.count({ where: { budgetVersionId: v.id } })
      for (const node of phaseNodes) {
        if (existingSet.has(node.id)) continue
        await prisma.budgetLine.create({
          data: {
            orgId,
            budgetVersionId: v.id,
            wbsNodeId: node.id,
            description: node.name,
            unit: 'global',
            quantity: new Decimal(0),
            directCostTotal: new Decimal(0),
            salePriceTotal: new Decimal(0),
            actualCostTotal: new Decimal(0),
            sortOrder: sortOrder++,
          },
        })
      }
    }
  }
}

async function createCertificationsAndIncome(orgId: string, orgMemberId: string) {
  const projects = await prisma.project.findMany({
    where: { orgId },
    select: { id: true, projectNumber: true },
    take: 3,
  })
  for (const project of projects) {
    const certCount = await prisma.certification.count({ where: { projectId: project.id } })
    if (certCount > 0) continue
    const budget = await prisma.budgetVersion.findFirst({
      where: { projectId: project.id, status: 'APPROVED' },
      select: { id: true },
    })
    if (!budget) continue
    const firstLine = await prisma.budgetLine.findFirst({
      where: { budgetVersionId: budget.id },
      select: { id: true, wbsNodeId: true, directCostTotal: true, salePriceTotal: true, wbsNode: { select: { quantity: true } } },
    })
    if (!firstLine) continue
    const cert = await prisma.certification.create({
      data: {
        orgId,
        projectId: project.id,
        budgetVersionId: budget.id,
        number: 1,
        periodMonth: 2,
        periodYear: 2026,
        status: 'APPROVED',
        issuedByOrgMemberId: orgMemberId,
        approvedByOrgMemberId: orgMemberId,
        issuedAt: new Date(),
        approvedAt: new Date(),
      },
    })
    const qty = Number(firstLine.wbsNode?.quantity ?? 1)
    const periodAmt = Number(firstLine.salePriceTotal ?? 0) * 0.2
    await prisma.certificationLine.create({
      data: {
        orgId,
        certificationId: cert.id,
        wbsNodeId: firstLine.wbsNodeId,
        budgetLineId: firstLine.id,
        prevProgressPct: 0,
        periodProgressPct: 20,
        totalProgressPct: 20,
        contractualQtySnapshot: new Decimal(qty),
        unitPriceSnapshot: firstLine.salePriceTotal ?? new Decimal(0),
        prevQty: 0,
        periodQty: new Decimal(qty * 0.2),
        totalQty: new Decimal(qty * 0.2),
        remainingQty: new Decimal(qty * 0.8),
        prevAmount: 0,
        periodAmount: new Decimal(periodAmt),
        totalAmount: new Decimal(periodAmt),
      },
    })
    if (project.projectNumber === 'DEMO-001') {
      const used = await prisma.financeTransaction.findMany({ where: { orgId }, select: { transactionNumber: true } })
      let n = 1
      while (used.some((t) => t.transactionNumber === `DEMO-CERT-${String(n).padStart(3, '0')}`)) n++
      const txNum = `DEMO-CERT-${String(n).padStart(3, '0')}`
      await prisma.financeTransaction.create({
        data: {
          orgId,
          projectId: project.id,
          certificationId: cert.id,
          type: 'INCOME',
          documentType: 'INVOICE',
          status: 'PAID',
          transactionNumber: txNum,
          issueDate: new Date('2026-02-15'),
          paidDate: new Date('2026-02-20'),
          currency: 'ARS',
          subtotal: periodAmt / 1.21,
          taxTotal: periodAmt - periodAmt / 1.21,
          total: periodAmt,
          amountBaseCurrency: periodAmt,
          description: 'Factura certificación 1 - Avance 20%',
          createdByOrgMemberId: orgMemberId,
        },
      })
    }
  }
}

async function createOverheadAndProjectTransactions(orgId: string, orgMemberId: string) {
  const projects = await prisma.project.findMany({ where: { orgId }, select: { id: true, projectNumber: true }, take: 3 })
  const parties = await prisma.party.findMany({ where: { orgId }, select: { id: true }, take: 5 })
  if (projects.length < 2 || parties.length < 2) return

  const existingOverhead = await prisma.financeTransaction.count({
    where: { orgId, type: 'OVERHEAD', projectId: null },
  })
  if (existingOverhead >= 2) return

  const txNumbers = new Set<string>()
  const used = await prisma.financeTransaction.findMany({ where: { orgId }, select: { transactionNumber: true } })
  used.forEach((t) => txNumbers.add(t.transactionNumber))

  const nextNum = (prefix: string) => {
    let n = 1
    while (txNumbers.has(`${prefix}-${String(n).padStart(3, '0')}`)) n++
    const num = `${prefix}-${String(n).padStart(3, '0')}`
    txNumbers.add(num)
    return num
  }

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15)

  if (existingOverhead === 0) {
    const ov1 = await prisma.financeTransaction.create({
      data: {
        orgId,
        type: 'OVERHEAD',
        documentType: 'INVOICE',
        status: 'PAID',
        transactionNumber: nextNum('DEMO-OV'),
        issueDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: lastMonth,
        currency: 'ARS',
        subtotal: 150000,
        taxTotal: 31500,
        total: 181500,
        amountBaseCurrency: 181500,
        description: 'Alquiler oficina mensual',
        createdByOrgMemberId: orgMemberId,
      },
    })
    const ov2 = await prisma.financeTransaction.create({
      data: {
        orgId,
        type: 'OVERHEAD',
        documentType: 'INVOICE',
        status: 'PAID',
        transactionNumber: nextNum('DEMO-OV'),
        issueDate: lastMonth,
        dueDate: new Date(lastMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: lastMonth,
        currency: 'ARS',
        subtotal: 80000,
        taxTotal: 16800,
        total: 96800,
        amountBaseCurrency: 96800,
        description: 'Alquiler depósito',
        createdByOrgMemberId: orgMemberId,
      },
    })
    await prisma.overheadAllocation.createMany({
      data: [
        { orgId, transactionId: ov2.id, projectId: projects[0]!.id, allocationPct: 50, allocationAmount: 48400, notes: 'Proyecto Norte' },
        { orgId, transactionId: ov2.id, projectId: projects[1]!.id, allocationPct: 50, allocationAmount: 48400, notes: 'Proyecto Centro' },
      ],
    })
  }

  const existingProjectTx = await prisma.financeTransaction.count({
    where: { orgId, projectId: { not: null }, type: { in: ['EXPENSE', 'PURCHASE'] } },
  })
  if (existingProjectTx >= 4) return

  for (let i = 0; i < 4; i++) {
    const proj = projects[i % projects.length]!
    const party = parties[i % parties.length]!
    const amt = 50000 + i * 15000
    const txNum = nextNum('DEMO-TX')
    const exists = await prisma.financeTransaction.findFirst({ where: { orgId, transactionNumber: txNum } })
    if (exists) continue
    await prisma.financeTransaction.create({
      data: {
        orgId,
        projectId: proj.id,
        partyId: party.id,
        type: i % 2 === 0 ? 'PURCHASE' : 'EXPENSE',
        documentType: 'INVOICE',
        status: i < 2 ? 'PAID' : 'APPROVED',
        transactionNumber: txNum,
        issueDate: new Date(now.getTime() - (i + 1) * 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        paidDate: i < 2 ? new Date(now.getTime() - i * 10 * 24 * 60 * 60 * 1000) : null,
        currency: 'ARS',
        subtotal: amt,
        taxTotal: amt * 0.21,
        total: amt * 1.21,
        amountBaseCurrency: amt * 1.21,
        description: `Compra materiales / servicio proyecto ${proj.projectNumber}`,
        createdByOrgMemberId: orgMemberId,
      },
    })
  }
}

async function createInventoryData(orgId: string, orgMemberId: string) {
  const projects = await prisma.project.findMany({ where: { orgId }, select: { id: true }, take: 2 })
  const category = await prisma.inventoryCategory.findFirst({ select: { id: true }, where: { name: 'Otro / Sin clasificar' } })
  if (!category) return

  const subcat = await prisma.inventorySubcategory.findFirst({
    where: { categoryId: category.id },
    select: { id: true },
  })
  if (!subcat) return

  const locs = await prisma.inventoryLocation.findMany({ where: { orgId }, select: { id: true, name: true } })
  let centralId: string | null = null
  let siteId: string | null = null
  if (locs.length === 0 && projects[0]) {
    const central = await prisma.inventoryLocation.create({
      data: { orgId, type: 'CENTRAL_WAREHOUSE', name: 'Bodega central Demo', active: true },
    })
    centralId = central.id
    const site = await prisma.inventoryLocation.create({
      data: { orgId, type: 'PROJECT_SITE', projectId: projects[0].id, name: 'Bodega obra Norte', active: true },
    })
    siteId = site.id
  } else {
    centralId = locs.find((l) => l.name.includes('central'))?.id ?? locs[0]?.id ?? null
    siteId = locs.find((l) => l.name.includes('obra'))?.id ?? locs[1]?.id ?? null
  }
  if (!centralId) return

  const items = await prisma.inventoryItem.findMany({ where: { orgId }, select: { id: true, sku: true } })
  const skus = ['DEMO-CEM-01', 'DEMO-ARA-01', 'DEMO-LAD-01', 'DEMO-CAB-01', 'DEMO-TUB-01']
  for (const sku of skus) {
    if (items.some((i) => i.sku === sku)) continue
    await prisma.inventoryItem.create({
      data: {
        orgId,
        sku,
        name: `Item demo ${sku}`,
        unit: 'un',
        categoryId: category.id,
        subcategoryId: subcat.id,
        active: true,
      },
    })
  }
  const allItems = await prisma.inventoryItem.findMany({ where: { orgId, sku: { in: skus } }, select: { id: true } })
  if (allItems.length === 0 || !siteId) return

  const existingMovements = await prisma.inventoryMovement.count({ where: { orgId } })
  if (existingMovements > 0) return

  const itemId = allItems[0]!.id
  await prisma.inventoryMovement.create({
    data: {
      orgId,
      itemId,
      movementType: 'PURCHASE',
      toLocationId: centralId,
      quantity: 100,
      unitCost: 50,
      totalCost: 5000,
      idempotencyKey: `demo-purchase-${Date.now()}-1`,
      createdByOrgMemberId: orgMemberId,
    },
  })
  await prisma.inventoryMovement.create({
    data: {
      orgId,
      itemId,
      movementType: 'TRANSFER',
      fromLocationId: centralId,
      toLocationId: siteId,
      quantity: 30,
      unitCost: 50,
      totalCost: 1500,
      idempotencyKey: `demo-transfer-${Date.now()}-1`,
      createdByOrgMemberId: orgMemberId,
    },
  })
}

async function createDailyReportsAndRFIs(orgId: string, orgMemberId: string) {
  const projects = await prisma.project.findMany({ where: { orgId }, select: { id: true }, take: 3 })
  if (projects.length === 0) return

  const existingReports = await prisma.dailyReport.count({ where: { orgId } })
  if (existingReports >= 3) return

  const today = new Date()
  for (let i = 0; i < 3; i++) {
    const reportDate = new Date(today)
    reportDate.setDate(reportDate.getDate() - i)
    await prisma.dailyReport.create({
      data: {
        orgId,
        projectId: projects[i % projects.length]!.id,
        reportDate,
        summary: `Avance demo día ${i + 1}`,
        workAccomplished: 'Tareas de ejemplo para demo.',
        weather: 'SUNNY',
        status: i === 0 ? 'DRAFT' : 'APPROVED',
        createdByOrgMemberId: orgMemberId,
        ...(i > 0 ? { approvedByOrgMemberId: orgMemberId, approvedAt: new Date() } : {}),
      },
    })
  }

  const existingRfis = await prisma.rFI.count({ where: { orgId } })
  if (existingRfis >= 2 || projects.length === 0) return
  await prisma.rFI.create({
    data: {
      orgId,
      projectId: projects[0]!.id,
      number: 1,
      status: 'CLOSED',
      priority: 'MEDIUM',
      subject: 'Consulta planos eléctricos',
      question: '¿Se confirma el recorrido de canalización en sector A?',
      answer: 'Sí, según planos revisados.',
      raisedByOrgMemberId: orgMemberId,
      closedDate: new Date(),
    },
  })
  await prisma.rFI.create({
    data: {
      orgId,
      projectId: projects[0]!.id,
      number: 2,
      status: 'OPEN',
      priority: 'LOW',
      subject: 'Detalle sanitario',
      question: 'Solicitud de detalle de bajadas.',
      raisedByOrgMemberId: orgMemberId,
    },
  })
}

async function main() {
  await ensureCurrencies()
  const { orgId, orgMemberId } = await getOrCreateDemoOrg()
  await ensureParties(orgId)
  await createDemoProjects(orgId, orgMemberId)
  await patchDemoBudgetPhaseLines(orgId)
  await createCertificationsAndIncome(orgId, orgMemberId)
  await createOverheadAndProjectTransactions(orgId, orgMemberId)
  await createInventoryData(orgId, orgMemberId)
  await createDailyReportsAndRFIs(orgId, orgMemberId)
  console.log('Demo seed listo.')
  console.log('Usuario:', DEMO_USER_USERNAME)
  console.log('Contraseña:', DEMO_USER_PASSWORD)
  console.log('Email (login alternativo):', DEMO_USER_EMAIL)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
