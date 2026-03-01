import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getProject } from '@/app/actions/projects'
import { canEditProjectArea, PROJECT_AREAS } from '@/lib/project-permissions'
import { getProjectMemberRole } from '@/lib/project-context'
import { NewScheduleForm } from '@/components/schedule/new-schedule-form'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewSchedulePage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) notFound()

  const { id: projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const projectRole = await getProjectMemberRole(projectId, org.memberId)
  const canEdit =
    ['EDITOR', 'ADMIN', 'OWNER'].includes(org.role) ||
    canEditProjectArea(projectRole, PROJECT_AREAS.SCHEDULE)
  if (!canEdit) notFound()

  const initialStartDate =
    project.startDate instanceof Date
      ? project.startDate.toISOString().slice(0, 10)
      : project.startDate
        ? new Date(project.startDate).toISOString().slice(0, 10)
        : null
  const plannedEndDate =
    project.plannedEndDate instanceof Date
      ? project.plannedEndDate.toISOString().slice(0, 10)
      : project.plannedEndDate
        ? new Date(project.plannedEndDate).toISOString().slice(0, 10)
        : null

  const t = await getTranslations('schedule')
  return (
    <div className="erp-view-container space-y-6 bg-background">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="erp-section-header">
          <h1 className="erp-page-title">{t('createNewSchedule')}</h1>
          <p className="erp-section-desc">{project.name}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}/schedule`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToSchedule')}
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm md:p-6 min-w-0">
        <NewScheduleForm
          projectId={projectId}
          initialStartDate={initialStartDate}
          plannedEndDate={plannedEndDate}
        />
      </div>
    </div>
  )
}
