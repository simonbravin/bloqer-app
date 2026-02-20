import {
  getProjectCashflow,
  getProjectCashflowKPIs,
  getProjectCashflowSummary,
  getProjectCashflowBreakdownByWbs,
  getProjectCashflowMonthComparison,
} from '@/app/actions/finance'
import { getProject } from '@/app/actions/projects'
import { CashflowComparisonCards } from '@/components/finance/cashflow-comparison-cards'
import { CashflowChartClient } from '@/components/finance/cashflow-chart-client'
import { CashflowKPICards } from '@/components/finance/cashflow-kpi-cards'
import { ProjectCashflowBreakdownChart } from '@/components/finance/project-cashflow-breakdown-chart'
import { ProjectCashflowExportToolbar } from '@/components/finance/project-cashflow-export-toolbar'
import { ProjectCashflowPeriodSelector } from '@/components/finance/project-cashflow-period-selector'
import { ProjectCashflowSummaryStats } from '@/components/finance/project-cashflow-summary-stats'
import { UpcomingPaymentsTable } from '@/components/finance/upcoming-payments-table'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function ProjectCashflowPage({ params, searchParams }: PageProps) {
  const { id: projectId } = await params
  const sp = await searchParams
  const toDate = sp.to ? new Date(sp.to) : new Date()
  const fromDate = sp.from
    ? new Date(sp.from)
    : new Date(toDate.getFullYear(), toDate.getMonth() - 6, 1)

  const dateRange = { from: fromDate, to: toDate }
  const [project, cashflowData, kpis, summary, breakdownResult, monthComparison] =
    await Promise.all([
      getProject(projectId),
      getProjectCashflow(projectId, dateRange),
      getProjectCashflowKPIs(projectId),
      getProjectCashflowSummary(projectId, dateRange),
      getProjectCashflowBreakdownByWbs(projectId, dateRange),
      getProjectCashflowMonthComparison(projectId),
    ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cashflow del proyecto</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ingresos, gastos y balance del período. Desglose por partida EDT.
          </p>
        </div>
        <ProjectCashflowExportToolbar
          projectId={projectId}
          dateFrom={fromDate}
          dateTo={toDate}
        />
      </div>
      <ProjectCashflowPeriodSelector range={{ from: fromDate, to: toDate }} />
      <CashflowKPICards kpis={kpis} />

      <CashflowComparisonCards data={monthComparison} />

      <ProjectCashflowSummaryStats summary={summary} dateRange={dateRange} />

      <CashflowChartClient
        projectId={projectId}
        initialData={cashflowData}
        range={{ from: fromDate, to: toDate }}
        timelineByWbs={breakdownResult.timelineByWbs}
        breakdownByWbs={breakdownResult.breakdown}
      />

      <ProjectCashflowBreakdownChart breakdown={breakdownResult.breakdown} />

      {kpis.upcomingPayments.length > 0 && (
        <UpcomingPaymentsTable payments={kpis.upcomingPayments} />
      )}
    </div>
  )
}
