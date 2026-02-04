import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getBudgetVsActualReport } from '@/app/actions/predefined-reports'
import { BudgetVsActualReportClient } from '@/components/reports/budget-vs-actual-report-client'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function BudgetVsActualPage({ params }: PageProps) {
  const session = await getSession()
  const { locale } = await params
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const org = await getOrgContext(session.user.id)
  if (!org?.orgId) redirect(`/${locale}/login`)

  const data = await getBudgetVsActualReport()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Presupuesto vs Real
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Control de costos por proyecto
        </p>
      </div>

      <BudgetVsActualReportClient data={data} />
    </div>
  )
}
