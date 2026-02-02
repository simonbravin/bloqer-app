'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ProjectStatusBadge } from './project-status-badge'
import { ProjectPhaseBadge } from './project-phase-badge'
import { formatCurrency } from '@/lib/format-utils'
import { Calendar, MapPin, User } from 'lucide-react'

interface Project {
  id: string
  projectNumber: string
  name: string
  clientName: string | null
  phase: string
  status: string
  totalBudget?: number | { toNumber(): number } | null
  location?: string | null
  startDate?: Date | null
}

interface ProjectCardProps {
  project: Project
}

/**
 * Project card for grid view display
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects')

  const budget = project.totalBudget
    ? typeof project.totalBudget === 'number'
      ? project.totalBudget
      : project.totalBudget.toNumber()
    : 0

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-slate-500">
            {project.projectNumber}
          </span>
          <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
            {project.name}
          </h3>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        {project.clientName && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{project.clientName}</span>
          </div>
        )}

        {project.location && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}

        {project.startDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {new Date(project.startDate).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <ProjectPhaseBadge phase={project.phase} />
        <div className="text-right">
          <p className="text-xs text-slate-500">{t('budget')}</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCurrency(budget)}
          </p>
        </div>
      </div>
    </Link>
  )
}
