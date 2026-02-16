import { redirectToLogin } from '@/lib/i18n-redirect'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { SuppliersKPICards } from '@/components/suppliers/suppliers-kpi-cards'
import { Button } from '@/components/ui/button'
import { Building2, Plus } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function SuppliersDashboardPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const t = await getTranslations('suppliers')

  const [linkedCount, localCount] = await Promise.all([
    prisma.orgPartyLink.count({
      where: { orgId: org.orgId, status: 'ACTIVE' },
    }),
    prisma.party.count({
      where: { orgId: org.orgId, partyType: 'SUPPLIER', active: true },
    }),
  ])

  const canAddLocal = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="h-full">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={
          <div className="flex gap-2">
            {canAddLocal && (
              <Button asChild variant="default">
                <Link href="/suppliers/local/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addLocalSupplier')}
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-6 p-6">
        <SuppliersKPICards totalLinked={linkedCount} totalLocal={localCount} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/suppliers/list"
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-muted/50"
          >
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">{t('viewSuppliers')}</h3>
              <p className="text-sm text-muted-foreground">{t('viewSuppliersDesc')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
