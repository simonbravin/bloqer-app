import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { FinanceTabs } from '@/components/finance/finance-tabs'

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })
  const org = await getOrgContext(session.user.id)
  if (!org) redirect({ href: '/login', locale })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Finanzas de Empresa
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestión financiera consolidada de toda la organización
        </p>
      </div>

      <FinanceTabs />

      {children}
    </div>
  )
}
