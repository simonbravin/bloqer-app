"use server";

import { redirectToLogin } from '@/lib/i18n-redirect'
import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import {
  createWBSItemSchema,
  updateWBSItemSchema,
  wbsNodeSchema,
} from '@repo/validators'
import type { CreateWBSItemInput, UpdateWBSItemInput } from '@repo/validators'
import {
  generateWBSCode,
  isAllowedChildType,
  depthOfType,
  MAX_DEPTH,
  type WbsType,
} from '@/lib/wbs-utils'

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

async function getAuthContext() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()
  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()
  return { session, org }
}

function ensureProjectInOrg(projectId: string, orgId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, orgId },
    select: { id: true },
  })
}

/** Get next sequence among siblings (same parentId). */
async function getNextSiblingSequence(projectId: string, parentId: string | null): Promise<number> {
  const siblings = await prisma.wbsNode.findMany({
    where: { projectId, parentId, active: true },
    select: { code: true },
    orderBy: { sortOrder: 'asc' },
  })
  if (siblings.length === 0) return 1
  const lastCode = siblings[siblings.length - 1].code
  const parts = lastCode.split('.')
  const lastSegment = parseInt(parts[parts.length - 1], 10)
  return Number.isNaN(lastSegment) ? 1 : lastSegment + 1
}

/** Prevent circular ref: ensure parentId is not self and not a descendant of self. */
async function ensureNoCircular(
  tx: PrismaTx,
  nodeId: string,
  newParentId: string | null
): Promise<void> {
  if (!newParentId) return
  if (newParentId === nodeId) throw new Error('Parent cannot be the same node.')
  let currentId: string | null = newParentId
  const seen = new Set<string>([nodeId])
  while (currentId) {
    if (seen.has(currentId)) throw new Error('Circular reference in WBS hierarchy.')
    seen.add(currentId)
    const row: { parentId: string | null } | null = await tx.wbsNode.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })
    currentId = row?.parentId ?? null
  }
}

/** Recalculate codes for node and all descendants (by sortOrder). */
async function recalculateCodes(
  tx: PrismaTx,
  nodeId: string,
  newParentCode: string | null
): Promise<void> {
  const node = await tx.wbsNode.findUnique({
    where: { id: nodeId },
    select: { id: true, code: true, sortOrder: true },
  })
  if (!node) return
  const children = await tx.wbsNode.findMany({
    where: { parentId: nodeId, active: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, sortOrder: true },
  })
  let seq = 1
  for (const child of children) {
    const newCode = generateWBSCode(newParentCode, seq)
    await tx.wbsNode.update({
      where: { id: child.id },
      data: { code: newCode },
    })
    await recalculateCodes(tx, child.id, newCode)
    seq++
  }
}

export type WbsNodeWithChildren = {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  description: string | null
  unit: string | null
  quantity: Prisma.Decimal | null
  sortOrder: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  children: WbsNodeWithChildren[]
}

export async function listProjectWBS(projectId: string): Promise<WbsNodeWithChildren[] | null> {
  const { org } = await getAuthContext()
  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return null

  const flat = await prisma.wbsNode.findMany({
    where: { projectId, active: true },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    select: {
      id: true,
      code: true,
      name: true,
      category: true,
      parentId: true,
      description: true,
      unit: true,
      quantity: true,
      sortOrder: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const byParent = new Map<string | null, typeof flat>()
  for (const row of flat) {
    const key = row.parentId ?? null
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(row)
  }

  function toTree(parentKey: string | null): WbsNodeWithChildren[] {
    const list = byParent.get(parentKey) ?? []
    return list.map((n) => ({
      ...n,
      quantity: n.quantity,
      children: toTree(n.id),
    }))
  }

  return toTree(null)
}

export type WbsCostResult = {
  estimatedTotal: number
  actualTotal: number
  variance: number
  varianceStatus: 'under' | 'on_track' | 'over'
}

/** Aggregate estimated (BudgetLine.directCostTotal) and actual (FinanceLine.lineTotal) for a WBS node. */
export async function calculateWBSCosts(wbsId: string): Promise<WbsCostResult | null> {
  const { org } = await getAuthContext()
  const node = await prisma.wbsNode.findFirst({
    where: { id: wbsId, orgId: org.orgId },
    select: { id: true },
  })
  if (!node) return null

  const [budgetAgg, financeAgg] = await Promise.all([
    prisma.budgetLine.aggregate({
      where: { wbsNodeId: wbsId },
      _sum: { directCostTotal: true },
    }),
    prisma.financeLine
      .aggregate({
        where: {
          wbsNodeId: wbsId,
          transaction: { status: { in: ['APPROVED', 'PAID'] }, deleted: false },
        },
        _sum: { lineTotal: true },
      })
      .then((r) => r as { _sum: { lineTotal: unknown } })
      .catch(() => ({ _sum: { lineTotal: null } })),
  ])

  const estimatedTotal = Number(budgetAgg._sum.directCostTotal ?? 0)
  const actualTotal = Number((financeAgg._sum?.lineTotal ?? 0))
  const variance = actualTotal - estimatedTotal
  let varianceStatus: 'under' | 'on_track' | 'over' = 'on_track'
  if (estimatedTotal > 0) {
    if (variance < 0) varianceStatus = 'under'
    else if (variance > 0) varianceStatus = 'over'
  }

  return { estimatedTotal, actualTotal, variance, varianceStatus }
}

/** Costs per WBS node for a project (for list/tree display). */
export async function getProjectWBSCostsMap(
  projectId: string
): Promise<Record<string, WbsCostResult> | null> {
  const { org } = await getAuthContext()
  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return null

  const nodeIds = await prisma.wbsNode.findMany({
    where: { projectId, orgId: org.orgId, active: true },
    select: { id: true },
  })
  const ids = nodeIds.map((n) => n.id)
  if (ids.length === 0) return {}

  const [budgetSums, financeSums] = await Promise.all([
    prisma.budgetLine.groupBy({
      by: ['wbsNodeId'],
      where: { wbsNodeId: { in: ids } },
      _sum: { directCostTotal: true },
    }),
    prisma.financeLine
      .groupBy({
        by: ['wbsNodeId'],
        where: {
          wbsNodeId: { in: ids },
          transaction: { status: { in: ['APPROVED', 'PAID'] }, deleted: false },
        },
        _sum: { lineTotal: true },
      })
      .then((r) => r as { wbsNodeId: string; _sum: { lineTotal: unknown } }[])
      .catch(() => []),
  ])

  const estimatedByNode = new Map<string, number>()
  for (const row of budgetSums) {
    estimatedByNode.set(row.wbsNodeId, Number(row._sum.directCostTotal ?? 0))
  }
  const actualByNode = new Map<string, number>()
  for (const row of financeSums as { wbsNodeId: string; _sum: { lineTotal: unknown } }[]) {
    actualByNode.set(row.wbsNodeId, Number(row._sum?.lineTotal ?? 0))
  }

  const result: Record<string, WbsCostResult> = {}
  for (const id of ids) {
    const estimatedTotal = estimatedByNode.get(id) ?? 0
    const actualTotal = actualByNode.get(id) ?? 0
    const variance = actualTotal - estimatedTotal
    let varianceStatus: 'under' | 'on_track' | 'over' = 'on_track'
    if (estimatedTotal > 0) {
      if (variance < 0) varianceStatus = 'under'
      else if (variance > 0) varianceStatus = 'over'
    }
    result[id] = { estimatedTotal, actualTotal, variance, varianceStatus }
  }

  return result
}

export async function createWBSItem(projectId: string, data: CreateWBSItemInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return { error: { _form: ['Project not found'] } }

  const parsed = createWBSItemSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { parentId, type, name, description, estimatedDuration, unit } = parsed.data

  let parentCode: string | null = null
  let parentType: WbsType | null = null
  if (parentId) {
    const parent = await prisma.wbsNode.findFirst({
      where: { id: parentId, projectId, orgId: org.orgId, active: true },
      select: { code: true, category: true },
    })
    if (!parent) return { error: { parentId: ['Parent must be in the same project.'] } }
    parentCode = parent.code
    parentType = parent.category as WbsType
    if (!isAllowedChildType(parentType, type as WbsType)) {
      return {
        error: {
          type: [
            `Invalid type under ${parentType}: only ${parentType === 'PHASE' ? 'ACTIVITY' : 'TASK'} allowed.`,
          ],
        },
      }
    } // ✅ AGREGADO: Cierre del if
    const parentDepth = depthOfType(parentType)
    if (parentDepth + 1 > MAX_DEPTH) {
      return { error: { type: ['Maximum WBS depth exceeded.'] } }
    }
  } else {
    if (type !== 'PHASE') {
      return { error: { type: ['Root WBS items must be type PHASE.'] } }
    }
  }

  const sequence = await getNextSiblingSequence(projectId, parentId ?? null)
  const code = generateWBSCode(parentCode, sequence)

  await prisma.$transaction(async (tx) => {
    const maxSort = await tx.wbsNode.aggregate({
      where: { projectId, parentId: parentId ?? null, active: true },
      _max: { sortOrder: true },
    })
    await tx.wbsNode.create({
      data: {
        orgId: org.orgId,
        projectId,
        parentId: parentId ?? undefined,
        code,
        name,
        category: type,
        description: description ?? undefined,
        unit: unit ?? undefined,
        quantity: estimatedDuration != null ? new Prisma.Decimal(estimatedDuration) : undefined,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        active: true,
      },
    })
  })

  revalidatePath(`/projects/${projectId}/wbs`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function updateWBSItem(
  id: string,
  projectId: string,
  data: UpdateWBSItemInput
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return { error: { _form: ['Project not found'] } }

  const existing = await prisma.wbsNode.findFirst({
    where: { id, projectId, orgId: org.orgId, active: true },
    include: { parent: true },
  })
  if (!existing) return { error: { _form: ['WBS item not found'] } }

  const parsed = updateWBSItemSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload = parsed.data
  const newParentId = payload.parentId !== undefined ? payload.parentId : existing.parentId
  const newType = (payload.type ?? existing.category) as WbsType

  if (newParentId) {
    const parent = await prisma.wbsNode.findFirst({
      where: { id: newParentId, projectId, orgId: org.orgId, active: true },
      select: { code: true, category: true },
    })
    if (!parent) return { error: { parentId: ['Parent must be in the same project.'] } }
    if (!isAllowedChildType(parent.category as WbsType, newType)) {
      return { error: { type: ['Invalid type for this parent.'] } }
    }
  } else if (newType !== 'PHASE') {
    return { error: { type: ['Root items must be PHASE.'] } }
  }

  await prisma.$transaction(async (tx: PrismaTx) => {
    if (newParentId !== existing.parentId) {
      await ensureNoCircular(tx, id, newParentId)
      const newParentCode = newParentId
        ? (await tx.wbsNode.findUnique({ where: { id: newParentId }, select: { code: true } }))?.code ?? null
        : null
      const newSequence = await getNextSiblingSequence(projectId, newParentId)
      const newCode = generateWBSCode(newParentCode, newSequence)
      await tx.wbsNode.update({
        where: { id },
        data: {
          ...buildUpdateData(payload, existing),
          parentId: newParentId ?? undefined,
          code: newCode,
        },
      })
      await recalculateCodes(tx, id, newCode)
    } else {
      await tx.wbsNode.update({
        where: { id },
        data: buildUpdateData(payload, existing),
      })
    }
  })

  revalidatePath(`/projects/${projectId}/wbs`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Reorder siblings: set sortOrder by index for each node id (same parent). */
export async function reorderWBSItems(
  projectId: string,
  parentId: string | null,
  orderedNodeIds: string[]
): Promise<{ error?: string } | { success: true }> {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) return { error: 'Project not found' }

  const nodes = await prisma.wbsNode.findMany({
    where: {
      id: { in: orderedNodeIds },
      projectId,
      parentId: parentId ?? null,
      orgId: org.orgId,
      active: true,
    },
    select: { id: true },
  })
  if (nodes.length !== orderedNodeIds.length) return { error: 'Invalid nodes or parent' }

  const updates = orderedNodeIds.map((id, index) =>
    prisma.wbsNode.update({
      where: { id },
      data: { sortOrder: index },
    })
  )
  await prisma.$transaction(updates)

  revalidatePath(`/projects/${projectId}/wbs`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

function buildUpdateData(
  payload: UpdateWBSItemInput,
  existing: { category: string; quantity: Prisma.Decimal | null }
): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (payload.name !== undefined) data.name = payload.name
  if (payload.description !== undefined) data.description = payload.description
  if (payload.type !== undefined) data.category = payload.type
  if (payload.unit !== undefined) data.unit = payload.unit
  if (payload.estimatedDuration !== undefined) {
    data.quantity = payload.estimatedDuration != null ? new Prisma.Decimal(payload.estimatedDuration) : null
  }
  return data
}

/** Soft delete node and all descendants. */
export async function deleteWBSItem(id: string, projectId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await ensureProjectInOrg(projectId, org.orgId)
  if (!project) throw new Error('Project not found')

  const node = await prisma.wbsNode.findFirst({
    where: { id, projectId, orgId: org.orgId, active: true },
    select: { id: true },
  })
  if (!node) throw new Error('WBS item not found')

  async function softDeleteRecursive(tx: any, nodeId: string) {
    const children = await tx.wbsNode.findMany({
      where: { parentId: nodeId, active: true },
      select: { id: true },
    })
    for (const c of children) await softDeleteRecursive(tx, c.id)
    await tx.wbsNode.update({
      where: { id: nodeId },
      data: { active: false },
    })
  }

  await prisma.$transaction(async (tx) => {
    await softDeleteRecursive(tx, id)
  })

  revalidatePath(`/projects/${projectId}/wbs`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

/** Create WBS node (prompt 24 - accepts code from user) */
export async function createWbsNode(data: {
  projectId: string
  parentId: string | null
  code: string
  name: string
  category: string
  unit: string
  quantity: number
  description?: string
}) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
  const org = await getOrgContext(session.user.id)
  if (!org) return { success: false, error: 'Unauthorized' }
  requireRole(org.role, 'EDITOR')

  try {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, orgId: org.orgId },
    })
    if (!project) return { success: false, error: 'Proyecto no encontrado' }

    const existing = await prisma.wbsNode.findFirst({
      where: {
        projectId: data.projectId,
        code: data.code,
        active: true,
      },
    })
    if (existing) return { success: false, error: 'Ya existe un nodo con ese código' }

    await prisma.wbsNode.create({
      data: {
        orgId: org.orgId,
        projectId: data.projectId,
        parentId: data.parentId,
        code: data.code,
        name: data.name,
        category: data.category,
        unit: data.unit,
        quantity: new Prisma.Decimal(data.quantity),
        description: data.description || null,
        active: true,
      },
    })
    revalidatePath(`/projects/${data.projectId}/wbs`)
    return { success: true }
  } catch (error) {
    console.error('Error creating WBS node:', error)
    return { success: false, error: 'Error al crear el nodo' }
  }
}

/** Update WBS node */
export async function updateWbsNode(
  nodeId: string,
  data: {
    code: string
    name: string
    category: string
    unit: string
    quantity: number
    description?: string
  }
) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
  const org = await getOrgContext(session.user.id)
  if (!org) return { success: false, error: 'Unauthorized' }
  requireRole(org.role, 'EDITOR')

  try {
    const node = await prisma.wbsNode.findFirst({
      where: { id: nodeId, orgId: org.orgId },
    })
    if (!node) return { success: false, error: 'Nodo no encontrado' }

    const existing = await prisma.wbsNode.findFirst({
      where: {
        projectId: node.projectId,
        code: data.code,
        active: true,
        NOT: { id: nodeId },
      },
    })
    if (existing) return { success: false, error: 'Ya existe un nodo con ese código' }

    await prisma.wbsNode.update({
      where: { id: nodeId },
      data: {
        code: data.code,
        name: data.name,
        category: data.category,
        unit: data.unit,
        quantity: new Prisma.Decimal(data.quantity),
        description: data.description || null,
      },
    })
    revalidatePath(`/projects/${node.projectId}/wbs`)
    return { success: true }
  } catch (error) {
    console.error('Error updating WBS node:', error)
    return { success: false, error: 'Error al actualizar el nodo' }
  }
}

/** Delete WBS node (no children allowed) */
export async function deleteWbsNode(nodeId: string) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
  const org = await getOrgContext(session.user.id)
  if (!org) return { success: false, error: 'Unauthorized' }
  requireRole(org.role, 'EDITOR')

  try {
    const node = await prisma.wbsNode.findFirst({
      where: { id: nodeId, orgId: org.orgId },
      include: { children: { where: { active: true } } },
    })
    if (!node) return { success: false, error: 'Nodo no encontrado' }
    if (node.children.length > 0) {
      return {
        success: false,
        error:
          'No se puede eliminar un nodo que tiene elementos hijos. Elimina primero los hijos.',
      }
    }
    await prisma.wbsNode.update({
      where: { id: nodeId },
      data: { active: false },
    })
    revalidatePath(`/projects/${node.projectId}/wbs`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting WBS node:', error)
    return { success: false, error: 'Error al eliminar el nodo' }
  }
}

/** Reorder WBS node by sortOrder */
export async function reorderWbsNode(nodeId: string, newSortOrder: number) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
  const org = await getOrgContext(session.user.id)
  if (!org) return { success: false, error: 'Unauthorized' }
  requireRole(org.role, 'EDITOR')

  try {
    const node = await prisma.wbsNode.findFirst({
      where: { id: nodeId, orgId: org.orgId },
    })
    if (!node) return { success: false, error: 'Nodo no encontrado' }
    await prisma.wbsNode.update({
      where: { id: nodeId },
      data: { sortOrder: newSortOrder },
    })
    revalidatePath(`/projects/${node.projectId}/wbs`)
    return { success: true }
  } catch (error) {
    console.error('Error reordering WBS node:', error)
    return { success: false, error: 'Error al reordenar el nodo' }
  }
}