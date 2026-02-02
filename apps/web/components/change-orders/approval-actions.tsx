'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ApprovalActionsProps = {
  coId: string
  canApprove: boolean
  onApprove: (coId: string) => Promise<{ error?: string } | { success: boolean }>
  onReject: (coId: string, reason: string) => Promise<{ error?: string } | { success: boolean }>
  onRequestChanges: (coId: string, feedback: string) => Promise<{ error?: string } | { success: boolean }>
}

export function ApprovalActions({
  coId,
  canApprove,
  onApprove,
  onReject,
  onRequestChanges,
}: ApprovalActionsProps) {
  const [rejectReason, setRejectReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'changes' | null>(null)

  async function handleApprove() {
    setLoading('approve')
    const result = await onApprove(coId)
    setLoading(null)
    if (result && 'error' in result) alert(result.error)
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.')
      return
    }
    setLoading('reject')
    const result = await onReject(coId, rejectReason.trim())
    setLoading(null)
    if (result && 'error' in result) alert(result.error)
    else setRejectReason('')
  }

  async function handleRequestChanges() {
    if (!feedback.trim()) {
      alert('Please enter feedback.')
      return
    }
    setLoading('changes')
    const result = await onRequestChanges(coId, feedback.trim())
    setLoading(null)
    if (result && 'error' in result) alert(result.error)
    else setFeedback('')
  }

  if (!canApprove) return null

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Approval actions</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleApprove}
          disabled={!!loading}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </Button>
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <div className="min-w-[360px] flex-1">
            <Label htmlFor="reject-reason" className="sr-only">Rejection reason</Label>
            <Input
              id="reject-reason"
              placeholder="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full min-w-0"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            disabled={!!loading || !rejectReason.trim()}
          >
            {loading === 'reject' ? 'Rejecting…' : 'Reject'}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[360px] flex-1">
          <Label htmlFor="feedback" className="sr-only">Feedback for changes</Label>
          <Input
            id="feedback"
            placeholder="Feedback (request changes)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full min-w-0"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleRequestChanges}
          disabled={!!loading || !feedback.trim()}
        >
          {loading === 'changes' ? 'Sending…' : 'Request changes'}
        </Button>
      </div>
    </div>
  )
}
