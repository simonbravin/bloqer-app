import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { DocumentList } from '@/components/documents/document-list'
import { DocumentUploadModal } from '@/components/documents/document-upload-modal'
import type { DocumentRow } from '@/components/documents/document-list'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectDocumentsPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id: projectId } = await params

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: { id: true, name: true, projectNumber: true },
  })

  if (!project) return redirectTo('/projects')

  const documents = await prisma.document.findMany({
    where: { orgId: org.orgId, deleted: false, projectId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { user: { select: { fullName: true } } } },
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
        select: { versionNumber: true, fileName: true, sizeBytes: true },
      },
    },
  })

  const canUpload = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← {project.name}
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Project Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {project.name} ({project.projectNumber})
          </p>
        </div>
        {canUpload && <DocumentUploadModal projectId={projectId} />}
      </div>

      <DocumentList documents={documents as DocumentRow[]} />
    </div>
  )
}
