'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { submitSubmittal, reviewSubmittal } from '@/app/actions/quality'
import { cn } from '@/lib/utils'

const REVIEW_STATUSES = [
  { value: 'APPROVED', label: 'Approved' },
  { value: 'APPROVED_AS_NOTED', label: 'Approved as Noted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REVISE_AND_RESUBMIT', label: 'Revise and Resubmit' },
] as const

type SubmittalDetailProps = {
  submittal: {
    id: string
    number: number
    submittalType: string
    specSection: string | null
    status: string
    revisionNumber: number
    dueDate: Date
    submittedDate: Date | null
    reviewedDate: Date | null
    reviewComments: string | null
    submittedBy: { name: string } | null
    reviewedBy: { user: { fullName: string } } | null
    wbsNode: { code: string; name: string } | null
  }
  projectId: string
  canEdit: boolean
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    SUBMITTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    APPROVED_AS_NOTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    REVISE_AND_RESUBMIT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  }
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function SubmittalDetail({
  submittal,
  projectId,
  canEdit,
}: SubmittalDetailProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [reviewComments, setReviewComments] = useState(
    submittal.reviewComments ?? ''
  )

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await submitSubmittal(submittal.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReview() {
    setSubmitting(true)
    try {
      await reviewSubmittal(submittal.id, {
        status: reviewStatus,
        reviewComments: reviewComments || undefined,
      })
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to review')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = canEdit && submittal.status === 'DRAFT'
  const canReview =
    canEdit &&
    ['SUBMITTED', 'UNDER_REVIEW'].includes(submittal.status)

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          S-{String(submittal.number).padStart(3, '0')} — {submittal.submittalType.replace(/_/g, ' ')}
        </h1>
        <div className="mt-2">
          <StatusBadge status={submittal.status} />
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Spec section</dt>
            <dd className="mt-0.5 text-sm">{submittal.specSection ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Revision</dt>
            <dd className="mt-0.5 text-sm">{submittal.revisionNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Due date</dt>
            <dd className="mt-0.5 text-sm">{formatDate(submittal.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Submitted by</dt>
            <dd className="mt-0.5 text-sm">
              {submittal.submittedBy?.name ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Submitted date</dt>
            <dd className="mt-0.5 text-sm">{formatDate(submittal.submittedDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">WBS / Location</dt>
            <dd className="mt-0.5 text-sm">
              {submittal.wbsNode
                ? `${submittal.wbsNode.code} — ${submittal.wbsNode.name}`
                : '—'}
            </dd>
          </div>
        </dl>

        {submittal.reviewComments && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-800/50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Review comments
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
              {submittal.reviewComments}
            </p>
            {submittal.reviewedBy && (
              <p className="mt-2 text-xs text-gray-500">
                Reviewed by {submittal.reviewedBy.user.fullName} on{' '}
                {formatDate(submittal.reviewedDate)}
              </p>
            )}
          </div>
        )}

        {canSubmit && (
          <div className="mt-4">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </Button>
          </div>
        )}

        {canReview && (
          <div className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-sm font-medium">Review submittal</h3>
            <div>
              <label className="block text-sm">Decision</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {REVIEW_STATUSES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">Comments</label>
              <textarea
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <Button onClick={handleReview} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit review'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
