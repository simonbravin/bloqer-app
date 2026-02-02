'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { answerRfi, closeRfi } from '@/app/actions/quality'
import { cn } from '@/lib/utils'

type RfiDetailProps = {
  rfi: {
    id: string
    number: number
    subject: string
    question: string
    answer: string | null
    status: string
    priority: string
    dueDate: Date | null
    answeredDate: Date | null
    closedDate: Date | null
    raisedBy: { user: { fullName: string; email: string | null } }
    assignedTo: { user: { fullName: string; email: string | null } } | null
    wbsNode: { code: string; name: string } | null
  }
  projectId: string
  canAnswer: boolean
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    ANSWERED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-red-100 text-red-800',
  }
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-xs font-medium',
        styles[priority] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {priority}
    </span>
  )
}

export function RfiDetail({
  rfi,
  projectId,
  canAnswer,
}: RfiDetailProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [answer, setAnswer] = useState(rfi.answer ?? '')

  async function handleAnswer() {
    if (!answer.trim()) return
    setSubmitting(true)
    try {
      await answerRfi(rfi.id, answer)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to answer')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleClose() {
    setSubmitting(true)
    try {
      await closeRfi(rfi.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to close')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              RFI-{String(rfi.number).padStart(3, '0')} — {rfi.subject}
            </h1>
            <div className="mt-2 flex gap-2">
              <StatusBadge status={rfi.status} />
              <PriorityBadge priority={rfi.priority} />
            </div>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Raised by</dt>
            <dd className="mt-0.5 text-sm">{rfi.raisedBy.user.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Assigned to</dt>
            <dd className="mt-0.5 text-sm">
              {rfi.assignedTo?.user.fullName ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">WBS / Location</dt>
            <dd className="mt-0.5 text-sm">
              {rfi.wbsNode ? `${rfi.wbsNode.code} — ${rfi.wbsNode.name}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Due date</dt>
            <dd className="mt-0.5 text-sm">{formatDate(rfi.dueDate)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Question
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-gray-900 dark:text-white">
            {rfi.question}
          </p>
        </div>

        {rfi.answer && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Answer {rfi.answeredDate && `(${formatDate(rfi.answeredDate)})`}
            </h3>
            <p className="mt-1 whitespace-pre-wrap text-blue-800 dark:text-blue-200">
              {rfi.answer}
            </p>
          </div>
        )}

        {canAnswer && rfi.status === 'OPEN' && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium">Provide answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              placeholder="Type your answer..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAnswer} disabled={submitting || !answer.trim()}>
                {submitting ? 'Saving…' : 'Answer RFI'}
              </Button>
            </div>
          </div>
        )}

        {canAnswer && rfi.status === 'ANSWERED' && (
          <div className="mt-4">
            <Button onClick={handleClose} disabled={submitting}>
              {submitting ? 'Closing…' : 'Close RFI'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}