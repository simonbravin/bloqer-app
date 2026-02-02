'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CertStatusBadge } from './cert-status-badge'
import { CertLineTable } from './cert-line-table'
import { formatPeriod, formatCurrency } from '@/lib/certification-utils'
import {
  issueCertification,
  approveCertification,
  deleteCertificationLine,
} from '@/app/actions/certifications'
import type { CertLineRow } from './cert-line-table'

type CertDetailProps = {
  certId: string
  projectId: string
  number: number
  periodMonth: number
  periodYear: number
  status: string
  totalAmount: number
  integritySeal: string | null
  issuedDate: Date | null
  issuedBy: { user: { fullName: string } } | null
  approvedBy: { user: { fullName: string } } | null
  lines: CertLineRow[]
  canIssue: boolean
  canApprove: boolean
  canEdit: boolean
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export function CertDetail({
  certId,
  projectId,
  number,
  periodMonth,
  periodYear,
  status,
  totalAmount,
  integritySeal,
  issuedDate,
  issuedBy,
  approvedBy,
  lines,
  canIssue,
  canApprove,
  canEdit,
}: CertDetailProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleIssue() {
    setSubmitting(true)
    try {
      await issueCertification(certId)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to issue')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleApprove() {
    setSubmitting(true)
    try {
      await approveCertification(certId)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteLine(lineId: string) {
    try {
      await deleteCertificationLine(lineId)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove line')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Period</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
              {formatPeriod(periodMonth, periodYear)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="mt-0.5">
              <CertStatusBadge status={status} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Total amount</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </dd>
          </div>
          {issuedDate && (
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Issued date</dt>
              <dd className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                {formatDate(issuedDate)}
              </dd>
            </div>
          )}
          {issuedBy && (
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Issued by</dt>
              <dd className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                {issuedBy.user.fullName}
              </dd>
            </div>
          )}
          {approvedBy && (
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Approved by</dt>
              <dd className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                {approvedBy.user.fullName}
              </dd>
            </div>
          )}
          {integritySeal && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Integrity seal (SHA-256)</dt>
              <dd className="mt-0.5 truncate font-mono text-xs text-gray-600 dark:text-gray-400" title={integritySeal}>
                {integritySeal}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex flex-wrap gap-2">
        {canIssue && status === 'DRAFT' && (
          <Button onClick={handleIssue} disabled={submitting || lines.length === 0}>
            {submitting ? 'Issuing…' : 'Issue certification'}
          </Button>
        )}
        {canApprove && status === 'ISSUED' && (
          <Button onClick={handleApprove} disabled={submitting}>
            {submitting ? 'Approving…' : 'Approve'}
          </Button>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Certification lines</h2>
        <CertLineTable
          lines={lines}
          canDelete={canEdit && status === 'DRAFT'}
          onDelete={canEdit && status === 'DRAFT' ? handleDeleteLine : undefined}
        />
      </div>
    </div>
  )
}
