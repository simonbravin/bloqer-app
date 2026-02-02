import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { listResources } from '@/app/actions/resources'
import { ResourcesPageClient } from '@/components/resources/resources-page-client'

type PageProps = {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const canEdit = hasMinimumRole(org.role, 'ADMIN')
  const params = await searchParams
  const data = await listResources({
    category: params.category,
    search: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    pageSize: 20,
  })

  if (!data) return notFound()

  return (
    <div className="p-6">
      <ResourcesPageClient
        initialData={data}
        canEdit={canEdit}
      />
    </div>
  )
}
