import { getFinanceExecutiveDashboard } from '@/app/actions/finance'
import { FinanceExecutiveDashboardClient } from '@/components/finance/finance-executive-dashboard-client'

export default async function FinanceDashboardPage() {
  const dashboardData = await getFinanceExecutiveDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Dashboard Financiero
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Vista ejecutiva de la salud financiera de la empresa
        </p>
      </div>

      <FinanceExecutiveDashboardClient data={dashboardData} />
    </div>
  )
}
