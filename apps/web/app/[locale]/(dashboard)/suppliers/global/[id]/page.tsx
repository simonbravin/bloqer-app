import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { GlobalSupplierDetail } from '@/components/suppliers/global-supplier-detail'
import {
  unlinkGlobalSupplier,
} from '@/app/actions/global-suppliers'
import { GlobalSupplierUnlinkButton } from '@/components/suppliers/global-supplier-unlink-button'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function GlobalSupplierDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: supplierId } = await params

  const supplier = await prisma.globalParty.findUnique({
    where: { id: supplierId, active: true },
  })

  if (!supplier) notFound()

  const link = await prisma.orgPartyLink.findUnique({
    where: {
      orgId_globalPartyId: { orgId: org.orgId, globalPartyId: supplierId },
    },
  })

  const isLinked = link !== null && link.status === 'ACTIVE'
  const canUnlink = link && link.status === 'ACTIVE'

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/suppliers/list"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Proveedores
        </Link>
      </div>

      <div className="mb-4 flex justify-end">
        {canUnlink && (
          <GlobalSupplierUnlinkButton
            globalPartyId={supplierId}
            supplierName={supplier.name}
            unlinkGlobalSupplier={unlinkGlobalSupplier}
          />
        )}
      </div>

      <GlobalSupplierDetail
        supplier={{
          id: supplier.id,
          name: supplier.name,
          legalName: supplier.legalName,
          category: supplier.category,
          description: supplier.description,
          email: supplier.email,
          phone: supplier.phone,
          website: supplier.website,
          verified: supplier.verified,
          avgRating: supplier.avgRating,
          reviewCount: supplier.reviewCount,
          orgCount: supplier.orgCount,
          countries: supplier.countries,
          regions: supplier.regions,
          certifications: supplier.certifications,
        }}
        isLinked={isLinked}
        linkId={link?.id ?? null}
      />
    </div>
  )
}
