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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard del Proyecto
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {project.name} • {project.projectNumber}
        </p>
      </div>

      <ProjectDashboardClient project={projectForClient} data={dashboardData} />
    </div>
  )
}
