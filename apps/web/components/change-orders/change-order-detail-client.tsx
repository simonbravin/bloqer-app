'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ApprovalActions } from './approval-actions'

type ChangeOrderDetailClientProps = {
  coId: string
  status: string
  canSubmit: boolean
  canApprove: boolean
  submitForApproval: (id: string) => Promise<{ error?: string } | { success: boolean }>
  approveChangeOrder: (id: string) => Promise<{ error?: string } | { success: boolean }>
  rejectChangeOrder: (id: string, reason: string) => Promise<{ error?: string } | { success: boolean }>
  requestChanges: (id: string, feedback: string) => Promise<{ error?: string } | { success: boolean }>
}

export function ChangeOrderDetailClient({
  coId,
  status,
  canSubmit,
  canApprove,
  submitForApproval,
  approveChangeOrder,
  rejectChangeOrder,
  requestChanges,
}: ChangeOrderDetailClientProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    const result = await submitForApproval(coId)
    setSubmitting(false)
    if (result && 'error' in result) {
      alert(result.error)
      return
    }
    router.refresh()
  }

  async function handleApprove(id: string) {
    const result = await approveChangeOrder(id)
    if (result && 'error' in result) {
      alert(result.error)
      return result
    }
    router.refresh()
    return result!
  }

  async function handleReject(id: string, reason: string) {
    const result = await rejectChangeOrder(id, reason)
    if (result && 'error' in result) {
      alert(result.error)
      return result
    }
    router.refresh()
    return result!
  }

  async function handleRequestChanges(id: string, feedback: string) {
    const result = await requestChanges(id, feedback)
    if (result && 'error' in result) {
      alert(result.error)
      return result
    }
    router.refresh()
    return result!
  }

  return (
    <>
      {canSubmit && (status === 'DRAFT' || status === 'CHANGES_REQUESTED') && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </Button>
        </div>
      )}
      {status === 'SUBMITTED' && (
        <ApprovalActions
          coId={coId}
          canApprove={canApprove}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      )}
    </>
  )
}
