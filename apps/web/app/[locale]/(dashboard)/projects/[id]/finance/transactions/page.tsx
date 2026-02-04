import { getProjectTransactions } from '@/app/actions/finance'
import { getProject } from '@/app/actions/projects'
import { ProjectTransactionsListClient } from '@/components/finance/project-transactions-list-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProjectTransactionsPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, transactions] = await Promise.all([
    getProject(projectId),
    getProjectTransactions(projectId),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Transacciones
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestiona los ingresos y gastos del proyecto {project.name}
        </p>
      </div>

      <ProjectTransactionsListClient
        projectId={projectId}
        initialTransactions={transactions}
      />
    </div>
  )
}
