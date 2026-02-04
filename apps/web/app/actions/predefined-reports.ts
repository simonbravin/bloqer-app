'use server'

import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'

async function getAuth() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error('No autorizado')
  const org = await getOrgContext(session.user.id)
  if (!org?.orgId) throw new Error('No autorizado')
  return { orgId: org.orgId }
}

// ====================
// GASTOS POR PROVEEDOR (multi-proyecto)
// ====================

export type ExpensesBySupplierRow = {
  supplierId: string
  supplierName: string
  total: number
  count: number
  projectCount: number
}

export async function getExpensesBySupplierReport(
  supplierId?: string
): Promise<ExpensesBySupplierRow[]> {
  const { orgId } = await getAuth()

  const where: {
    orgId: string
    deleted: boolean
    type: { in: string[] }
    partyId?: string
  } = {
    orgId,
    deleted: false,
    type: { in: ['EXPENSE', 'PURCHASE'] },
  }
  if (supplierId) where.partyId = supplierId

  const transactions = await prisma.financeTransaction.findMany({
    where,
    include: {
      party: { select: { name: true } },
      project: { select: { id: true, name: true, projectNumber: true } },
    },
    orderBy: { issueDate: 'desc' },
  })

  const bySupplier = new Map<
    string,
    { name: string; total: number; count: number; projects: Set<string> }
  >()

  for (const tx of transactions) {
    const id = tx.partyId ?? 'unknown'
    const name = tx.party?.name ?? 'Sin proveedor'
    if (!bySupplier.has(id)) {
      bySupplier.set(id, { name, total: 0, count: 0, projects: new Set() })
    }
    const row = bySupplier.get(id)!
    row.total += Number(tx.amountBaseCurrency)
    row.count++
    if (tx.project) row.projects.add(tx.project.id)
  }

  return Array.from(bySupplier.entries())
    .map(([supplierId, data]) => ({
      supplierId,
      supplierName: data.name,
      total: data.total,
      count: data.count,
      projectCount: data.projects.size,
    }))
    .sort((a, b) => b.total - a.total)
}

// ====================
// PRESUPUESTO VS REAL (consolidado por proyecto)
// ====================

export type BudgetVsActualRow = {
  projectId: string
  projectNumber: string
  projectName: string
  budgeted: number
  actual: number
  variance: number
  variancePct: number
}

export async function getBudgetVsActualReport(): Promise<BudgetVsActualRow[]> {
  const { orgId } = await getAuth()

  const projects = await prisma.project.findMany({
    where: { orgId, active: true },
    include: {
      budgetVersions: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, budgetLines: { select: { salePriceTotal: true } } },
      },
    },
  })

  const result: BudgetVsActualRow[] = []

  for (const project of projects) {
    const version = project.budgetVersions[0]
    const budgetTotal = version?.budgetLines.reduce(
      (s, bl) => s + Number(bl.salePriceTotal),
      0
    ) ?? 0

    const agg = await prisma.financeTransaction.aggregate({
      where: {
        projectId: project.id,
        orgId,
        deleted: false,
        type: { in: ['EXPENSE', 'PURCHASE'] },
        status: 'PAID',
      },
      _sum: { amountBaseCurrency: true },
    })

    const spent = Number(agg._sum.amountBaseCurrency ?? 0)
    const variance = budgetTotal - spent
    const variancePct = budgetTotal === 0 ? 0 : (variance / budgetTotal) * 100

    result.push({
      projectId: project.id,
      projectNumber: project.projectNumber,
      projectName: project.name,
      budgeted: budgetTotal,
      actual: spent,
      variance,
      variancePct,
    })
  }

  return result.filter((p) => p.budgeted > 0).sort((a, b) => b.budgeted - a.budgeted)
}

// ====================
// TOP MATERIALES MÁS CAROS (por costo total en presupuestos)
// ====================

export type TopMaterialsRow = {
  materialName: string
  unit: string
  totalQuantity: number
  avgUnitCost: number
  totalCost: number
  projectCount: number
}

export async function getTopMaterialsReport(
  limit: number = 10
): Promise<TopMaterialsRow[]> {
  const { orgId } = await getAuth()

  const lines = await prisma.budgetLine.findMany({
    where: {
      budgetVersion: {
        orgId,
        status: 'APPROVED',
      },
    },
    select: {
      description: true,
      unit: true,
      quantity: true,
      directCostTotal: true,
      budgetVersionId: true,
      budgetVersion: { select: { projectId: true } },
    },
  })

  const byKey = new Map<
    string,
    {
      materialName: string
      unit: string
      totalQuantity: number
      totalCost: number
      projects: Set<string>
    }
  >()

  for (const bl of lines) {
    const key = `${bl.description}|${bl.unit}`
    if (!byKey.has(key)) {
      byKey.set(key, {
        materialName: bl.description,
        unit: bl.unit,
        totalQuantity: 0,
        totalCost: 0,
        projects: new Set(),
      })
    }
    const row = byKey.get(key)!
    row.totalQuantity += Number(bl.quantity)
    row.totalCost += Number(bl.directCostTotal)
    row.projects.add(bl.budgetVersion.projectId)
  }

  return Array.from(byKey.values())
    .map((row) => ({
      materialName: row.materialName,
      unit: row.unit,
      totalQuantity: row.totalQuantity,
      avgUnitCost:
        row.totalQuantity === 0 ? 0 : row.totalCost / row.totalQuantity,
      totalCost: row.totalCost,
      projectCount: row.projects.size,
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, limit)
}

// ====================
// CERTIFICACIONES POR PROYECTO (evolución / ingresos cobrados)
// ====================

export type CertificationsByProjectRow = {
  projectId: string
  projectNumber: string
  projectName: string
  totalCertified: number
  draft: number
  issued: number
  approved: number
  rejected: number
  count: number
}

export async function getCertificationsByProjectReport(): Promise<
  CertificationsByProjectRow[]
> {
  const { orgId } = await getAuth()

  const projects = await prisma.project.findMany({
    where: { orgId, active: true },
    include: {
      certifications: {
        include: {
          lines: { select: { periodAmount: true } },
        },
      },
    },
  })

  const result: CertificationsByProjectRow[] = []

  for (const project of projects) {
    const certData = { draft: 0, issued: 0, approved: 0, rejected: 0 }

    for (const cert of project.certifications) {
      const amount = cert.lines.reduce(
        (s, line) => s + Number(line.periodAmount),
        0
      )
      switch (cert.status) {
        case 'DRAFT':
          certData.draft += amount
          break
        case 'ISSUED':
          certData.issued += amount
          break
        case 'APPROVED':
          certData.approved += amount
          break
        case 'REJECTED':
          certData.rejected += amount
          break
      }
    }

    const totalCertified =
      certData.draft + certData.issued + certData.approved

    result.push({
      projectId: project.id,
      projectNumber: project.projectNumber,
      projectName: project.name,
      totalCertified,
      ...certData,
      count: project.certifications.length,
    })
  }

  return result
    .filter((p) => p.count > 0)
    .sort((a, b) => b.totalCertified - a.totalCertified)
}
