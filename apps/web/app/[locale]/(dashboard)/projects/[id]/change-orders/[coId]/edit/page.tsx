import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { getProject } from '@/app/actions/projects'
import { getChangeOrder, updateChangeOrder } from '@/app/actions/change-orders'
import { COForm } from '@/components/change-orders/co-form'

type PageProps = {
  params: Promise<{ id: string; coId: string }>
}

export default async function ChangeOrderEditPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId, coId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const co = await getChangeOrder(coId)
  if (!co || co.project.id !== projectId) notFound()

  const canEdit = hasMinimumRole(org.role, 'EDITOR')
  const isEditable = co.status === 'DRAFT' || co.status === 'CHANGES_REQUESTED'
  if (!canEdit || !isEditable) notFound()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/change-orders/${coId}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← {co.displayNumber}
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          href={`/projects/${projectId}/change-orders`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Change orders
        </Link>
      </div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Edit change order</h1>
      <COForm
        mode="edit"
        defaultValues={{
          title: co.title,
          reason: co.reason,
          justification: co.justification ?? undefined,
        }}
        editAction={updateChangeOrder}
        coId={coId}
        onCancelHref={`/projects/${projectId}/change-orders/${coId}`}
      />
    </div>
  )
}
