'use server'

import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole, hasMinimumRole } from '@/lib/rbac'
import {
  createFinanceTransactionSchema,
  updateFinanceTransactionSchema,
  createFinanceLineSchema,
  updateFinanceLineSchema,
  projectTransactionCreateSchema,
  projectTransactionUpdateSchema,
  getTransactionTypePrefix,
  type TransactionType,
} from '@repo/validators'
import type {
  CreateFinanceTransactionInput,
  UpdateFinanceTransactionInput,
  CreateFinanceLineInput,
  UpdateFinanceLineInput,
  ProjectTransactionCreateInput,
  ProjectTransactionUpdateInput,
} from '@repo/validators'
import { toBaseAmount } from '@/lib/currency-utils'

async function getAuthContext() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()
  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()
  return { session, org }
}

function isEditableStatus(status: string): boolean {
  return status === 'DRAFT'
}

async function getNextTransactionNumber(
  orgId: string,
  type: TransactionType,
  year: number
): Promise<string> {
  const prefix = getTransactionTypePrefix(type)
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year + 1, 0, 1)
  const count = await prisma.financeTransaction.count({
    where: {
      orgId,
      type,
      issueDate: { gte: yearStart, lt: yearEnd },
      deleted: false,
    },
  })
  const seq = count + 1
  return `${prefix}-${year}-${seq.toString().padStart(3, '0')}`
}

export type ListFinanceTransactionsFilters = {
  type?: string
  status?: string
  projectId?: string
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
}

export async function listFinanceTransactions(filters: ListFinanceTransactionsFilters = {}) {
  const { org } = await getAuthContext()
  const where: Record<string, unknown> = { orgId: org.orgId, deleted: false }
  if (filters.type) where.type = filters.type
  if (filters.status) where.status = filters.status
  if (filters.projectId) where.projectId = filters.projectId
  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {}
    if (filters.dateFrom) (where.issueDate as Record<string, Date>).gte = new Date(filters.dateFrom)
    if (filters.dateTo) (where.issueDate as Record<string, Date>).lte = new Date(filters.dateTo)
  }

  const list = await prisma.financeTransaction.findMany({
    where,
    orderBy: { issueDate: 'desc' },
    include: {
      project: { select: { id: true, name: true } },
      party: { select: { id: true, name: true } },
      createdBy: { select: { user: { select: { fullName: true } } } },
    },
  })
  return list.map((t) => ({
    ...t,
    total: Number(t.total),
    amountBaseCurrency: Number(t.amountBaseCurrency),
  }))
}

export async function getFinanceTransaction(id: string) {
  const { org } = await getAuthContext()
  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    include: {
      project: { select: { id: true, name: true } },
      party: { select: { id: true, name: true } },
      createdBy: { select: { user: { select: { fullName: true, email: true } } } },
      lines: {
        orderBy: { sortOrder: 'asc' },
        include: { wbsNode: { select: { id: true, code: true, name: true } } },
      },
    },
  })
  if (!tx) return null
  return {
    ...tx,
    total: Number(tx.total),
    amountBaseCurrency: Number(tx.amountBaseCurrency),
    subtotal: Number(tx.subtotal),
    taxTotal: Number(tx.taxTotal),
    lines: tx.lines.map((l) => ({
      ...l,
      lineTotal: Number(l.lineTotal),
      unitPrice: Number(l.unitPrice),
      quantity: Number(l.quantity),
    })),
  }
}

export async function listProjectsForFinance() {
  const { org } = await getAuthContext()
  return prisma.project.findMany({
    where: { orgId: org.orgId, active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export async function listPartiesForFinance() {
  const { org } = await getAuthContext()
  return prisma.party.findMany({
    where: { orgId: org.orgId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
    take: 500,
  })
}

export async function listCurrencies() {
  const { org } = await getAuthContext()
  const currencies = await prisma.currency.findMany({
    where: { active: true },
    select: { code: true, name: true, symbol: true },
    orderBy: { code: 'asc' },
  })
  return currencies
}

export async function listWbsNodesForProject(projectId: string) {
  const { org } = await getAuthContext()
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true },
  })
  if (!project) return []
  const nodes = await prisma.wbsNode.findMany({
    where: { projectId, orgId: org.orgId, active: true },
    select: { id: true, code: true, name: true },
    orderBy: [{ code: 'asc' }],
  })
  return nodes
}

export async function createFinanceTransaction(data: CreateFinanceTransactionInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const parsed = createFinanceTransactionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { projectId, partyId, currencyCode, exchangeRateSnapshot: rateNum, issueDate, ...rest } = parsed.data
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: org.orgId },
      select: { id: true },
    })
    if (!project) return { error: { projectId: ['Project not found'] } }
  }

  const currency = await prisma.currency.findFirst({
    where: { code: currencyCode },
    select: { code: true },
  })
  if (!currency) return { error: { currencyCode: ['Currency not found'] } }

  const year = new Date(issueDate).getFullYear()
  const transactionNumber = await getNextTransactionNumber(org.orgId, parsed.data.type as TransactionType, year)

  const total = new Prisma.Decimal(0)
  const amountBase = new Prisma.Decimal(0)
  await prisma.financeTransaction.create({
    data: {
      orgId: org.orgId,
      type: parsed.data.type,
      status: 'DRAFT',
      transactionNumber,
      issueDate,
      currency: currencyCode,
      subtotal: total,
      taxTotal: new Prisma.Decimal(0),
      total,
      amountBaseCurrency: amountBase,
      exchangeRateSnapshot: { rate: rateNum, baseCurrency: 'USD' } as object,
      description: rest.description,
      reference: rest.reference ?? undefined,
      projectId: projectId ?? undefined,
      partyId: partyId ?? undefined,
      createdByOrgMemberId: org.memberId,
    },
  })

  revalidatePath('/finance/transactions')
  return { success: true }
}

export async function createFinanceTransactionWithLines(
  data: CreateFinanceTransactionInput,
  lines: { description: string; amount: number; wbsNodeId?: string | null; unit?: string | null; quantity?: number }[]
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const parsed = createFinanceTransactionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { projectId, partyId, currencyCode, exchangeRateSnapshot: rateNum, issueDate, ...rest } = parsed.data
  let projectIdCheck: string | null = projectId ?? null
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: org.orgId },
      select: { id: true },
    })
    if (!project) return { error: { projectId: ['Project not found'] } }
  }

  const currency = await prisma.currency.findFirst({
    where: { code: currencyCode },
    select: { code: true },
  })
  if (!currency) return { error: { currencyCode: ['Currency not found'] } }

  const year = new Date(issueDate).getFullYear()
  const transactionNumber = await getNextTransactionNumber(org.orgId, parsed.data.type as TransactionType, year)

  if (projectIdCheck) {
    for (const l of lines) {
      if (l.wbsNodeId) {
        const wbs = await prisma.wbsNode.findFirst({
          where: { id: l.wbsNodeId, projectId: projectIdCheck, orgId: org.orgId, active: true },
          select: { id: true },
        })
        if (!wbs) return { error: { _form: [`WBS item ${l.wbsNodeId} does not belong to the selected project`] } }
      }
    }
  }

  const lineTotals = lines.map((l) => new Prisma.Decimal(l.amount))
  const total = lineTotals.reduce((a, b) => a.add(b), new Prisma.Decimal(0))
  const amountBase = toBaseAmount(total, rateNum ?? 1)

  const tx = await prisma.financeTransaction.create({
    data: {
      orgId: org.orgId,
      type: parsed.data.type,
      status: 'DRAFT',
      transactionNumber,
      issueDate,
      currency: currencyCode,
      subtotal: total,
      taxTotal: new Prisma.Decimal(0),
      total,
      amountBaseCurrency: amountBase,
      exchangeRateSnapshot: { rate: rateNum ?? 1, baseCurrency: 'USD' } as object,
      description: rest.description,
      reference: rest.reference ?? undefined,
      projectId: projectId ?? undefined,
      partyId: partyId ?? undefined,
      createdByOrgMemberId: org.memberId,
      lines: {
        create: lines.map((l, i) => {
          const amt = new Prisma.Decimal(l.amount)
          const qty = l.quantity != null && l.quantity > 0 ? new Prisma.Decimal(l.quantity) : new Prisma.Decimal(1)
          const unitPrice = qty.isZero() ? amt : amt.div(qty)
          let wbsNodeId: string | undefined
          if (l.wbsNodeId && projectIdCheck) {
            wbsNodeId = l.wbsNodeId
          }
          return {
            orgId: org.orgId,
            description: l.description,
            unit: l.unit ?? 'ea',
            quantity: qty,
            unitPrice,
            lineTotal: amt,
            sortOrder: i,
            wbsNodeId,
          }
        }),
      },
    },
    include: { lines: true },
  })

  revalidatePath('/finance/transactions')
  return { success: true, id: tx.id }
}

export async function updateFinanceTransaction(id: string, data: UpdateFinanceTransactionInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const existing = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    include: { lines: true },
  })
  if (!existing) return { error: { _form: ['Transaction not found'] } }
  if (!isEditableStatus(existing.status)) return { error: { _form: ['Transaction cannot be edited'] } }

  const parsed = updateFinanceTransactionSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { projectId, partyId, currencyCode, exchangeRateSnapshot: rateNum, issueDate, ...rest } = parsed.data
  if (projectId !== undefined && projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: org.orgId },
      select: { id: true },
    })
    if (!project) return { error: { projectId: ['Project not found'] } }
  }
  if (currencyCode) {
    const currency = await prisma.currency.findFirst({ where: { code: currencyCode }, select: { code: true } })
    if (!currency) return { error: { currencyCode: ['Currency not found'] } }
  }

  const total = existing.lines.reduce((s, l) => s.add(l.lineTotal), new Prisma.Decimal(0))
  const rate = rateNum ?? (existing.exchangeRateSnapshot as { rate?: number })?.rate ?? 1
  const amountBase = toBaseAmount(total, rate)

  const payload: Record<string, unknown> = {
    description: rest.description ?? existing.description,
    issueDate: issueDate ?? existing.issueDate,
    currency: currencyCode ?? existing.currency,
    total,
    amountBaseCurrency: amountBase,
    exchangeRateSnapshot: { rate, baseCurrency: 'USD' } as object,
    reference: rest.reference !== undefined ? rest.reference : existing.reference,
    projectId: projectId !== undefined ? projectId : existing.projectId,
    partyId: partyId !== undefined ? partyId : existing.partyId,
  }

  await prisma.financeTransaction.update({
    where: { id },
    data: payload,
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

export async function addFinanceLine(transactionId: string, data: CreateFinanceLineInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id: transactionId, orgId: org.orgId, deleted: false },
    include: { lines: true },
  })
  if (!tx) return { error: { _form: ['Transaction not found'] } }
  if (!isEditableStatus(tx.status)) return { error: { _form: ['Transaction cannot be edited'] } }

  const parsed = createFinanceLineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  if (parsed.data.wbsNodeId && tx.projectId) {
    const wbs = await prisma.wbsNode.findFirst({
      where: { id: parsed.data.wbsNodeId, projectId: tx.projectId, orgId: org.orgId, active: true },
      select: { id: true },
    })
    if (!wbs) return { error: { wbsNodeId: ['WBS item must belong to the transaction project'] } }
  }

  const amt = new Prisma.Decimal(parsed.data.amount)
  const qty = parsed.data.quantity != null && parsed.data.quantity > 0 ? new Prisma.Decimal(parsed.data.quantity) : new Prisma.Decimal(1)
  const unitPrice = qty.isZero() ? amt : amt.div(qty)
  const maxSort = tx.lines.length ? Math.max(...tx.lines.map((l) => l.sortOrder)) : -1

  await prisma.$transaction(async (db) => {
    await db.financeLine.create({
      data: {
        orgId: org.orgId,
        transactionId,
        description: parsed.data.description,
        unit: parsed.data.unit ?? 'ea',
        quantity: qty,
        unitPrice,
        lineTotal: amt,
        sortOrder: maxSort + 1,
        wbsNodeId: parsed.data.wbsNodeId ?? undefined,
      },
    })
    const allLines = await db.financeLine.findMany({ where: { transactionId }, select: { lineTotal: true } })
    const newTotal = allLines.reduce((s, l) => s.add(l.lineTotal), new Prisma.Decimal(0))
    const snapshot = (tx.exchangeRateSnapshot as { rate?: number }) ?? { rate: 1 }
    const rate = snapshot.rate ?? 1
    await db.financeTransaction.update({
      where: { id: transactionId },
      data: { total: newTotal, amountBaseCurrency: toBaseAmount(newTotal, rate) },
    })
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${transactionId}`)
  return { success: true }
}

export async function updateFinanceLine(lineId: string, data: UpdateFinanceLineInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const line = await prisma.financeLine.findFirst({
    where: { id: lineId, orgId: org.orgId },
    include: { transaction: true },
  })
  if (!line) return { error: { _form: ['Line not found'] } }
  if (!isEditableStatus(line.transaction.status)) return { error: { _form: ['Transaction cannot be edited'] } }

  const parsed = updateFinanceLineSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload: Record<string, unknown> = {}
  if (parsed.data.description !== undefined) payload.description = parsed.data.description
  if (parsed.data.amount !== undefined) {
    const amt = new Prisma.Decimal(parsed.data.amount)
    const qty = parsed.data.quantity != null && parsed.data.quantity > 0 ? new Prisma.Decimal(parsed.data.quantity) : new Prisma.Decimal(1)
    payload.unitPrice = qty.isZero() ? amt : amt.div(qty)
    payload.lineTotal = amt
    payload.quantity = qty
  }
  if (parsed.data.wbsNodeId !== undefined) payload.wbsNodeId = parsed.data.wbsNodeId ?? null
  if (parsed.data.unit !== undefined) payload.unit = parsed.data.unit ?? 'ea'

  await prisma.$transaction(async (db) => {
    if (Object.keys(payload).length) await db.financeLine.update({ where: { id: lineId }, data: payload })
    const allLines = await db.financeLine.findMany({ where: { transactionId: line.transactionId }, select: { lineTotal: true } })
    const newTotal = allLines.reduce((s, l) => s.add(l.lineTotal), new Prisma.Decimal(0))
    const snapshot = (line.transaction.exchangeRateSnapshot as { rate?: number }) ?? { rate: 1 }
    const rate = snapshot.rate ?? 1
    await db.financeTransaction.update({
      where: { id: line.transactionId },
      data: { total: newTotal, amountBaseCurrency: toBaseAmount(newTotal, rate) },
    })
  })

  revalidatePath(`/finance/transactions/${line.transactionId}`)
  return { success: true }
}

export async function deleteFinanceLine(lineId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const line = await prisma.financeLine.findFirst({
    where: { id: lineId, orgId: org.orgId },
    include: { transaction: true },
  })
  if (!line) throw new Error('Line not found')
  if (!isEditableStatus(line.transaction.status)) throw new Error('Transaction cannot be edited')

  await prisma.$transaction(async (db) => {
    await db.financeLine.delete({ where: { id: lineId } })
    const allLines = await db.financeLine.findMany({ where: { transactionId: line.transactionId }, select: { lineTotal: true } })
    const newTotal = allLines.reduce((s, l) => s.add(l.lineTotal), new Prisma.Decimal(0))
    const snapshot = (line.transaction.exchangeRateSnapshot as { rate?: number }) ?? { rate: 1 }
    const rate = snapshot.rate ?? 1
    await db.financeTransaction.update({
      where: { id: line.transactionId },
      data: { total: newTotal, amountBaseCurrency: toBaseAmount(newTotal, rate) },
    })
  })

  revalidatePath(`/finance/transactions/${line.transactionId}`)
  return { success: true }
}

export async function submitFinanceTransaction(id: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, status: true },
  })
  if (!tx) return { error: 'Transaction not found' }
  if (tx.status !== 'DRAFT') return { error: 'Only draft transactions can be submitted.' }

  await prisma.financeTransaction.update({
    where: { id },
    data: { status: 'SUBMITTED' },
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

export async function approveFinanceTransaction(id: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, status: true },
  })
  if (!tx) return { error: 'Transaction not found' }
  if (tx.status !== 'SUBMITTED') return { error: 'Only submitted transactions can be approved.' }

  await prisma.financeTransaction.update({
    where: { id },
    data: { status: 'APPROVED' },
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

export async function rejectFinanceTransaction(id: string, reason: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, status: true },
  })
  if (!tx) return { error: 'Transaction not found' }
  if (tx.status !== 'SUBMITTED') return { error: 'Only submitted transactions can be rejected.' }

  await prisma.financeTransaction.update({
    where: { id },
    data: { status: 'DRAFT', reference: reason || undefined },
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

export async function markFinanceTransactionPaid(id: string, paymentDate: Date) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, status: true },
  })
  if (!tx) return { error: 'Transaction not found' }
  if (tx.status !== 'APPROVED') return { error: 'Only approved transactions can be marked as paid.' }

  await prisma.financeTransaction.update({
    where: { id },
    data: { status: 'PAID', paidDate: paymentDate },
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

export async function voidFinanceTransaction(id: string, reason: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, status: true },
  })
  if (!tx) return { error: 'Transaction not found' }
  if (tx.status === 'VOIDED') return { error: 'Transaction is already voided.' }

  await prisma.financeTransaction.update({
    where: { id },
    data: { status: 'VOIDED', reference: reason || undefined },
  })

  revalidatePath('/finance/transactions')
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true }
}

// ====================
// PROJECT-SCOPED TRANSACTIONS (projects/[id]/finance/transactions)
// ====================

async function getNextProjectTransactionNumber(orgId: string): Promise<string> {
  const last = await prisma.financeTransaction.findFirst({
    where: { orgId, transactionNumber: { startsWith: 'TXN-' } },
    orderBy: { transactionNumber: 'desc' },
    select: { transactionNumber: true },
  })
  const lastNum = last?.transactionNumber?.match(/\d+$/)?.[0] ?? '0'
  return `TXN-${String(Number(lastNum) + 1).padStart(6, '0')}`
}

export type GetProjectTransactionsFilters = {
  dateFrom?: string // YYYY-MM-DD
  dateTo?: string // YYYY-MM-DD
  partyId?: string
  type?: string
}

function serializeTransaction<T extends { total?: unknown; subtotal?: unknown; taxTotal?: unknown; amountBaseCurrency?: unknown }>(t: T): T {
  return {
    ...t,
    total: t.total != null ? Number(t.total) : undefined,
    subtotal: t.subtotal != null ? Number(t.subtotal) : undefined,
    taxTotal: t.taxTotal != null ? Number(t.taxTotal) : undefined,
    amountBaseCurrency: t.amountBaseCurrency != null ? Number(t.amountBaseCurrency) : undefined,
  } as T
}

export async function getProjectTransactions(projectId: string, filters: GetProjectTransactionsFilters = {}) {
  const { org } = await getAuthContext()
  const where: { projectId: string; orgId: string; deleted: boolean; issueDate?: { gte?: Date; lte?: Date }; partyId?: string; type?: string } = {
    projectId,
    orgId: org.orgId,
    deleted: false,
  }
  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {}
    if (filters.dateFrom) where.issueDate.gte = new Date(filters.dateFrom)
    if (filters.dateTo) where.issueDate.lte = new Date(filters.dateTo)
  }
  if (filters.partyId) where.partyId = filters.partyId
  if (filters.type) where.type = filters.type

  const list = await prisma.financeTransaction.findMany({
    where,
    include: {
      party: { select: { id: true, name: true } },
      createdBy: { select: { user: { select: { fullName: true } } } },
      lines: true,
      payments: { orderBy: { paidOn: 'desc' } },
    },
    orderBy: { issueDate: 'desc' },
  })
  return list.map((t) => serializeTransaction({
    ...t,
    total: t.total,
    subtotal: t.subtotal,
    taxTotal: t.taxTotal,
    amountBaseCurrency: t.amountBaseCurrency,
  }))
}

export async function getProjectTransaction(id: string) {
  const { org } = await getAuthContext()
  const tx = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    include: {
      party: { select: { id: true, name: true } },
      lines: { orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { paidOn: 'desc' } },
      createdBy: { select: { user: { select: { fullName: true } } } },
    },
  })
  if (!tx) return null
  return serializeTransaction({
    ...tx,
    total: tx.total,
    subtotal: tx.subtotal,
    taxTotal: tx.taxTotal,
    amountBaseCurrency: tx.amountBaseCurrency,
  })
}

/** List parties (suppliers or clients) for the project's org, for use in transaction form */
export async function getPartiesForProject(
  projectId: string,
  partyType: 'SUPPLIER' | 'CLIENT'
): Promise<{ id: string; name: string }[]> {
  const { org } = await getAuthContext()
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true },
  })
  if (!project) return []
  const list = await prisma.party.findMany({
    where: { orgId: org.orgId, partyType, active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
  return list
}

/** List all parties (suppliers + clients) for the project's org, for filter dropdown */
export async function getPartiesForProjectFilter(projectId: string): Promise<{ id: string; name: string; partyType: string }[]> {
  const { org } = await getAuthContext()
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true },
  })
  if (!project) return []
  const list = await prisma.party.findMany({
    where: { orgId: org.orgId, active: true, partyType: { in: ['SUPPLIER', 'CLIENT'] } },
    select: { id: true, name: true, partyType: true },
    orderBy: { name: 'asc' },
  })
  return list
}

export async function createProjectTransaction(
  projectId: string,
  data: ProjectTransactionCreateInput
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const parsed = projectTransactionCreateSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true },
  })
  if (!project) return { error: { _form: ['Project not found'] } }

  const currency = await prisma.currency.findFirst({
    where: { code: parsed.data.currency },
    select: { code: true },
  })
  if (!currency) return { error: { currency: ['Currency not found'] } }

  const transactionNumber = await getNextProjectTransactionNumber(org.orgId)
  const currencyCode = parsed.data.currency
  // Base currency ARS: amountBaseCurrency = total en ARS
  let rateToArs = 1
  if (currencyCode !== 'ARS') {
    if (parsed.data.exchangeRate != null && parsed.data.exchangeRate > 0) {
      rateToArs = parsed.data.exchangeRate // 1 unidad de currency = rateToArs ARS
    } else {
      const exchangeRate = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: currencyCode,
          toCurrency: 'ARS',
          effectiveDate: { lte: parsed.data.issueDate },
        },
        orderBy: { effectiveDate: 'desc' },
      })
      rateToArs = exchangeRate ? Number(exchangeRate.rate) : 1
    }
  }
  const totalDec = new Prisma.Decimal(parsed.data.total)
  const amountBaseCurrency = toBaseAmount(totalDec, rateToArs)

  const tx = await prisma.financeTransaction.create({
    data: {
      orgId: org.orgId,
      projectId,
      type: parsed.data.type,
      status: 'DRAFT',
      transactionNumber,
      partyId: parsed.data.partyId ?? undefined,
      description: parsed.data.description,
      issueDate: parsed.data.issueDate,
      dueDate: parsed.data.dueDate ?? undefined,
      currency: currencyCode,
      subtotal: new Prisma.Decimal(parsed.data.subtotal),
      taxTotal: new Prisma.Decimal(parsed.data.taxTotal ?? 0),
      total: totalDec,
      amountBaseCurrency,
      exchangeRateSnapshot: { rate: rateToArs, baseCurrency: 'ARS' } as object,
      reference: parsed.data.reference ?? undefined,
      createdByOrgMemberId: org.memberId,
      lines: {
        create: (parsed.data.lines ?? []).map(
          (
            line: {
              description: string
              unit?: string | null
              quantity: number
              unitPrice: number
              lineTotal: number
              wbsNodeId?: string | null
            },
            idx: number
          ) => ({
            orgId: org.orgId,
            description: line.description,
            unit: line.unit ?? undefined,
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            lineTotal: new Prisma.Decimal(line.lineTotal),
            sortOrder: idx,
            wbsNodeId: line.wbsNodeId ?? undefined,
          })
        ),
      },
    },
    include: { lines: true, party: true },
  })

  revalidatePath(`/projects/${projectId}/finance/transactions`)
  revalidatePath(`/projects/${projectId}/finance`)
  return { success: true, transaction: serializeTransaction(tx) }
}

export async function updateProjectTransaction(id: string, data: ProjectTransactionUpdateInput) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const existing = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, projectId: true, status: true, currency: true, total: true, issueDate: true },
  })
  if (!existing) return { error: { _form: ['Transaction not found'] } }

  const parsed = projectTransactionUpdateSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const payload: Record<string, unknown> = {}
  const canEditFull = isEditableStatus(existing.status)
  if (parsed.data.status !== undefined) payload.status = parsed.data.status
  if (parsed.data.partyId !== undefined) payload.partyId = parsed.data.partyId ?? null
  if (canEditFull) {
    if (parsed.data.description !== undefined) payload.description = parsed.data.description
    if (parsed.data.issueDate !== undefined) payload.issueDate = parsed.data.issueDate
    if (parsed.data.dueDate !== undefined) payload.dueDate = parsed.data.dueDate
    if (parsed.data.paidDate !== undefined) payload.paidDate = parsed.data.paidDate
    if (parsed.data.reference !== undefined) payload.reference = parsed.data.reference
    if (parsed.data.currency !== undefined) payload.currency = parsed.data.currency
    if (parsed.data.subtotal !== undefined) payload.subtotal = new Prisma.Decimal(parsed.data.subtotal)
    if (parsed.data.taxTotal !== undefined) payload.taxTotal = new Prisma.Decimal(parsed.data.taxTotal)
    if (parsed.data.total !== undefined) payload.total = new Prisma.Decimal(parsed.data.total)
    const currencyCode = (parsed.data.currency as string | undefined) ?? existing.currency
    const totalNum = parsed.data.total ?? Number(existing.total)
    const needBaseAmount = parsed.data.currency !== undefined || parsed.data.total !== undefined || parsed.data.exchangeRate !== undefined
    if (needBaseAmount) {
      let rateToArs = 1
      if (currencyCode !== 'ARS') {
        if (parsed.data.exchangeRate != null && parsed.data.exchangeRate > 0) {
          rateToArs = parsed.data.exchangeRate
        } else {
          const exchangeRate = await prisma.exchangeRate.findFirst({
            where: { fromCurrency: currencyCode, toCurrency: 'ARS', effectiveDate: { lte: existing.issueDate } },
            orderBy: { effectiveDate: 'desc' },
          })
          rateToArs = exchangeRate ? Number(exchangeRate.rate) : 1
        }
      }
      const totalDec = new Prisma.Decimal(totalNum)
      payload.amountBaseCurrency = toBaseAmount(totalDec, rateToArs)
      payload.exchangeRateSnapshot = { rate: rateToArs, baseCurrency: 'ARS' }
    }
  }

  const updated = await prisma.financeTransaction.update({
    where: { id },
    data: payload,
    include: { party: true, lines: true },
  })

  if (existing.projectId) {
    revalidatePath(`/projects/${existing.projectId}/finance/transactions`)
    revalidatePath(`/projects/${existing.projectId}/finance`)
  }
  revalidatePath(`/finance/transactions/${id}`)
  return { success: true, transaction: serializeTransaction(updated) }
}

export async function deleteProjectTransaction(id: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')

  const existing = await prisma.financeTransaction.findFirst({
    where: { id, orgId: org.orgId, deleted: false },
    select: { id: true, projectId: true },
  })
  if (!existing) throw new Error('Transacción no encontrada')

  await prisma.financeTransaction.update({
    where: { id },
    data: {
      deleted: true,
      deletedAt: new Date(),
      deletedByOrgMemberId: org.memberId,
    },
  })

  if (existing.projectId) {
    revalidatePath(`/projects/${existing.projectId}/finance/transactions`)
    revalidatePath(`/projects/${existing.projectId}/finance`)
  }
  revalidatePath(`/finance/transactions`)
  return { success: true }
}

// ====================
// CASHFLOW DEL PROYECTO
// ====================

export interface CashflowDataPoint {
  month: string
  income: number
  expense: number
  balance: number
  incomeCount: number
  expenseCount: number
}

export async function getProjectCashflow(
  projectId: string,
  dateRange?: { from: Date; to: Date }
): Promise<CashflowDataPoint[]> {
  const { org } = await getAuthContext()
  const to = dateRange?.to ?? new Date()
  const from = dateRange?.from ?? new Date(to.getFullYear(), to.getMonth() - 6, 1)

  const transactions = await prisma.financeTransaction.findMany({
    where: {
      projectId,
      orgId: org.orgId,
      deleted: false,
      issueDate: { gte: from, lte: to },
    },
    select: {
      issueDate: true,
      type: true,
      amountBaseCurrency: true,
      status: true,
    },
    orderBy: { issueDate: 'asc' },
  })

  const monthlyData = new Map<string, CashflowDataPoint>()
  const current = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  while (current <= end) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    monthlyData.set(monthKey, {
      month: monthKey,
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
    })
    current.setMonth(current.getMonth() + 1)
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.issueDate)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const data = monthlyData.get(monthKey)
    if (!data) return
    const amount = Number(tx.amountBaseCurrency)
    if (tx.type === 'INCOME' || tx.type === 'SALE') {
      data.income += amount
      data.incomeCount++
    } else if (tx.type === 'EXPENSE' || tx.type === 'PURCHASE' || tx.type === 'OVERHEAD') {
      data.expense += amount
      data.expenseCount++
    }
  })

  let runningBalance = 0
  const result = Array.from(monthlyData.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((point) => {
      const netCashflow = point.income - point.expense
      runningBalance += netCashflow
      return { ...point, balance: runningBalance }
    })
  return result
}

// ====================
// KPIs DE CASHFLOW
// ====================

export async function getProjectCashflowKPIs(projectId: string) {
  const { org } = await getAuthContext()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const next30Days = new Date(now)
  next30Days.setDate(next30Days.getDate() + 30)

  const [totalIncome, totalExpense, pendingIncome, pendingExpense, currentMonthIncome, currentMonthExpense, upcomingPayments] =
    await Promise.all([
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['INCOME', 'SALE'] },
          status: 'PAID',
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
          status: 'PAID',
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['INCOME', 'SALE'] },
          status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
          status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['INCOME', 'SALE'] },
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amountBaseCurrency: true },
      }),
      prisma.financeTransaction.findMany({
        where: {
          projectId,
          orgId: org.orgId,
          deleted: false,
          type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
          status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
          dueDate: { gte: now, lte: next30Days },
        },
        select: {
          id: true,
          description: true,
          dueDate: true,
          amountBaseCurrency: true,
          party: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
    ])

  const incomeVal = Number(totalIncome._sum.amountBaseCurrency ?? 0)
  const expenseVal = Number(totalExpense._sum.amountBaseCurrency ?? 0)
  const currInc = Number(currentMonthIncome._sum.amountBaseCurrency ?? 0)
  const currExp = Number(currentMonthExpense._sum.amountBaseCurrency ?? 0)

  return {
    totalIncome: incomeVal,
    totalExpense: expenseVal,
    balance: incomeVal - expenseVal,
    pendingIncome: Number(pendingIncome._sum.amountBaseCurrency ?? 0),
    pendingExpense: Number(pendingExpense._sum.amountBaseCurrency ?? 0),
    currentMonthIncome: currInc,
    currentMonthExpense: currExp,
    currentMonthNet: currInc - currExp,
    upcomingPayments: upcomingPayments.map((p) => ({
      id: p.id,
      description: p.description,
      dueDate: p.dueDate,
      amount: Number(p.amountBaseCurrency),
      supplier: p.party?.name ?? 'N/A',
    })),
  }
}

/**
 * Actual cost per WBS node is calculated by aggregating FinanceLine.lineTotal
 * for transactions with status APPROVED or PAID (no WBSItemBudget table).
 */
export async function getWBSActualCosts(projectId: string): Promise<Record<string, number>> {
  const { org } = await getAuthContext()
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true },
  })
  if (!project) return {}

  const lines = await prisma.financeLine.findMany({
    where: {
      wbsNodeId: { not: null },
      transaction: {
        projectId,
        status: { in: ['APPROVED', 'PAID'] },
        deleted: false,
      },
    },
    select: { wbsNodeId: true, lineTotal: true },
  })

  const costMap: Record<string, number> = {}
  for (const line of lines) {
    if (!line.wbsNodeId) continue
    costMap[line.wbsNodeId] = (costMap[line.wbsNodeId] ?? 0) + Number(line.lineTotal)
  }
  return costMap
}

/**
 * Actual cost for a single WBS node (sum of FinanceLine.lineTotal for APPROVED/PAID transactions).
 */
export async function getWBSActualCost(wbsNodeId: string): Promise<number> {
  const { org } = await getAuthContext()
  const result = await prisma.financeLine.aggregate({
    where: {
      wbsNodeId,
      transaction: {
        status: { in: ['APPROVED', 'PAID'] },
        deleted: false,
        orgId: org.orgId,
      },
    },
    _sum: { lineTotal: true },
  })
  return Number(result._sum.lineTotal ?? 0)
}

// ====================
// FINANZAS GLOBAL DE EMPRESA (módulo top-level, multi-tenant estricto)
// ====================
// 🔒 REGLA CRÍTICA: Todas las queries DEBEN incluir where: { orgId: org.orgId }
//    (o baseWhere con orgId). Verificar projectId/partyId pertenecen a la org antes de filtrar.
// ====================

export type CompanyTransactionsFilters = {
  projectId?: string | null // 'null' o null = solo overhead
  type?: string
  partyId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export async function getCompanyTransactions(filters: CompanyTransactionsFilters = {}) {
  const { org } = await getAuthContext()
  if (filters.projectId && filters.projectId !== 'null') {
    const project = await prisma.project.findFirst({
      where: { id: filters.projectId, orgId: org.orgId },
      select: { id: true },
    })
    if (!project) throw new Error('Proyecto no encontrado')
  }
  if (filters.partyId) {
    const party = await prisma.party.findFirst({
      where: { id: filters.partyId, orgId: org.orgId },
      select: { id: true },
    })
    if (!party) throw new Error('Proveedor/Cliente no encontrado')
  }

  const where: Record<string, unknown> = {
    orgId: org.orgId,
    deleted: false,
  }
  if (filters.projectId !== undefined) {
    if (filters.projectId === 'null' || filters.projectId === null) {
      where.projectId = null
    } else {
      where.projectId = filters.projectId
    }
  }
  if (filters.type) where.type = filters.type
  if (filters.partyId) where.partyId = filters.partyId
  if (filters.status) where.status = filters.status
  if (filters.dateFrom || filters.dateTo) {
    where.issueDate = {}
    if (filters.dateFrom) (where.issueDate as Record<string, Date>).gte = new Date(filters.dateFrom)
    if (filters.dateTo) (where.issueDate as Record<string, Date>).lte = new Date(filters.dateTo)
  }
  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: 'insensitive' } },
      { reference: { contains: filters.search, mode: 'insensitive' } },
      { transactionNumber: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const list = await prisma.financeTransaction.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, projectNumber: true } },
      party: { select: { id: true, name: true, partyType: true } },
      createdBy: { select: { user: { select: { fullName: true } } } },
      overheadAllocations: { include: { project: { select: { name: true } } } },
    },
    orderBy: { issueDate: 'desc' },
    take: 500,
  })
  return list.map((t) => serializeTransaction({
    ...t,
    total: t.total,
    subtotal: t.subtotal,
    taxTotal: t.taxTotal,
    amountBaseCurrency: t.amountBaseCurrency,
  }))
}

export type CompanyFinanceDashboard = {
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
  currentMonthIncome: number
  currentMonthExpense: number
  currentMonthNet: number
  unallocatedOverhead: number
  upcomingPayments: Array<{
    id: string
    description: string
    dueDate: Date | null
    amount: number
    supplier: string
    project: string
  }>
  topProjects: Array<{
    projectId: string | null
    projectName: string
    projectNumber: string
    totalExpense: number
  }>
}

export async function getCompanyFinanceDashboard(): Promise<CompanyFinanceDashboard> {
  const { org } = await getAuthContext()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const next30 = new Date(now)
  next30.setDate(next30.getDate() + 30)
  const last3Months = new Date(now)
  last3Months.setMonth(last3Months.getMonth() - 3)

  const baseWhere = { orgId: org.orgId, deleted: false }

  const [totalIncome, totalExpense, pendingIncome, pendingExpense, currentMonthIncome, currentMonthExpense, upcomingPayments, projectExpenses, projects, overheadTx] = await Promise.all([
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['INCOME', 'SALE'] }, status: 'PAID' },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] }, status: 'PAID' },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['INCOME', 'SALE'] }, status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] }, status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] } },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['INCOME', 'SALE'] }, status: 'PAID', paidDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: { ...baseWhere, type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] }, status: 'PAID', paidDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.findMany({
      where: {
        ...baseWhere,
        type: { in: ['EXPENSE', 'PURCHASE'] },
        status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
        dueDate: { gte: now, lte: next30 },
      },
      select: {
        id: true,
        description: true,
        dueDate: true,
        amountBaseCurrency: true,
        party: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.financeTransaction.groupBy({
      by: ['projectId'],
      where: {
        ...baseWhere,
        projectId: { not: null },
        type: { in: ['EXPENSE', 'PURCHASE'] },
        status: 'PAID',
        paidDate: { gte: last3Months },
      },
      _sum: { amountBaseCurrency: true },
      orderBy: { _sum: { amountBaseCurrency: 'desc' } },
      take: 5,
    }),
    prisma.project.findMany({
      where: { orgId: org.orgId },
      select: { id: true, name: true, projectNumber: true },
    }),
    prisma.financeTransaction.findMany({
      where: { ...baseWhere, projectId: null, type: 'OVERHEAD' },
      select: {
        id: true,
        total: true,
        overheadAllocations: { select: { allocationAmount: true } },
      },
    }),
  ])

  const projectIds = projectExpenses.map((p) => p.projectId).filter((id): id is string => id != null)
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const topProjects = projectExpenses.map((p) => {
    const proj = projectMap.get(p.projectId!)
    return {
      projectId: p.projectId,
      projectName: proj?.name ?? 'Proyecto eliminado',
      projectNumber: proj?.projectNumber ?? '—',
      totalExpense: Number(p._sum.amountBaseCurrency ?? 0),
    }
  })

  let unallocatedOverhead = 0
  for (const tx of overheadTx) {
    const allocated = tx.overheadAllocations.reduce((s, a) => s + Number(a.allocationAmount), 0)
    const total = Number(tx.total)
    if (total - allocated > 0) unallocatedOverhead += total - allocated
  }

  const ti = Number(totalIncome._sum.amountBaseCurrency ?? 0)
  const te = Number(totalExpense._sum.amountBaseCurrency ?? 0)
  const cmi = Number(currentMonthIncome._sum.amountBaseCurrency ?? 0)
  const cme = Number(currentMonthExpense._sum.amountBaseCurrency ?? 0)

  return {
    totalIncome: ti,
    totalExpense: te,
    balance: ti - te,
    pendingIncome: Number(pendingIncome._sum.amountBaseCurrency ?? 0),
    pendingExpense: Number(pendingExpense._sum.amountBaseCurrency ?? 0),
    currentMonthIncome: cmi,
    currentMonthExpense: cme,
    currentMonthNet: cmi - cme,
    unallocatedOverhead,
    upcomingPayments: upcomingPayments.map((p) => ({
      id: p.id,
      description: p.description,
      dueDate: p.dueDate,
      amount: Number(p.amountBaseCurrency),
      supplier: p.party?.name ?? '—',
      project: p.project?.name ?? 'Overhead',
    })),
    topProjects,
  }
}

// ====================
// DASHBOARD EJECUTIVO - DATOS PARA GRÁFICOS
// ====================

export type FinanceExecutiveDashboard = {
  summary: CompanyFinanceDashboard
  monthlyTrend: Array<{ month: string; income: number; expense: number; balance: number }>
  expensesByCategory: Array<{ category: string; total: number; count: number }>
  topSuppliers: Array<{ supplierId: string; supplierName: string; total: number; count: number }>
  topProjectsByExpense: Array<{
    projectId: string
    projectName: string
    projectNumber: string
    total: number
  }>
  upcomingDue: Array<{
    id: string
    description: string
    dueDate: Date | null
    amount: number
    supplier: string
    project: string
  }>
  overheadSummary: OverheadDashboard
}

export async function getFinanceExecutiveDashboard(): Promise<FinanceExecutiveDashboard> {
  const { org } = await getAuthContext()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const startDate = new Date(currentYear, currentMonth - 11, 1)
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  const baseWhere = { orgId: org.orgId, deleted: false }

  // 1. Transacciones últimos 12 meses para tendencia mensual
  const transactionsForTrend = await prisma.financeTransaction.findMany({
    where: {
      ...baseWhere,
      issueDate: { gte: startDate, lte: endDate },
    },
    select: { issueDate: true, type: true, amountBaseCurrency: true },
  })

  const monthMap = new Map<
    string,
    { income: number; expense: number }
  >()
  for (let m = 0; m < 12; m++) {
    const d = new Date(currentYear, currentMonth - 11 + m, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, { income: 0, expense: 0 })
  }
  for (const tx of transactionsForTrend) {
    const key = `${tx.issueDate.getFullYear()}-${String(tx.issueDate.getMonth() + 1).padStart(2, '0')}`
    const row = monthMap.get(key)
    if (!row) continue
    const amount = Number(tx.amountBaseCurrency)
    if (tx.type === 'INCOME' || tx.type === 'SALE') {
      row.income += amount
    } else if (tx.type === 'EXPENSE' || tx.type === 'PURCHASE' || tx.type === 'OVERHEAD') {
      row.expense += amount
    }
  }
  const monthlyTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, row]) => ({
      month,
      income: row.income,
      expense: row.expense,
      balance: row.income - row.expense,
    }))

  // 2. Gastos por categoría (tipo)
  const expensesByType = await prisma.financeTransaction.groupBy({
    by: ['type'],
    where: {
      ...baseWhere,
      type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
      issueDate: { gte: startDate },
    },
    _sum: { amountBaseCurrency: true },
    _count: true,
  })
  const expensesByCategory = expensesByType.map((r) => ({
    category: r.type,
    total: Number(r._sum.amountBaseCurrency ?? 0),
    count: r._count,
  }))

  // 3. Top 5 proveedores por gasto (transacciones con party SUPPLIER)
  const supplierParties = await prisma.party.findMany({
    where: { orgId: org.orgId, partyType: 'SUPPLIER' },
    select: { id: true, name: true },
  })
  const supplierIds = new Set(supplierParties.map((p) => p.id))
  const txBySupplier = await prisma.financeTransaction.groupBy({
    by: ['partyId'],
    where: {
      ...baseWhere,
      type: { in: ['EXPENSE', 'PURCHASE'] },
      partyId: { in: Array.from(supplierIds) },
      issueDate: { gte: startDate },
    },
    _sum: { amountBaseCurrency: true },
    _count: true,
  })
  const supplierMap = new Map(supplierParties.map((p) => [p.id, p.name]))
  const topSuppliers = txBySupplier
    .map((r) => ({
      supplierId: r.partyId!,
      supplierName: supplierMap.get(r.partyId!) ?? '—',
      total: Number(r._sum.amountBaseCurrency ?? 0),
      count: r._count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // 4. Top 5 proyectos por gasto
  const projectExpenses = await prisma.financeTransaction.groupBy({
    by: ['projectId'],
    where: {
      ...baseWhere,
      projectId: { not: null },
      type: { in: ['EXPENSE', 'PURCHASE'] },
      issueDate: { gte: startDate },
    },
    _sum: { amountBaseCurrency: true },
    orderBy: { _sum: { amountBaseCurrency: 'desc' } },
    take: 5,
  })
  const projectIds = projectExpenses.map((p) => p.projectId).filter((id): id is string => id != null)
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds }, orgId: org.orgId },
    select: { id: true, name: true, projectNumber: true },
  })
  const projectNameMap = new Map(projects.map((p) => [p.id, p]))
  const topProjectsByExpense = projectExpenses.map((p) => {
    const proj = projectNameMap.get(p.projectId!)
    return {
      projectId: p.projectId!,
      projectName: proj?.name ?? '—',
      projectNumber: proj?.projectNumber ?? '—',
      total: Number(p._sum.amountBaseCurrency ?? 0),
    }
  })

  // 5. Próximos vencimientos (30 días)
  const next30 = new Date(now)
  next30.setDate(next30.getDate() + 30)
  const upcomingDue = await prisma.financeTransaction.findMany({
    where: {
      ...baseWhere,
      type: { in: ['EXPENSE', 'PURCHASE'] },
      status: { in: ['DRAFT', 'SUBMITTED', 'APPROVED'] },
      dueDate: { gte: now, lte: next30 },
    },
    select: {
      id: true,
      description: true,
      dueDate: true,
      amountBaseCurrency: true,
      party: { select: { name: true } },
      project: { select: { name: true, projectNumber: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
  })

  const [summary, overheadSummary] = await Promise.all([
    getCompanyFinanceDashboard(),
    getOverheadDashboard(),
  ])

  return {
    summary,
    monthlyTrend,
    expensesByCategory,
    topSuppliers,
    topProjectsByExpense,
    upcomingDue: upcomingDue.map((tx) => ({
      id: tx.id,
      description: tx.description,
      dueDate: tx.dueDate,
      amount: Number(tx.amountBaseCurrency),
      supplier: tx.party?.name ?? '—',
      project: tx.project?.name ?? 'Overhead',
    })),
    overheadSummary,
  }
}

export type CompanyCashflowPoint = {
  month: string
  income: number
  expense: number
  balance: number
  overhead: number
}

export async function getCompanyCashflow(dateRange?: { from: Date; to: Date }): Promise<CompanyCashflowPoint[]> {
  const { org } = await getAuthContext()
  const toDate = dateRange?.to ?? new Date()
  const fromDate = dateRange?.from ?? new Date(toDate.getFullYear(), toDate.getMonth() - 6, 1)

  const list = await prisma.financeTransaction.findMany({
    where: {
      orgId: org.orgId,
      deleted: false,
      issueDate: { gte: fromDate, lte: toDate },
    },
    select: { issueDate: true, type: true, amountBaseCurrency: true, projectId: true },
    orderBy: { issueDate: 'asc' },
  })

  const monthly = new Map<string, { income: number; expense: number; overhead: number }>()
  let cur = new Date(fromDate)
  while (cur <= toDate) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
    monthly.set(key, { income: 0, expense: 0, overhead: 0 })
    cur.setMonth(cur.getMonth() + 1)
  }
  for (const tx of list) {
    const key = `${tx.issueDate.getFullYear()}-${String(tx.issueDate.getMonth() + 1).padStart(2, '0')}`
    const row = monthly.get(key)
    if (!row) continue
    const amt = Number(tx.amountBaseCurrency)
    if (tx.type === 'INCOME' || tx.type === 'SALE') {
      row.income += amt
    } else {
      row.expense += amt
      if (!tx.projectId) row.overhead += amt
    }
  }
  const keys = Array.from(monthly.keys()).sort()
  let running = 0
  return keys.map((monthKey) => {
    const row = monthly.get(monthKey)!
    running += row.income - row.expense
    return { month: monthKey, ...row, balance: running }
  })
}

// ====================
// CASHFLOW CONSOLIDADO CON DESGLOSE POR PROYECTO
// ====================

export type CashflowDataPointDetailed = {
  month: string
  income: number
  expense: number
  balance: number
  overhead: number
  projectExpenses: Record<string, number>
}

export type CashflowBreakdownItem = {
  projectId: string | null
  projectName: string
  projectNumber: string
  totalExpense: number
}

export type CompanyCashflowDetailedResult = {
  timeline: CashflowDataPointDetailed[]
  breakdown: CashflowBreakdownItem[]
  summary: {
    totalIncome: number
    totalExpense: number
    totalOverhead: number
    totalProjectExpenses: number
    avgMonthlyIncome: number
    avgMonthlyExpense: number
    periodBalance: number
  }
}

export async function getCompanyCashflowDetailed(
  dateRange?: { from: Date; to: Date }
): Promise<CompanyCashflowDetailedResult> {
  const { org } = await getAuthContext()
  const toDate = dateRange?.to ?? new Date()
  const fromDate = dateRange?.from ?? new Date(toDate.getFullYear(), toDate.getMonth() - 6, 1)

  const list = await prisma.financeTransaction.findMany({
    where: {
      orgId: org.orgId,
      deleted: false,
      issueDate: { gte: fromDate, lte: toDate },
    },
    select: {
      issueDate: true,
      type: true,
      amountBaseCurrency: true,
      projectId: true,
      project: { select: { id: true, name: true, projectNumber: true } },
    },
    orderBy: { issueDate: 'asc' },
  })

  const monthlyData = new Map<
    string,
    { income: number; expense: number; overhead: number; projectExpenses: Record<string, number> }
  >()
  let cur = new Date(fromDate)
  while (cur <= toDate) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
    monthlyData.set(key, {
      income: 0,
      expense: 0,
      overhead: 0,
      projectExpenses: {},
    })
    cur.setMonth(cur.getMonth() + 1)
  }

  const projectTotals = new Map<
    string | null,
    { name: string; number: string; total: number }
  >()

  for (const tx of list) {
    const key = `${tx.issueDate.getFullYear()}-${String(tx.issueDate.getMonth() + 1).padStart(2, '0')}`
    const data = monthlyData.get(key)
    if (!data) continue

    const amount = Number(tx.amountBaseCurrency)

    if (tx.type === 'INCOME' || tx.type === 'SALE') {
      data.income += amount
    } else if (tx.type === 'EXPENSE' || tx.type === 'PURCHASE' || tx.type === 'OVERHEAD') {
      data.expense += amount

      if (!tx.projectId) {
        data.overhead += amount
        const existing = projectTotals.get(null)
        if (existing) {
          existing.total += amount
        } else {
          projectTotals.set(null, { name: 'Overhead', number: '—', total: amount })
        }
      } else {
        if (!data.projectExpenses[tx.projectId]) {
          data.projectExpenses[tx.projectId] = 0
        }
        data.projectExpenses[tx.projectId] += amount

        const existing = projectTotals.get(tx.projectId)
        if (existing) {
          existing.total += amount
        } else {
          projectTotals.set(tx.projectId, {
            name: tx.project?.name ?? 'Proyecto',
            number: tx.project?.projectNumber ?? '—',
            total: amount,
          })
        }
      }
    }
  }

  const keys = Array.from(monthlyData.keys()).sort()
  let runningBalance = 0
  const timeline: CashflowDataPointDetailed[] = keys.map((monthKey) => {
    const row = monthlyData.get(monthKey)!
    const netCashflow = row.income - row.expense
    runningBalance += netCashflow
    return {
      month: monthKey,
      ...row,
      balance: runningBalance,
    }
  })

  const breakdown: CashflowBreakdownItem[] = Array.from(projectTotals.entries())
    .map(([projectId, data]) => ({
      projectId,
      projectName: data.name,
      projectNumber: data.number,
      totalExpense: data.total,
    }))
    .sort((a, b) => b.totalExpense - a.totalExpense)

  const totalIncome = timeline.reduce((sum, p) => sum + p.income, 0)
  const totalExpense = timeline.reduce((sum, p) => sum + p.expense, 0)
  const totalOverhead = timeline.reduce((sum, p) => sum + p.overhead, 0)
  const totalProjectExpenses = totalExpense - totalOverhead
  const monthsCount = timeline.length || 1

  const summary = {
    totalIncome,
    totalExpense,
    totalOverhead,
    totalProjectExpenses,
    avgMonthlyIncome: totalIncome / monthsCount,
    avgMonthlyExpense: totalExpense / monthsCount,
    periodBalance: totalIncome - totalExpense,
  }

  return { timeline, breakdown, summary }
}

// ====================
// COMPARATIVA MES ANTERIOR
// ====================

export type CashflowMonthComparisonResult = {
  current: { income: number; expense: number; balance: number }
  previous: { income: number; expense: number; balance: number }
  changes: { incomeChange: number; expenseChange: number; balanceChange: number }
}

export async function getCashflowMonthComparison(): Promise<CashflowMonthComparisonResult> {
  const { org } = await getAuthContext()
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const baseWhere = { orgId: org.orgId, deleted: false }

  const [currentIncome, currentExpense, prevIncome, prevExpense] = await Promise.all([
    prisma.financeTransaction.aggregate({
      where: {
        ...baseWhere,
        type: { in: ['INCOME', 'SALE'] },
        issueDate: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: {
        ...baseWhere,
        type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
        issueDate: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: {
        ...baseWhere,
        type: { in: ['INCOME', 'SALE'] },
        issueDate: { gte: prevMonthStart, lte: prevMonthEnd },
      },
      _sum: { amountBaseCurrency: true },
    }),
    prisma.financeTransaction.aggregate({
      where: {
        ...baseWhere,
        type: { in: ['EXPENSE', 'PURCHASE', 'OVERHEAD'] },
        issueDate: { gte: prevMonthStart, lte: prevMonthEnd },
      },
      _sum: { amountBaseCurrency: true },
    }),
  ])

  const currIncome = Number(currentIncome._sum.amountBaseCurrency ?? 0)
  const currExpense = Number(currentExpense._sum.amountBaseCurrency ?? 0)
  const pIncome = Number(prevIncome._sum.amountBaseCurrency ?? 0)
  const pExpense = Number(prevExpense._sum.amountBaseCurrency ?? 0)

  const incomeChange = pIncome === 0 ? 0 : ((currIncome - pIncome) / pIncome) * 100
  const expenseChange = pExpense === 0 ? 0 : ((currExpense - pExpense) / pExpense) * 100
  const prevBalance = pIncome - pExpense
  const balanceChange =
    prevBalance === 0 ? 0 : ((currIncome - currExpense - prevBalance) / Math.abs(prevBalance)) * 100

  return {
    current: {
      income: currIncome,
      expense: currExpense,
      balance: currIncome - currExpense,
    },
    previous: {
      income: pIncome,
      expense: pExpense,
      balance: prevBalance,
    },
    changes: {
      incomeChange,
      expenseChange,
      balanceChange,
    },
  }
}

export async function createCompanyTransaction(data: {
  type: 'EXPENSE' | 'INCOME' | 'OVERHEAD'
  partyId?: string
  description: string
  issueDate: Date
  dueDate?: Date
  currency?: string
  subtotal: number
  taxTotal?: number
  total: number
  reference?: string
}) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')
  if (data.partyId) {
    const party = await prisma.party.findFirst({
      where: { id: data.partyId, orgId: org.orgId },
      select: { id: true },
    })
    if (!party) throw new Error('Proveedor/Cliente no encontrado')
  }
  const last = await prisma.financeTransaction.findFirst({
    where: { orgId: org.orgId },
    orderBy: { transactionNumber: 'desc' },
    select: { transactionNumber: true },
  })
  const lastNum = last?.transactionNumber?.match(/\d+$/)?.[0] ?? '0'
  const transactionNumber = `TXN-${String(Number(lastNum) + 1).padStart(6, '0')}`
  const currency = data.currency ?? 'ARS'
  let rateToArs = 1
  if (currency !== 'ARS') {
    const rate = await prisma.exchangeRate.findFirst({
      where: { fromCurrency: currency, toCurrency: 'ARS', effectiveDate: { lte: data.issueDate } },
      orderBy: { effectiveDate: 'desc' },
    })
    rateToArs = rate ? Number(rate.rate) : 1
  }
  const totalDec = new Prisma.Decimal(data.total)
  const amountBaseCurrency = toBaseAmount(totalDec, rateToArs)
  const tx = await prisma.financeTransaction.create({
    data: {
      orgId: org.orgId,
      projectId: null,
      type: data.type,
      status: 'DRAFT',
      transactionNumber,
      partyId: data.partyId ?? undefined,
      description: data.description,
      issueDate: data.issueDate,
      dueDate: data.dueDate ?? undefined,
      currency,
      subtotal: new Prisma.Decimal(data.subtotal),
      taxTotal: new Prisma.Decimal(data.taxTotal ?? 0),
      total: totalDec,
      amountBaseCurrency,
      exchangeRateSnapshot: { rate: rateToArs, baseCurrency: 'ARS' } as object,
      reference: data.reference ?? undefined,
      createdByOrgMemberId: org.memberId,
    },
    include: { party: true },
  })
  revalidatePath('/finance')
  revalidatePath('/finance/transactions')
  return { success: true, transaction: serializeTransaction(tx) }
}

export async function allocateOverhead(
  transactionId: string,
  allocations: Array<{ projectId: string; allocationPct: number }>
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')
  const totalPct = allocations.reduce((s, a) => s + a.allocationPct, 0)
  if (Math.abs(totalPct - 100) > 0.01) throw new Error('La suma de porcentajes debe ser 100%')
  const tx = await prisma.financeTransaction.findFirst({
    where: { id: transactionId, orgId: org.orgId, deleted: false },
    select: { id: true, projectId: true, total: true },
  })
  if (!tx) throw new Error('Transacción no encontrada')
  if (tx.projectId != null) throw new Error('Solo se puede asignar overhead a transacciones sin proyecto')
  const projectIds = allocations.map((a) => a.projectId)
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds }, orgId: org.orgId },
    select: { id: true },
  })
  if (projects.length !== projectIds.length) throw new Error('Uno o más proyectos no encontrados')
  await prisma.overheadAllocation.deleteMany({ where: { transactionId } })
  const totalAmount = Number(tx.total)
  await prisma.overheadAllocation.createMany({
    data: allocations.map((a) => ({
      orgId: org.orgId,
      transactionId,
      projectId: a.projectId,
      allocationPct: new Prisma.Decimal(a.allocationPct),
      allocationAmount: new Prisma.Decimal((totalAmount * a.allocationPct) / 100),
    })),
  })
  revalidatePath('/finance')
  revalidatePath('/finance/overhead')
  return { success: true }
}

// ====================
// LISTAR TRANSACCIONES OVERHEAD (con asignaciones)
// ====================

export type OverheadTransactionWithAllocations = {
  id: string
  transactionNumber: string
  description: string
  issueDate: Date
  total: number
  currency: string
  party: { name: string } | null
  allocations: Array<{
    id: string
    projectId: string
    projectName: string
    projectNumber: string
    allocationPct: number
    allocationAmount: number
  }>
  totalAllocatedPct: number
  totalAllocatedAmount: number
  remainingAmount: number
  status: 'unallocated' | 'partial' | 'complete'
}

export async function getOverheadTransactions(): Promise<OverheadTransactionWithAllocations[]> {
  const { org } = await getAuthContext()
  const transactions = await prisma.financeTransaction.findMany({
    where: {
      orgId: org.orgId,
      projectId: null,
      type: 'OVERHEAD',
      deleted: false,
    },
    include: {
      party: { select: { name: true } },
      overheadAllocations: {
        include: {
          project: { select: { id: true, name: true, projectNumber: true } },
        },
        orderBy: { createdAt: 'desc' as const },
      },
    },
    orderBy: { issueDate: 'desc' },
  })

  return transactions.map((tx) => {
    const totalAllocatedPct = tx.overheadAllocations.reduce(
      (sum, a) => sum + Number(a.allocationPct),
      0
    )
    const totalAllocatedAmount = tx.overheadAllocations.reduce(
      (sum, a) => sum + Number(a.allocationAmount),
      0
    )
    const totalNum = Number(tx.total)
    const remainingAmount = totalNum - totalAllocatedAmount
    let status: 'unallocated' | 'partial' | 'complete' = 'unallocated'
    if (totalAllocatedPct >= 100) status = 'complete'
    else if (totalAllocatedPct > 0) status = 'partial'

    return {
      id: tx.id,
      transactionNumber: tx.transactionNumber,
      description: tx.description,
      issueDate: tx.issueDate,
      total: totalNum,
      currency: tx.currency,
      party: tx.party,
      allocations: tx.overheadAllocations.map((a) => ({
        id: a.id,
        projectId: a.projectId,
        projectName: a.project.name,
        projectNumber: a.project.projectNumber,
        allocationPct: Number(a.allocationPct),
        allocationAmount: Number(a.allocationAmount),
      })),
      totalAllocatedPct,
      totalAllocatedAmount,
      remainingAmount,
      status,
    }
  })
}

// ====================
// DASHBOARD DE OVERHEAD
// ====================

export type OverheadDashboard = {
  totalOverhead: number
  totalAllocated: number
  unallocated: number
  unallocatedTransactions: number
  partiallyAllocated: number
  topProjects: Array<{
    projectId: string
    projectName: string
    projectNumber: string
    totalOverhead: number
  }>
}

export async function getOverheadDashboard(): Promise<OverheadDashboard> {
  const { org } = await getAuthContext()
  const overheadTransactions = await prisma.financeTransaction.findMany({
    where: {
      orgId: org.orgId,
      projectId: null,
      type: 'OVERHEAD',
      deleted: false,
    },
    include: {
      overheadAllocations: { select: { allocationAmount: true } },
    },
  })

  const totalOverhead = overheadTransactions.reduce((sum, tx) => sum + Number(tx.total), 0)
  const totalAllocated = overheadTransactions.reduce(
    (sum, tx) =>
      sum +
      tx.overheadAllocations.reduce((s, a) => s + Number(a.allocationAmount), 0),
    0
  )
  const unallocated = totalOverhead - totalAllocated

  const unallocatedTransactions = overheadTransactions.filter((tx) => {
    const allocated = tx.overheadAllocations.reduce((s, a) => s + Number(a.allocationAmount), 0)
    return allocated === 0
  }).length

  const partiallyAllocated = overheadTransactions.filter((tx) => {
    const allocated = tx.overheadAllocations.reduce((s, a) => s + Number(a.allocationAmount), 0)
    const total = Number(tx.total)
    return allocated > 0 && allocated < total
  }).length

  const projectAllocations = await prisma.overheadAllocation.groupBy({
    by: ['projectId'],
    where: { orgId: org.orgId },
    _sum: { allocationAmount: true },
  })
  const sorted = [...projectAllocations].sort(
    (a, b) => (Number(b._sum.allocationAmount ?? 0) - Number(a._sum.allocationAmount ?? 0))
  )
  const top5 = sorted.slice(0, 5)
  const projectIds = top5.map((p) => p.projectId)
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds }, orgId: org.orgId },
    select: { id: true, name: true, projectNumber: true },
  })
  const topProjects = top5.map((p) => {
    const project = projects.find((pr) => pr.id === p.projectId)
    return {
      projectId: p.projectId,
      projectName: project?.name ?? 'Proyecto eliminado',
      projectNumber: project?.projectNumber ?? '—',
      totalOverhead: Number(p._sum.allocationAmount ?? 0),
    }
  })

  return {
    totalOverhead,
    totalAllocated,
    unallocated,
    unallocatedTransactions,
    partiallyAllocated,
    topProjects,
  }
}

// ====================
// ELIMINAR ASIGNACIÓN
// ====================

export async function deleteOverheadAllocation(allocationId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')
  const allocation = await prisma.overheadAllocation.findUnique({
    where: { id: allocationId },
    select: { orgId: true, transactionId: true },
  })
  if (!allocation || allocation.orgId !== org.orgId) throw new Error('Asignación no encontrada')
  await prisma.overheadAllocation.delete({ where: { id: allocationId } })
  revalidatePath('/finance/overhead')
  return { success: true }
}

// ====================
// ACTUALIZAR ASIGNACIÓN
// ====================

export async function updateOverheadAllocation(
  allocationId: string,
  data: { allocationPct: number; notes?: string }
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ACCOUNTANT')
  const allocation = await prisma.overheadAllocation.findUnique({
    where: { id: allocationId },
    include: { transaction: { select: { total: true } } },
  })
  if (!allocation || allocation.orgId !== org.orgId) throw new Error('Asignación no encontrada')
  const newAmount = (Number(allocation.transaction.total) * data.allocationPct) / 100
  await prisma.overheadAllocation.update({
    where: { id: allocationId },
    data: {
      allocationPct: new Prisma.Decimal(data.allocationPct),
      allocationAmount: new Prisma.Decimal(newAmount),
      notes: data.notes,
    },
  })
  revalidatePath('/finance/overhead')
  return { success: true }
}

// ====================
// PROYECTOS ACTIVOS (para selector de asignación)
// ====================

export async function getActiveProjects(): Promise<
  Array<{ id: string; name: string; projectNumber: string }>
> {
  const { org } = await getAuthContext()
  return prisma.project.findMany({
    where: { orgId: org.orgId, active: true },
    select: { id: true, name: true, projectNumber: true },
    orderBy: { name: 'asc' },
  })
}

export async function getFinanceFilterOptions(): Promise<{
  projects: Array<{ id: string; name: string; projectNumber: string }>
  parties: Array<{ id: string; name: string; partyType: string }>
}> {
  const { org } = await getAuthContext()
  const [projects, parties] = await Promise.all([
    prisma.project.findMany({
      where: { orgId: org.orgId, active: true },
      select: { id: true, name: true, projectNumber: true },
      orderBy: { name: 'asc' },
    }),
    prisma.party.findMany({
      where: { orgId: org.orgId, active: true },
      select: { id: true, name: true, partyType: true },
      orderBy: { name: 'asc' },
      take: 500,
    }),
  ])
  return { projects, parties }
}

