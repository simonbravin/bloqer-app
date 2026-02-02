import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { LocationForm } from '@/components/inventory/location-form'

export default async function NewLocationPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  requireRole(org.role, 'EDITOR')

  const projects = await prisma.project.findMany({
    where: { orgId: org.orgId },
    select: { id: true, name: true, projectNumber: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/inventory/locations"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Locations
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        New location
      </h1>
      <LocationForm projects={projects} />
    </div>
  )
}
