import {
  getOverheadTransactions,
  getOverheadDashboard,
  getActiveProjects,
} from '@/app/actions/finance'
import { OverheadDashboardCards } from '@/components/finance/overhead-dashboard-cards'
import { OverheadTransactionsListClient } from '@/components/finance/overhead-transactions-list-client'
export default async function OverheadPage() {
  const [transactions, dashboard, projects] = await Promise.all([
    getOverheadTransactions(),
    getOverheadDashboard(),
    getActiveProjects(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Asignación de Overhead
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gastos generales sin proyecto. Asigná porcentajes a proyectos para distribuir el costo.
        </p>
      </div>

      <OverheadDashboardCards data={dashboard} />

      <OverheadTransactionsListClient
        initialTransactions={transactions}
        projects={projects}
      />
    </div>
  )
}
