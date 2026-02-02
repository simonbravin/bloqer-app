import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { getProject } from '@/app/actions/projects'
import { BudgetVersionForm } from '@/components/budget/budget-version-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewBudgetVersionPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const canEdit = hasMinimumRole(org.role, 'EDITOR')
  if (!canEdit) notFound()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/budget`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Budget
        </Link>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        New budget version
      </h2>
      <BudgetVersionForm projectId={projectId} />
    </div>
  )
}
