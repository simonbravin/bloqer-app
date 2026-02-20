import { notFound } from 'next/navigation'
import { getProject } from '@/app/actions/projects'
import { getProjectDashboardData } from '@/app/actions/project-dashboard'
import { ProjectDashboardClient } from '@/components/projects/project-dashboard-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDashboardPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, dashboardData] = await Promise.all([
    getProject(projectId),
    getProjectDashboardData(projectId),
  ])

  if (!project) notFound()

  // Serialize project for client: only plain objects (no Decimal, Date, etc.)
  const projectForClient = {
    id: project.id,
    name: project.name,
    projectNumber: project.projectNumber,
  }

  return (
    <div className="erp-stack">
      <ProjectDashboardClient project={projectForClient} data={dashboardData} />
    </div>
  )
}
