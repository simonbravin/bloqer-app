'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@repo/database'
import { requireRole, hasMinimumRole } from '@/lib/rbac'
import { getAuthContext } from '@/lib/auth-helpers'
import { type PrismaTransaction } from '@/lib/events/event-publisher'
import {
  createChangeOrderSchema,
  updateChangeOrderSchema,
  createChangeOrderLineSchema,
  updateChangeOrderLineSchema,
} from '@repo/validators'
import type {
  CreateChangeOrderInput,
  UpdateChangeOrderInput,
  CreateChangeOrderLineInput,
  UpdateChangeOrderLineInput,
} from '@repo/validators'

function ensureProjectInOrg(projectId: string, orgId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, orgId },
    select: { id: true, projectNumber: true },
  })
}

function generateCONumber(projectNumber: string, sequence: number): string {
  return `CO-${projectNumber}-${sequence.toString().padStart(3, '0')}`
}

async function getNextCONumber(projectId: string): Promise<number> {
  const co = await prisma.changeOrder.findMany({
    where: { projectId },
    select: { number: true },
    orderBy: { number: 'desc' },
    take: 1,
  })
  return (co[0]?.number ?? 0) + 1
}

function isEditableCO(status: string): boolean {
  return status === 'DRAFT' || status === 'CHANGES_REQUESTED'
}

export type ListChangeOrdersFilters = { status?: string }

export async function listChangeOrders(projectId: string, filters: ListChangeOrdersFilters = {}) {
  const { org } = await getAuthContext()
  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return null

  const where: { projectId: string; orgId: string; status?: string } = {
    projectId,
    orgId: org.orgId,
  }
  if (filters.status) where.status = filters.status

  const orders = await prisma.changeOrder.findMany({
    where,
    orderBy: { number: 'desc' },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      costImpact: true,
      requestDate: true,
      requestedByOrgMemberId: true,
      requestedBy: { select: { user: { select: { fullName: true } } } },
    },
  })
  return orders.map((o) => ({
    ...o,
    costImpact: Number(o.costImpact),
    displayNumber: generateCONumber(
      (project as { projectNumber: string }).projectNumber,
      o.number
    ),
  }))
}

export async function getChangeOrder(coId: string) {
  const { org } = await getAuthContext()
  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    include: {
      project: { select: { id: true, name: true, projectNumber: true } },
      requestedBy: { select: { user: { select: { fullName: true, email: true } } } },
      approvedBy: { select: { user: { select: { fullName: true } } } },
      budgetVersion: { select: { id: true, versionCode: true } },
      lines: {
        orderBy: { sortOrder: 'asc' },
        include: { wbsNode: { select: { id: true, code: true, name: true } } },
      },
      approvals: {
        orderBy: { createdAt: 'desc' },
        include: { orgMember: { select: { user: { select: { fullName: true } } } } },
      },
    },
  })
  if (!co) return null
  return {
    ...co,
    costImpact: Number(co.costImpact),
    displayNumber: generateCONumber(co.project.projectNumber, co.number),
  }
}

export async function createChangeOrder(projectId: string, data: CreateChangeOrderInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return { error: { _form: ['Project not found'] } }

  const parsed = createChangeOrderSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const number = await getNextCONumber(projectId)
  await prisma.changeOrder.create({
    data: {
      orgId: org.orgId,
      projectId,
      number,
      title: parsed.data.title,
      status: 'DRAFT',
      changeType: parsed.data.changeType,
      reason: parsed.data.reason,
      justification: parsed.data.justification ?? undefined,
      costImpact: new Prisma.Decimal(0),
      requestedByOrgMemberId: org.memberId,
    },
  })

  revalidatePath(`/projects/${projectId}/change-orders`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

async function recalcChangeOrderCostImpact(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], coId: string) {
  const agg = await tx.changeOrderLine.aggregate({
    where: { changeOrderId: coId },
    _sum: { deltaCost: true },
  })
  const total = Number(agg._sum.deltaCost ?? 0)
  await tx.changeOrder.update({
    where: { id: coId },
    data: { costImpact: new Prisma.Decimal(total) },
  })
}

export async function createChangeOrderLine(coId: string, data: CreateChangeOrderLineInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    select: { id: true, projectId: true, status: true },
  })
  if (!co) return { error: { _form: ['Change order not found'] } }
  if (!isEditableCO(co.status)) {
    return { error: { _form: ['Cannot add lines to this change order.'] } }
  }

  const parsed = createChangeOrderLineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const wbsNode = await prisma.wbsNode.findFirst({
    where: { id: parsed.data.wbsNodeId, projectId: co.projectId, orgId: org.orgId, active: true },
    select: { id: true },
  })
  if (!wbsNode) return { error: { wbsNodeId: ['WBS item must belong to this project.'] } }

  const maxSort = await prisma.changeOrderLine.aggregate({
    where: { changeOrderId: coId },
    _max: { sortOrder: true },
  })
  const deltaCost = new Prisma.Decimal(parsed.data.deltaCost)
  const newQty = parsed.data.newQty != null ? new Prisma.Decimal(parsed.data.newQty) : null
  const newUnitCost = parsed.data.newUnitCost != null ? new Prisma.Decimal(parsed.data.newUnitCost) : null
  const newTotalCost = parsed.data.deltaCost

  await prisma.$transaction(async (tx) => {
    await tx.changeOrderLine.create({
      data: {
        orgId: org.orgId,
        changeOrderId: coId,
        wbsNodeId: parsed.data.wbsNodeId,
        changeType: parsed.data.changeType,
        justification: parsed.data.justification,
        newQty,
        newUnitCost,
        originalTotalCost: null,
        newTotalCost: new Prisma.Decimal(newTotalCost),
        deltaCost,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    })
    await recalcChangeOrderCostImpact(tx, coId)
  })

  const co2 = await prisma.changeOrder.findFirst({ where: { id: coId }, select: { projectId: true } })
  revalidatePath(`/projects/${co2?.projectId}/change-orders`)
  revalidatePath(`/projects/${co2?.projectId}/change-orders/${coId}`)
  return { success: true }
}

export async function updateChangeOrderLine(lineId: string, data: UpdateChangeOrderLineInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const line = await prisma.changeOrderLine.findFirst({
    where: { id: lineId, orgId: org.orgId },
    include: { changeOrder: { select: { id: true, projectId: true, status: true } } },
  })
  if (!line) return { error: { _form: ['Line not found'] } }
  if (!isEditableCO(line.changeOrder.status)) {
    return { error: { _form: ['Cannot edit this change order.'] } }
  }

  const parsed = updateChangeOrderLineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload: Record<string, unknown> = {}
  if (parsed.data.justification !== undefined) payload.justification = parsed.data.justification
  if (parsed.data.deltaCost !== undefined) payload.deltaCost = new Prisma.Decimal(parsed.data.deltaCost)
  if (parsed.data.newQty !== undefined) payload.newQty = parsed.data.newQty != null ? new Prisma.Decimal(parsed.data.newQty) : null
  if (parsed.data.newUnitCost !== undefined) payload.newUnitCost = parsed.data.newUnitCost != null ? new Prisma.Decimal(parsed.data.newUnitCost) : null
  if (parsed.data.deltaCost !== undefined) payload.newTotalCost = new Prisma.Decimal(parsed.data.deltaCost)

  await prisma.$transaction(async (tx) => {
    await tx.changeOrderLine.update({ where: { id: lineId }, data: payload })
    await recalcChangeOrderCostImpact(tx, line.changeOrder.id)
  })

  revalidatePath(`/projects/${line.changeOrder.projectId}/change-orders`)
  revalidatePath(`/projects/${line.changeOrder.projectId}/change-orders/${line.changeOrder.id}`)
  return { success: true }
}

export async function deleteChangeOrderLine(lineId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const line = await prisma.changeOrderLine.findFirst({
    where: { id: lineId, orgId: org.orgId },
    include: { changeOrder: { select: { id: true, projectId: true, status: true } } },
  })
  if (!line) throw new Error('Line not found')
  if (!isEditableCO(line.changeOrder.status)) throw new Error('Cannot edit this change order.')

  await prisma.$transaction(async (tx) => {
    await tx.changeOrderLine.delete({ where: { id: lineId } })
    await recalcChangeOrderCostImpact(tx, line.changeOrder.id)
  })

  revalidatePath(`/projects/${line.changeOrder.projectId}/change-orders/${line.changeOrder.id}`)
  return { success: true }
}

export async function updateChangeOrder(coId: string, data: UpdateChangeOrderInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    select: { id: true, projectId: true, status: true },
  })
  if (!co) return { error: { _form: ['Change order not found'] } }
  if (!isEditableCO(co.status)) {
    return { error: { _form: ['Cannot edit this change order.'] } }
  }

  const parsed = updateChangeOrderSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) payload.title = parsed.data.title
  if (parsed.data.reason !== undefined) payload.reason = parsed.data.reason
  if (parsed.data.justification !== undefined) payload.justification = parsed.data.justification

  await prisma.changeOrder.update({ where: { id: coId }, data: payload })

  revalidatePath(`/projects/${co.projectId}/change-orders`)
  revalidatePath(`/projects/${co.projectId}/change-orders/${coId}`)
  return { success: true }
}

export async function submitForApproval(coId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    select: { id: true, projectId: true, status: true },
  })
  if (!co) return { error: 'Change order not found' }
  if (co.status !== 'DRAFT' && co.status !== 'CHANGES_REQUESTED') {
    return { error: 'Only draft or changes-requested orders can be submitted.' }
  }

  await prisma.changeOrder.update({
    where: { id: coId },
    data: { status: 'SUBMITTED' },
  })

  revalidatePath(`/projects/${co.projectId}/change-orders`)
  revalidatePath(`/projects/${co.projectId}/change-orders/${coId}`)
  return { success: true }
}


export async function approveChangeOrder(coId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    include: { lines: { include: { wbsNode: true } }, project: true },
  })
  if (!co) return { error: 'Change order not found' }
  if (co.status !== 'SUBMITTED') return { error: 'Only submitted change orders can be approved.' }

  await prisma.$transaction(async (tx: PrismaTransaction) => {
    const latestVersion = await tx.budgetVersion.findFirst({
      where: { projectId: co.projectId },
      orderBy: { createdAt: 'desc' },
      include: { budgetLines: true },
    })

    const versionCode = await (async () => {
      const versions = await tx.budgetVersion.findMany({
        where: { projectId: co.projectId },
        select: { versionCode: true },
        orderBy: { versionCode: 'desc' },
        take: 1,
      })
      const last = versions[0]?.versionCode ?? 'V0'
      const num = parseInt(last.replace(/^V/i, ''), 10)
      return `V${Number.isNaN(num) ? 1 : num + 1}`
    })()

    const newVersion = await tx.budgetVersion.create({
      data: {
        orgId: org.orgId,
        projectId: co.projectId,
        versionCode,
        versionType: 'CHANGE_ORDER',
        status: 'DRAFT',
        notes: `Change order ${co.number}: ${co.title}`,
        createdByOrgMemberId: org.memberId,
      },
    })

    if (latestVersion?.budgetLines?.length) {
      await tx.budgetLine.createMany({
        data: latestVersion.budgetLines.map((l) => ({
          orgId: org.orgId,
          budgetVersionId: newVersion.id,
          wbsNodeId: l.wbsNodeId,
          resourceId: l.resourceId ?? undefined,
          description: l.description,
          unit: l.unit,
          quantity: l.quantity,
          directCostTotal: l.directCostTotal,
          salePriceTotal: l.salePriceTotal,
          indirectCostPct: l.indirectCostPct ?? 0,
          overheadPct: l.overheadPct,
          financialPct: l.financialPct,
          profitPct: l.profitPct,
          taxPct: l.taxPct,
          retentionPct: l.retentionPct,
          sortOrder: l.sortOrder,
        })),
      })
    }

    let sortOrder = 0
    for (const line of co.lines) {
      await tx.budgetLine.create({
        data: {
          orgId: org.orgId,
          budgetVersionId: newVersion.id,
          wbsNodeId: line.wbsNodeId,
          description: line.justification,
          unit: 'ea',
          quantity: new Prisma.Decimal(1),
          directCostTotal: line.deltaCost,
          salePriceTotal: line.deltaCost,
          indirectCostPct: new Prisma.Decimal(0),
          overheadPct: new Prisma.Decimal(0),
          financialPct: new Prisma.Decimal(0),
          profitPct: new Prisma.Decimal(0),
          taxPct: new Prisma.Decimal(0),
          retentionPct: new Prisma.Decimal(0),
          sortOrder: sortOrder++,
        },
      })
    }

    await tx.changeOrder.update({
      where: { id: coId },
      data: {
        status: 'APPROVED',
        budgetVersionId: newVersion.id,
        approvedByOrgMemberId: org.memberId,
        approvedDate: new Date(),
      },
    })

    await tx.changeOrderApproval.create({
      data: {
        changeOrderId: coId,
        orgMemberId: org.memberId,
        decision: 'APPROVED',
      },
    })

    const costImpact = Number(co.costImpact)
    const project = await tx.project.findUnique({
      where: { id: co.projectId },
      select: { totalBudget: true },
    })
    const currentTotal = project?.totalBudget != null ? Number(project.totalBudget) : 0
    await tx.project.update({
      where: { id: co.projectId },
      data: { totalBudget: new Prisma.Decimal(currentTotal + costImpact) },
    })
  })

  revalidatePath(`/projects/${co.projectId}/change-orders`)
  revalidatePath(`/projects/${co.projectId}/change-orders/${coId}`)
  revalidatePath(`/projects/${co.projectId}/budget`)
  return { success: true }
}

export async function rejectChangeOrder(coId: string, reason: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    select: { id: true, projectId: true, status: true },
  })
  if (!co) return { error: 'Change order not found' }
  if (co.status !== 'SUBMITTED') return { error: 'Only submitted change orders can be rejected.' }

  await prisma.$transaction([
    prisma.changeOrder.update({
      where: { id: coId },
      data: { status: 'REJECTED', rejectionReason: reason },
    }),
    prisma.changeOrderApproval.create({
      data: {
        changeOrderId: coId,
        orgMemberId: org.memberId,
        decision: 'REJECTED',
        comment: reason,
      },
    }),
  ])

  revalidatePath(`/projects/${co.projectId}/change-orders`)
  revalidatePath(`/projects/${co.projectId}/change-orders/${coId}`)
  return { success: true }
}

export async function requestChanges(coId: string, feedback: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, orgId: org.orgId },
    select: { id: true, projectId: true, status: true },
  })
  if (!co) return { error: 'Change order not found' }
  if (co.status !== 'SUBMITTED') return { error: 'Only submitted change orders can be sent back.' }

  await prisma.$transaction([
    prisma.changeOrder.update({
      where: { id: coId },
      data: { status: 'CHANGES_REQUESTED', feedbackRequested: feedback },
    }),
    prisma.changeOrderApproval.create({
      data: {
        changeOrderId: coId,
        orgMemberId: org.memberId,
        decision: 'CHANGES_REQUESTED',
        comment: feedback,
      },
    }),
  ])

  revalidatePath(`/projects/${co.projectId}/change-orders`)
  revalidatePath(`/projects/${co.projectId}/change-orders/${coId}`)
  return { success: true }
}
