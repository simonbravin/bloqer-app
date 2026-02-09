import { getProjectCashflow, getProjectCashflowKPIs } from '@/app/actions/finance'
import { getProject } from '@/app/actions/projects'
import { CashflowChartClient } from '@/components/finance/cashflow-chart-client'
import { CashflowKPICards } from '@/components/finance/cashflow-kpi-cards'
import { UpcomingPaymentsTable } from '@/components/finance/upcoming-payments-table'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProjectCashflowPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, cashflowData, kpis] = await Promise.all([
    getProject(projectId),
    getProjectCashflow(projectId),
    getProjectCashflowKPIs(projectId),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Flujo de Caja
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visualización de ingresos y gastos del proyecto {project.name}
        </p>
      </div>

      <CashflowKPICards kpis={kpis} />

      <CashflowChartClient projectId={projectId} initialData={cashflowData} />

      {kpis.upcomingPayments.length > 0 && (
        <UpcomingPaymentsTable payments={kpis.upcomingPayments} />
      )}
    </div>
  )
}
