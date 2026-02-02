'use client'

import { useTranslations } from 'next-intl'

interface ProjectStatusBadgeProps {
  status: string
}

/**
 * Badge component for project status with HSL-based colors
 */
export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const t = useTranslations('projects')

  // Colors using Tailwind classes (HSL-based in theme)
  const colors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    ON_HOLD: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-sky-100 text-sky-700',
    COMPLETE: 'bg-sky-100 text-sky-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  const getLabel = (s: string): string => {
    const labels: Record<string, string> = {
      DRAFT: t('statuses.DRAFT'),
      ACTIVE: t('statuses.ACTIVE'),
      ON_HOLD: t('statuses.ON_HOLD'),
      COMPLETED: t('statuses.COMPLETED'),
      COMPLETE: t('statuses.COMPLETE'),
      CANCELLED: t('statuses.CANCELLED'),
    }
    return labels[s] || s
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status] || colors.DRAFT
      }`}
    >
      {getLabel(status)}
    </span>
  )
}
