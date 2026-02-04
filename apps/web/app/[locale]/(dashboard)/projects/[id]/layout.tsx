import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getProject } from '@/app/actions/projects'
import { ProjectTabs } from '@/components/projects/project-tabs'

type ProjectLayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

/**
 * Project-specific layout
 * - Validates project access
 * - The sidebar switch is handled by DynamicSidebar (detects UUID in path)
 * - This layout ensures the project exists and user has access
 */
export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id } = await params

  // Validate project exists and belongs to org
  const project = await getProject(id)
  if (!project) return notFound()

  return (
    <>
      <ProjectTabs projectId={id} />
      {children}
    </>
  )
}
