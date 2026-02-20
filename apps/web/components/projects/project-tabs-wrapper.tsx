'use client'

import { usePathname } from '@/i18n/navigation'
import { ProjectTabs } from './project-tabs'

interface ProjectTabsWrapperProps {
  projectId: string
}

/**
 * Renders ProjectTabs (Resumen, Presupuesto, Cronograma, Finanzas) only when
 * we're NOT inside project finance. Inside finance we only show ProjectFinanceTabs
 * (Dashboard, Transacciones, etc.) from the finance layout.
 */
export function ProjectTabsWrapper({ projectId }: ProjectTabsWrapperProps) {
  const pathname = usePathname() ?? ''
  const isFinanceSection = pathname.includes('/finance')

  if (isFinanceSection) return null
  return <ProjectTabs projectId={projectId} />
}
