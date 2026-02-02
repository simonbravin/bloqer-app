import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { listSuppliers } from '@/app/actions/resources'
import { ResourceForm } from '@/components/resources/resource-form'
import { createResource } from '@/app/actions/resources'
import type { CreateResourceInput } from '@repo/validators'

export default async function NewResourcePage() {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  if (!hasMinimumRole(org.role, 'ADMIN')) return notFound()

  const supplierOptions = await listSuppliers()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/resources"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Resources
        </Link>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Add resource
      </h2>
      <ResourceForm
        mode="create"
        supplierOptions={supplierOptions}
        onSubmit={(data) => createResource(data as CreateResourceInput)}
        onCancelHref="/resources"
      />
    </div>
  )
}
