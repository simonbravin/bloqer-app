import { notFound } from 'next/navigation'
import Link from 'next/link'
import { redirectTo } from '@/lib/i18n-redirect'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { getProject } from '@/app/actions/projects'
import { createChangeOrder } from '@/app/actions/change-orders'
import { COForm } from '@/components/change-orders/co-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewChangeOrderPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const canEdit = hasMinimumRole(org.role, 'EDITOR')
  if (!canEdit) notFound()

  async function onSubmit(data: Parameters<typeof createChangeOrder>[1]) {
    'use server'
    const result = await createChangeOrder(projectId, data)
    if (result && 'success' in result) {
      const list = await import('@/app/actions/change-orders').then((m) => m.listChangeOrders(projectId, {}))
      const created = list?.find((o) => o.requestedBy?.user?.fullName) // find latest by number
      const latest = list?.[0]
      if (latest) return redirectTo(`/projects/${projectId}/change-orders/${latest.id}`)
    }
    return result
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/change-orders`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Change orders
        </Link>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        New change order
      </h2>
      <COForm
        mode="create"
        onSubmit={onSubmit}
        onCancelHref={`/projects/${projectId}/change-orders`}
      />
    </div>
  )
}
