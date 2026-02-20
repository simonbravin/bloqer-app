import { getProjectTransactions, getProjectCashflowKPIs } from '@/app/actions/finance'
import { getProject } from '@/app/actions/projects'
import { ProjectTransactionsListClient } from '@/components/finance/project-transactions-list-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProjectTransactionsPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, transactions, kpis] = await Promise.all([
    getProject(projectId),
    getProjectTransactions(projectId),
    getProjectCashflowKPIs(projectId),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <ProjectTransactionsListClient
        projectId={projectId}
        initialTransactions={transactions ?? []}
        projectBalance={kpis.balance}
      />
    </div>
  )
}
