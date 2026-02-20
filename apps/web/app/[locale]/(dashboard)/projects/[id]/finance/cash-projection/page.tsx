import { notFound } from 'next/navigation'
import { getProject } from '@/app/actions/projects'
import { getProjectCashProjection } from '@/app/actions/finance'
import { CashProjectionClient } from '@/components/finance/cash-projection-client'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)
  return {
    title: project ? `Proyección de caja — ${project.name}` : 'Proyección de caja',
  }
}

export default async function ProjectCashProjectionPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, initialProjection] = await Promise.all([
    getProject(projectId),
    getProjectCashProjection(projectId, new Date()),
  ])

  if (!project) notFound()

  return (
    <div className="space-y-6">
      <CashProjectionClient
        initialProjection={initialProjection}
        projectId={projectId}
        title="Proyección de caja (proyecto)"
      />
    </div>
  )
}
