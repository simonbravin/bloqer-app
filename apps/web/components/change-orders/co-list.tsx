'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ChangeOrderRow = {
  id: string
  number: number
  displayNumber: string
  title: string
  status: string
  costImpact: number
  requestDate: Date
  requestedBy: { user: { fullName: string } }
}

type COListProps = {
  projectId: string
  orders: ChangeOrderRow[]
  canEdit: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString()
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    SUBMITTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    CHANGES_REQUESTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      )}
    >
      {label}
    </span>
  )
}

export function COList({ projectId, orders, canEdit }: COListProps) {
  const t = useTranslations('changeOrders')
  const tCommon = useTranslations('common')

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {t('noChangeOrdersYet')}
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    DRAFT: t('statusDraft'),
    SUBMITTED: t('statusSubmitted'),
    APPROVED: t('statusApproved'),
    REJECTED: t('statusRejected'),
    CHANGES_REQUESTED: t('statusChangesRequested'),
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('number')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('title_field')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('requestedBy')}</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('amount')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('status')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('date')}</th>
            <th className="w-20 px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {orders.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-700 dark:text-gray-300">
                {row.displayNumber}
              </td>
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{row.title}</td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                {row.requestedBy.user.fullName}
              </td>
              <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">
                {formatCurrency(row.costImpact)}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={row.status} label={statusLabels[row.status] ?? row.status.replace('_', ' ')} />
              </td>
              <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                {formatDate(row.requestDate)}
              </td>
              <td className="px-3 py-2">
                <Link href={`/projects/${projectId}/change-orders/${row.id}`}>
                  <Button type="button" variant="ghost" className="h-8 px-2 text-xs">
                    {tCommon('view')}
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
