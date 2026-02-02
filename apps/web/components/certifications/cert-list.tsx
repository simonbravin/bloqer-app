'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CertStatusBadge } from './cert-status-badge'
import { formatPeriod, formatCurrency } from '@/lib/certification-utils'
export type CertRow = {
  id: string
  number: number
  periodMonth: number
  periodYear: number
  status: string
  totalAmount: number
  issuedDate: Date | null
  issuedAt: Date | null
  issuedBy: { user: { fullName: string } } | null
  approvedBy: { user: { fullName: string } } | null
  lines: { id: string; periodAmount: unknown }[]
}

type CertListProps = {
  certifications: CertRow[]
  projectId: string
  approvedTotal?: number
}

const STATUS_OPTIONS = ['', 'DRAFT', 'ISSUED', 'APPROVED'] as const

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'short' })
}

export function CertList({
  certifications,
  projectId,
  approvedTotal = 0,
}: CertListProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const t = useTranslations('certifications')
  const tCommon = useTranslations('common')
  const tBudget = useTranslations('budget')

  const filtered =
    statusFilter === ''
      ? certifications
      : certifications.filter((c) => c.status === statusFilter)

  return (
    <div className="space-y-4">
      {approvedTotal > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {tBudget('runningTotalApproved')}: {formatCurrency(approvedTotal)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-gray-600 dark:text-gray-400">
          {t('filterByStatus')}
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s === '' ? tCommon('all') : t(`statuses.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {t('noCertificationsYet')}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t('number')}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t('period')}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t('status')}
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                  {t('totalAmount')}
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t('issuedDate')}
                </th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => (
                <tr
                  key={cert.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-700 dark:text-gray-300">
                    {cert.number}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {formatPeriod(cert.periodMonth, cert.periodYear)}
                  </td>
                  <td className="px-3 py-2">
                    <CertStatusBadge status={cert.status} />
                  </td>
                  <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">
                    {formatCurrency(cert.totalAmount)}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {formatDate(cert.issuedDate ?? cert.issuedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/projects/${projectId}/certifications/${cert.id}`}>
                      <Button type="button" variant="ghost" className="h-8 px-2 text-xs">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
