import { getCompanyCashflowDetailed, getCashflowMonthComparison } from '@/app/actions/finance'
import { CashflowComparisonCards } from '@/components/finance/cashflow-comparison-cards'
import { CashflowSummaryStats } from '@/components/finance/cashflow-summary-stats'
import { CompanyCashflowChartClient } from '@/components/finance/company-cashflow-chart-client'
import { CashflowBreakdownChart } from '@/components/finance/cashflow-breakdown-chart'

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function CompanyCashflowPage({ searchParams }: PageProps) {
  const params = await searchParams
  const toDate = params.to ? new Date(params.to) : new Date()
  const fromDate = params.from
    ? new Date(params.from)
    : new Date(toDate.getFullYear(), toDate.getMonth() - 6, 1)

  const [cashflowData, comparison] = await Promise.all([
    getCompanyCashflowDetailed({ from: fromDate, to: toDate }),
    getCashflowMonthComparison(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Cashflow consolidado
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ingresos, gastos y balance de toda la empresa. Desglose overhead vs proyectos.
        </p>
      </div>

      <CashflowComparisonCards data={comparison} />

      <CashflowSummaryStats summary={cashflowData.summary} />

      <CompanyCashflowChartClient
        initialData={cashflowData.timeline}
        breakdown={cashflowData.breakdown}
        range={{ from: fromDate, to: toDate }}
      />

      <CashflowBreakdownChart breakdown={cashflowData.breakdown} />
    </div>
  )
}
