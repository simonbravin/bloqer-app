import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { SupplierSearch } from '@/components/suppliers/supplier-search'

export default async function GlobalSuppliersPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const suppliers = await prisma.globalParty.findMany({
    where: { active: true },
    take: 50,
    orderBy: [{ verified: 'desc' }, { orgCount: 'desc' }],
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/suppliers"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Suppliers
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Global Supplier Directory
      </h1>
      <SupplierSearch initialResults={suppliers} />
    </div>
  )
}
