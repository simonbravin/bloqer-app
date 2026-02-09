import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'

export default async function LocalSuppliersPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const suppliers = await prisma.party.findMany({
    where: { orgId: org.orgId, partyType: 'SUPPLIER', active: true },
    orderBy: { name: 'asc' },
  })

  const canAdd = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/suppliers"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Suppliers
        </Link>
        {canAdd && (
          <Link
            href="/suppliers/local/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add Local Supplier
          </Link>
        )}
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Local Suppliers
      </h1>
      {suppliers.length === 0 ? (
        <p className="text-gray-500">No local suppliers yet.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Phone</th>
                <th className="px-3 py-2 text-left font-medium">City</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {s.email ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {s.phone ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                    {s.city ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
