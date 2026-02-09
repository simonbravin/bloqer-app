'use client'

import { SystemHealthWidget } from './system-health-widget'

/**
 * Renders the floating System Health Widget only when
 * NEXT_PUBLIC_SHOW_DEBUG_WIDGET is 'true'.
 * Add this in RootLayout so the widget is available app-wide for admins/devs.
 */
export function SystemHealthWidgetGate() {
  const show =
    typeof process.env.NEXT_PUBLIC_SHOW_DEBUG_WIDGET !== 'undefined' &&
    process.env.NEXT_PUBLIC_SHOW_DEBUG_WIDGET === 'true'

  if (!show) return null
  return <SystemHealthWidget />
}
