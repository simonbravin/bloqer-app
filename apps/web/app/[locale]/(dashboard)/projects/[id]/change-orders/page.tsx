import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { getProject } from '@/app/actions/projects'
import { listChangeOrders } from '@/app/actions/change-orders'
import { ChangeOrdersListClient } from '@/components/change-orders/change-orders-list-client'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function ProjectChangeOrdersPage({ params, searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const statusFilter = (await searchParams).status
  const orders = await listChangeOrders(projectId, { status: statusFilter })
  const canEdit = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← {project.name}
        </Link>
      </div>
      <ChangeOrdersListClient
        projectId={projectId}
        orders={orders ?? []}
        canEdit={canEdit}
      />
    </div>
  )
}
