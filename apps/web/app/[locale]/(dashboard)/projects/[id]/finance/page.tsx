import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '@/app/actions/projects'
import {
  getProjectFinanceExecutiveDashboard,
  getProjectFinanceAlerts,
  getOverheadAllocatedToProject,
} from '@/app/actions/finance'
import { ProjectFinanceDashboardClient } from '@/components/finance/project-finance-dashboard-client'
import { formatCurrency } from '@/lib/format-utils'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectFinancePage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, dashboardData, alerts, overheadAllocated] = await Promise.all([
    getProject(projectId),
    getProjectFinanceExecutiveDashboard(projectId),
    getProjectFinanceAlerts(projectId),
    getOverheadAllocatedToProject(projectId),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <ProjectFinanceDashboardClient data={dashboardData} alerts={alerts} />

      {overheadAllocated > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">
            Gastos generales asignados a este proyecto
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(overheadAllocated, 'ARS')}
          </p>
          <Link
            href="/finance/overhead"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            Ver asignación de gastos generales →
          </Link>
        </div>
      )}
    </div>
  )
}
