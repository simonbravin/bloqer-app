'use client'

import { usePathname } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'nav.dashboard',
  projects: 'nav.projects',
  finance: 'nav.finance',
  transactions: 'finance.transactions',
  resources: 'nav.resources',
  settings: 'nav.settings',
  wbs: 'projects.wbs',
  budget: 'projects.budget',
  'change-orders': 'projects.changeOrders',
  certifications: 'projects.certifications',
  documents: 'nav.documents',
  inventory: 'nav.inventory',
  quality: 'nav.quality',
  reports: 'nav.reports',
  suppliers: 'nav.suppliers',
  new: 'common.create',
  edit: 'common.edit',
}

type BreadcrumbOverride = { segment: string; label: string }

export type BreadcrumbsProps = {
  /** Override labels for dynamic segments (e.g. { segment: '123', label: 'Proyecto Alpha' }) */
  overrides?: BreadcrumbOverride[]
  /** Additional class for container */
  className?: string
}

export function Breadcrumbs({ overrides = [], className }: BreadcrumbsProps) {
  const pathname = usePathname()
  const t = useTranslations()

  // Strip locale from pathname if present (e.g. /es/projects -> /projects)
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  const segments = path.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
        <Link
          href="/dashboard"
          className="font-medium text-accent transition-colors hover:text-accent/90"
        >
          {t('nav.dashboard')}
        </Link>
      </nav>
    )
  }

  const overrideMap = new Map(overrides.map((o) => [o.segment, o.label]))

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const isLast = i === segments.length - 1
    const override = overrideMap.get(seg)
    const labelKey = SEGMENT_LABELS[seg]
    const label = override ?? (labelKey ? t(labelKey) : seg)

    return { href, label, isLast }
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm', className)}
    >
      <Link
        href="/dashboard"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('nav.home')}
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          {crumb.isLast ? (
            <span
              className="font-medium text-foreground"
              aria-current="page"
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
