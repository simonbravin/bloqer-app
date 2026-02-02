'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransactionList, type TransactionRow } from './transaction-list'

type TransactionsListClientProps = {
  transactions: TransactionRow[]
  projects: { id: string; name: string }[]
  canCreate: boolean
}

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function TransactionsListClient({
  transactions,
  projects,
  canCreate,
}: TransactionsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? ''
  const status = searchParams.get('status') ?? ''
  const projectId = searchParams.get('projectId') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  function setFilters(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else p.delete(k)
    })
    router.push(`/finance/transactions?${p.toString()}`)
    router.refresh()
  }

  const t = useTranslations('finance')
  const tCommon = useTranslations('common')

  const totalsByCurrency = transactions.reduce<Record<string, number>>((acc, tx) => {
    const k = tx.currency
    acc[k] = (acc[k] ?? 0) + tx.total
    return acc
  }, {})
  const totalBase = transactions.reduce((s, tx) => s + tx.amountBaseCurrency, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('transactions')}</h2>
        {canCreate && (
          <Link href="/finance/transactions/new">
            <Button type="button">{t('newTransaction')}</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filters')}:</span>
        <select
          value={type}
          onChange={(e) => setFilters({ type: e.target.value })}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">{t('allTypes')}</option>
          <option value="INVOICE_RECEIVED">{t('typeInvoiceReceived')}</option>
          <option value="PAYMENT_MADE">{t('typePaymentMade')}</option>
          <option value="EXPENSE">{t('typeExpense')}</option>
          <option value="ADVANCE_PAYMENT">{t('typeAdvancePayment')}</option>
          <option value="REFUND">{t('typeRefund')}</option>
        </select>
        <select
          value={status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="DRAFT">{t('statuses.DRAFT')}</option>
          <option value="SUBMITTED">{t('statuses.SUBMITTED')}</option>
          <option value="APPROVED">{t('statuses.APPROVED')}</option>
          <option value="PAID">{t('statuses.PAID')}</option>
          <option value="VOIDED">{t('statuses.VOIDED')}</option>
        </select>
        <select
          value={projectId}
          onChange={(e) => setFilters({ projectId: e.target.value })}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">{t('allProjects')}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
          placeholder={tCommon('from')}
          className="max-w-[140px]"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
          placeholder={tCommon('to')}
          className="max-w-[140px]"
        />
      </div>

      <TransactionList transactions={transactions} canCreate={canCreate} />

      {transactions.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{tCommon('totals')}</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            {Object.entries(totalsByCurrency).map(([curr, amt]) => (
              <span key={curr} className="tabular-nums text-gray-900 dark:text-white">
                {curr}: {formatCurrency(amt, curr)}
              </span>
            ))}
            <span className="font-medium tabular-nums text-gray-900 dark:text-white">
              {t('baseCurrency')}: {formatCurrency(totalBase)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
