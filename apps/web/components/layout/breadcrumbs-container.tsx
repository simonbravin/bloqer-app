'use client'

import { usePathname } from '@/i18n/navigation'
import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'

/**
 * Breadcrumbs container that only renders when not on dashboard
 * This prevents an empty border from showing on the dashboard page
 */
export function BreadcrumbsContainer() {
  const pathname = usePathname()
  
  // Remove locale from path
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
  const segments = pathWithoutLocale.split('/').filter(Boolean)
  
  // Don't render container on dashboard (no breadcrumbs needed)
  if (segments.length === 0 || segments[0] === 'dashboard') {
    return null
  }
  
  return (
    <div className="border-b border-border bg-background px-6 py-2.5">
      <DynamicBreadcrumbs />
    </div>
  )
}
