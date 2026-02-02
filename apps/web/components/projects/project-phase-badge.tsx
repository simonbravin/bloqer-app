'use client'

import { useTranslations } from 'next-intl'

interface ProjectPhaseBadgeProps {
  phase: string
}

/**
 * Badge component for project phase with HSL-based colors
 */
export function ProjectPhaseBadge({ phase }: ProjectPhaseBadgeProps) {
  const t = useTranslations('projects')

  // Colors using Tailwind classes (HSL-based in theme)
  const colors: Record<string, string> = {
    PRE_CONSTRUCTION: 'bg-violet-100 text-violet-700',
    CONSTRUCTION: 'bg-blue-100 text-blue-700',
    CLOSEOUT: 'bg-slate-100 text-slate-700',
    COMPLETE: 'bg-emerald-100 text-emerald-700',
  }

  const getLabel = (p: string): string => {
    const labels: Record<string, string> = {
      PRE_CONSTRUCTION: t('phases.PRE_CONSTRUCTION'),
      CONSTRUCTION: t('phases.CONSTRUCTION'),
      POST_CONSTRUCTION: t('phases.POST_CONSTRUCTION'),
      CLOSEOUT: t('phases.CLOSEOUT'),
      COMPLETE: t('phases.COMPLETE'),
    }
    return labels[p] || p
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
        colors[phase] || colors.PRE_CONSTRUCTION
      }`}
    >
      {getLabel(phase)}
    </span>
  )
}
