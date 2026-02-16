import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import { getTranslations } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { PageHeader } from '@/components/layout/page-header'
import { LocalSupplierForm } from '@/components/suppliers/local-supplier-form'
import { Link } from '@/i18n/navigation'

export default async function NewLocalSupplierPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  if (!['EDITOR', 'ADMIN', 'OWNER'].includes(org.role)) {
    return redirectTo('/suppliers')
  }

  const t = await getTranslations('suppliers')

  return (
    <div className="h-full">
      <PageHeader
        title={t('addLocalSupplier')}
        breadcrumbs={[
          { label: t('title'), href: '/suppliers' },
          { label: t('local'), href: '/suppliers/list?tab=local' },
          { label: t('addLocalSupplier') },
        ]}
      />
      <div className="p-6">
        <LocalSupplierForm />
      </div>
    </div>
  )
}
