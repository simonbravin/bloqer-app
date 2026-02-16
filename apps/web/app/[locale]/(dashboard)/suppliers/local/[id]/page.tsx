import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function LocalSupplierDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) notFound()

  const t = await getTranslations('suppliers')
  const tNav = await getTranslations('nav')
  const { id } = await params

  const party = await prisma.party.findFirst({
    where: { id, orgId: org.orgId, partyType: 'SUPPLIER', active: true },
  })

  if (!party) notFound()

  const canEdit = hasMinimumRole(org.role, 'EDITOR')

  const fields = [
    { label: t('name'), value: party.name },
    { label: t('taxId'), value: party.taxId },
    { label: t('email'), value: party.email },
    { label: t('phone'), value: party.phone },
    { label: t('address'), value: party.address },
    { label: t('city'), value: party.city },
    { label: t('country'), value: party.country },
    { label: t('website'), value: party.website },
  ]

  return (
    <div className="h-full">
      <PageHeader
        title={party.name}
        subtitle={t('local')}
        breadcrumbs={[
          { label: t('title'), href: '/suppliers' },
          { label: t('viewSuppliers'), href: '/suppliers/list' },
          { label: party.name },
        ]}
        actions={
          canEdit ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/suppliers/local/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('edit')}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm">
                    {value ? (
                      label === t('email') ? (
                        <a href={`mailto:${value}`} className="text-primary hover:underline">
                          {value}
                        </a>
                      ) : label === t('website') ? (
                        <a
                          href={value.startsWith('http') ? value : `https://${value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Link
            href="/suppliers/list?tab=local"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t('viewSuppliers')}
          </Link>
        </div>
      </div>
    </div>
  )
}
