import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { LocalSupplierEditForm } from '@/components/suppliers/local-supplier-edit-form'
import { Link } from '@/i18n/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function LocalSupplierEditPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) notFound()

  const t = await getTranslations('suppliers')
  const { id } = await params

  const party = await prisma.party.findFirst({
    where: { id, orgId: org.orgId, partyType: 'SUPPLIER', active: true },
  })

  if (!party) notFound()
  if (!hasMinimumRole(org.role, 'EDITOR')) notFound()

  const defaultValues = {
    name: party.name,
    taxId: party.taxId ?? '',
    email: party.email ?? '',
    phone: party.phone ?? '',
    address: party.address ?? '',
    city: party.city ?? '',
    country: party.country ?? '',
    website: party.website ?? '',
  }

  return (
    <div className="h-full">
      <PageHeader
        title={`${t('edit')}: ${party.name}`}
        subtitle={t('local')}
        breadcrumbs={[
          { label: t('title'), href: '/suppliers' },
          { label: t('viewSuppliers'), href: '/suppliers/list' },
          { label: party.name, href: `/suppliers/local/${id}` },
          { label: t('edit') },
        ]}
      />

      <div className="p-6">
        <LocalSupplierEditForm partyId={id} defaultValues={defaultValues} />
        <div className="mt-4">
          <Link
            href={`/suppliers/local/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {party.name}
          </Link>
        </div>
      </div>
    </div>
  )
}
