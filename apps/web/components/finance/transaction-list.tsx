'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format-utils'
import { getStatusLabel } from '@/lib/finance-labels'

export type TransactionRow = {
  id: string
  transactionNumber: string
  issueDate: Date
  type: string
  description: string
  total: number
  amountBaseCurrency: number
  currency: string
  status: string
  project: { id: string; name: string } | null
  createdBy: { user: { fullName: string } }
}

type TransactionListProps = {
  transactions: TransactionRow[]
  canCreate: boolean
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
}

const STATUS_VARIANT: Record<string, 'neutral' | 'warning' | 'success' | 'info' | 'danger'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  PAID: 'info',
  VOIDED: 'danger',
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const variant = STATUS_VARIANT[status] ?? 'neutral'
  return <Badge variant={variant}>{label ?? status}</Badge>
}

export function TransactionList({ transactions, canCreate }: TransactionListProps) {
  const t = useTranslations('finance')
  const tCommon = useTranslations('common')
  const emptyMsg = canCreate
    ? `${t('noTransactionsYet')} ${t('createOneToStart')}`
    : t('noTransactionsYet')

  if (transactions.length === 0) {
    return (
      <div className="erp-card py-12 text-center text-muted-foreground">
        {emptyMsg}
      </div>
    )
  }

  return (
    <div className="erp-card overflow-hidden">
      <table className="erp-table w-full text-sm">
        <thead>
          <tr className="erp-table-header">
            <th className="erp-table-cell font-medium text-muted-foreground">{t('transactionNumber')}</th>
            <th className="erp-table-cell font-medium text-muted-foreground">{t('date')}</th>
            <th className="erp-table-cell font-medium text-muted-foreground">{t('type')}</th>
            <th className="erp-table-cell font-medium text-muted-foreground">{t('description')}</th>
            <th className="erp-table-cell-numeric font-medium text-muted-foreground">{t('amount')}</th>
            <th className="erp-table-cell font-medium text-muted-foreground">{t('status')}</th>
            <th className="erp-table-cell w-20" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => (
            <tr key={row.id} className="erp-table-row">
              <td className="erp-table-cell whitespace-nowrap font-mono text-foreground">
                {row.transactionNumber}
              </td>
              <td className="erp-table-cell text-muted-foreground">{formatDate(row.issueDate)}</td>
              <td className="erp-table-cell text-muted-foreground">{row.type.replace(/_/g, ' ')}</td>
              <td className="erp-table-cell max-w-[200px] truncate text-foreground" title={row.description}>
                {row.description}
              </td>
              <td className="erp-table-cell-numeric text-foreground">
                {formatCurrency(row.total, row.currency)}
              </td>
              <td className="erp-table-cell">
                <StatusBadge status={row.status} label={getStatusLabel(row.status, row.type)} />
              </td>
              <td className="erp-table-cell">
                <Link href={`/finance/transactions/${row.id}`}>
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
