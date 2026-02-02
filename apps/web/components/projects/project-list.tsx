'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Project = {
  id: string
  projectNumber: string
  name: string
  clientName: string | null
  phase: string
  status: string
  startDate: Date | null
  createdAt: Date
}

type ProjectListProps = {
  projects: Project[]
  canCreate: boolean
}

const STATUS_VARIANT: Record<string, 'success' | 'neutral' | 'warning' | 'info' | 'danger'> = {
  ACTIVE: 'success',
  DRAFT: 'neutral',
  ON_HOLD: 'warning',
  COMPLETE: 'info',
  COMPLETED: 'info',
  CANCELLED: 'danger',
}

export function ProjectList({ projects, canCreate }: ProjectListProps) {
  const t = useTranslations('projects')

  if (projects.length === 0) {
    return (
      <div className="erp-card mt-6 p-8 text-center">
        <p className="text-muted-foreground">
          {t('noProjectsYet')}
          {canCreate && (
            <>
              {' '}
              <Link
                href="/projects/new"
                className="font-medium text-foreground underline hover:no-underline"
              >
                {t('createFirstProject')}
              </Link>
            </>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const statusVariant = STATUS_VARIANT[project.status] ?? 'neutral'
        return (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full p-6 transition-colors hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.projectNumber}
                  </p>
                </div>
                <Badge variant={statusVariant} className="shrink-0 ml-2">
                  {t(`statuses.${project.status}`)}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('client')}:</span>
                  <span className="text-foreground truncate ml-2">
                    {project.clientName ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('phase')}:</span>
                  <span className="text-foreground">
                    {project.phase.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
