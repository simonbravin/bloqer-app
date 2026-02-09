'use client'

import { Link } from '@/i18n/navigation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
  filters?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  filters,
}: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="erp-page-title">{title}</h1>
          {subtitle && (
            <p className="mt-1 erp-section-desc">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
      {filters && <div className="mt-4">{filters}</div>}
    </div>
  )
}
