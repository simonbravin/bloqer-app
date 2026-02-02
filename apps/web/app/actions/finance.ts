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
  getTransactionTypePrefix,
  type TransactionType,
} from '@repo/validators'
import type {
  CreateFinanceTransactionInput,
  UpdateFinanceTransactionInput,
  CreateFinanceLineInput,
  UpdateFinanceLineInput,
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
