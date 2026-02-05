import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getTopMaterialsReport } from '@/app/actions/predefined-reports'
import { TopMaterialsReportClient } from '@/components/reports/top-materials-report-client'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function TopMaterialsPage({ params }: PageProps) {
  const session = await getSession()
  const { locale } = await params
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const org = await getOrgContext(session.user.id)
  if (!org?.orgId) redirect(`/${locale}/login`)

  const data = await getTopMaterialsReport(10)

  return (
    <div className="mx-auto max-w-6xl w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Top 10 Materiales más Caros
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Análisis de materiales por costo total en presupuestos aprobados
        </p>
      </div>

      <TopMaterialsReportClient data={data} />
    </div>
  )
}
