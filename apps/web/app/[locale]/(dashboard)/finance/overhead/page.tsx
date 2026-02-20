import {
  getOverheadTransactions,
  getOverheadDashboard,
  getActiveProjects,
  getAllProjects,
} from '@/app/actions/finance'
import { OverheadDashboardCards } from '@/components/finance/overhead-dashboard-cards'
import { OverheadTransactionsListClient } from '@/components/finance/overhead-transactions-list-client'
export default async function OverheadPage() {
  const [transactions, dashboard, activeProjects, allProjects] = await Promise.all([
    getOverheadTransactions(),
    getOverheadDashboard(),
    getActiveProjects(),
    getAllProjects(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Asignación de gastos generales
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gastos generales sin proyecto. Asigná porcentajes a proyectos para distribuir el costo.
        </p>
      </div>

      <OverheadDashboardCards data={dashboard} />

      <OverheadTransactionsListClient
        initialTransactions={transactions}
        activeProjects={activeProjects}
        allProjects={allProjects}
      />
    </div>
  )
}
