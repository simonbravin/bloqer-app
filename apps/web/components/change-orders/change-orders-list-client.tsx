'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { COList, type ChangeOrderRow } from './co-list'
import { Button } from '@/components/ui/button'

type ChangeOrdersListClientProps = {
  projectId: string
  orders: ChangeOrderRow[]
  canEdit: boolean
}

export function ChangeOrdersListClient({
  projectId,
  orders,
  canEdit,
}: ChangeOrdersListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') ?? ''

  function setFilter(newStatus: string) {
    const p = new URLSearchParams()
    if (newStatus) p.set('status', newStatus)
    router.push(`/projects/${projectId}/change-orders?${p.toString()}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Change orders
        </h2>
        {canEdit && (
          <Link href={`/projects/${projectId}/change-orders/new`}>
            <Button type="button">New change order</Button>
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
        <select
          value={status}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CHANGES_REQUESTED">Changes requested</option>
        </select>
      </div>
      <COList projectId={projectId} orders={orders} canEdit={canEdit} />
    </div>
  )
}
