'use client'

import { usePathname } from 'next/navigation'
import { GlobalSidebar } from './global-sidebar'
import { ProjectSidebar } from './project-sidebar'

// UUID v4 pattern to distinguish project IDs from route names
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface DynamicSidebarProps {
  orgName?: string
  orgLogoUrl?: string | null
}

/**
 * Detects current context and renders appropriate sidebar
 * - Global: For organization-wide navigation (dashboard, projects list, team, etc.)
 * - Project: For project-specific navigation (budget, certifications, etc.)
 * 
 * Project context is detected when:
 * - URL matches /projects/[uuid] or /projects/[uuid]/*
 * - The ID is a valid UUID (not 'new' or other route names)
 */
export function DynamicSidebar({ orgName = 'Bloqer', orgLogoUrl }: DynamicSidebarProps) {
  const pathname = usePathname()
  
  // Extract project ID from path
  // Format: /es/projects/[uuid] or /es/projects/[uuid]/...
  const projectMatch = pathname.match(/\/projects\/([^\/]+)/)
  const projectId = projectMatch?.[1]
  
  // We're in project context if:
  // 1. We have a projectId
  // 2. The projectId is a valid UUID (not 'new' or other route segments)
  const isProjectContext = projectId && UUID_REGEX.test(projectId)
  
  if (isProjectContext) {
    return <ProjectSidebar projectId={projectId} orgName={orgName} orgLogoUrl={orgLogoUrl} />
  }
  
  return <GlobalSidebar orgName={orgName} orgLogoUrl={orgLogoUrl} />
}
