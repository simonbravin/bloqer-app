import { getProject } from '@/app/actions/projects'
import {
  getProjectMembers,
  getOrgMembers,
} from '@/app/actions/team'
import { ProjectTeamClient } from '@/components/projects/project-team-client'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectTeamPage({ params }: PageProps) {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) redirect({ href: '/login', locale })

  const { id: projectId } = await params

  const [project, projectMembers, orgMembers] = await Promise.all([
    getProject(projectId),
    getProjectMembers(projectId),
    getOrgMembers(),
  ])

  if (!project) redirect({ href: '/projects', locale })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Equipo del Proyecto
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {project.name} • {project.projectNumber}
        </p>
      </div>

      <ProjectTeamClient
        projectId={projectId}
        initialProjectMembers={projectMembers}
        orgMembers={orgMembers}
      />
    </div>
  )
}
