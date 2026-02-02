'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { formatDateShort } from '@/lib/format-utils'

export type SubmittalRow = {
  id: string
  number: number
  submittalType: string
  specSection: string | null
  status: string
  revisionNumber: number
  dueDate: Date
  submittedDate: Date | null
  reviewedDate: Date | null
  submittedBy: { name: string } | null
  reviewedBy: { user: { fullName: string } } | null
  wbsNode: { code: string; name: string } | null
}

type SubmittalListProps = {
  submittals: SubmittalRow[]
  projectId: string
}

const STATUS_OPTIONS = [
  '',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'APPROVED_AS_NOTED',
  'REJECTED',
  'REVISE_AND_RESUBMIT',
] as const

const STATUS_VARIANT: Record<string, 'neutral' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  APPROVED_AS_NOTED: 'success',
  REJECTED: 'danger',
  REVISE_AND_RESUBMIT: 'warning',
}

export function SubmittalList({ submittals, projectId }: SubmittalListProps) {
  const [statusFilter, setStatusFilter] = useState('')

  const filtered =
    statusFilter === ''
      ? submittals
      : submittals.filter((s) => s.status === statusFilter)

  if (submittals.length === 0) {
    return (
      <div className="erp-card py-12 text-center text-muted-foreground">
        No submittals yet. Create one to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground">Filter by status:</Label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-card px-2 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s === '' ? 'All' : s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="erp-card overflow-hidden">
        <table className="erp-table w-full text-sm">
          <thead>
            <tr className="erp-table-header">
              <th className="erp-table-cell font-medium text-muted-foreground">#</th>
              <th className="erp-table-cell font-medium text-muted-foreground">Type</th>
              <th className="erp-table-cell font-medium text-muted-foreground">Spec</th>
              <th className="erp-table-cell font-medium text-muted-foreground">Status</th>
              <th className="erp-table-cell font-medium text-muted-foreground">Revision</th>
              <th className="erp-table-cell font-medium text-muted-foreground">Due</th>
              <th className="erp-table-cell w-20" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="erp-table-row">
                <td className="erp-table-cell whitespace-nowrap font-mono text-foreground">
                  S-{String(s.number).padStart(3, '0')}
                </td>
                <td className="erp-table-cell font-medium text-foreground">
                  {s.submittalType.replace(/_/g, ' ')}
                </td>
                <td className="erp-table-cell text-muted-foreground">{s.specSection ?? '—'}</td>
                <td className="erp-table-cell">
                  <Badge variant={STATUS_VARIANT[s.status] ?? 'neutral'}>
                    {s.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="erp-table-cell font-mono tabular-nums text-muted-foreground">
                  {s.revisionNumber}
                </td>
                <td className="erp-table-cell font-mono tabular-nums text-muted-foreground">
                  {formatDateShort(s.dueDate)}
                </td>
                <td className="erp-table-cell">
                  <Link href={`/projects/${projectId}/quality/submittals/${s.id}`}>
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
    </div>
  )
}
