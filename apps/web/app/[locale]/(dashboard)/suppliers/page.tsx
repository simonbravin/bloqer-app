import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { SupplierSearch } from '@/components/suppliers/supplier-search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SuppliersPageClient } from '@/components/suppliers/suppliers-page-client'

type PageProps = {
  searchParams: Promise<{ q?: string; category?: string; tab?: string }>
}

export default async function SuppliersPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { q, category, tab } = await searchParams

  const linkedSuppliers = await prisma.orgPartyLink.findMany({
    where: { orgId: org.orgId, status: 'ACTIVE' },
    include: {
      globalParty: {
        select: {
          id: true,
          name: true,
          category: true,
          verified: true,
          avgRating: true,
          countries: true,
        },
      },
    },
  })

  const localSuppliers = await prisma.party.findMany({
    where: { orgId: org.orgId, partyType: 'SUPPLIER', active: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
    },
  })

  const globalSearch = q
    ? await prisma.globalParty.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
          ],
          ...(category && { category }),
        },
        take: 20,
      })
    : await prisma.globalParty.findMany({
        where: { active: true },
        take: 20,
        orderBy: [{ verified: 'desc' }, { orgCount: 'desc' }],
      })

  const canAddLocal = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Suppliers
        </h1>
        {canAddLocal && (
          <Link
            href="/suppliers/local/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Local Supplier
          </Link>
        )}
      </div>

      <SuppliersPageClient
        defaultTab={tab || 'linked'}
        linkedSuppliers={linkedSuppliers}
        localSuppliers={localSuppliers}
        globalSearchResults={globalSearch}
        canAddLocal={canAddLocal}
      />
    </div>
  )
}
