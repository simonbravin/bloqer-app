import { redirectToLogin } from '@/lib/i18n-redirect'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { DocumentList } from '@/components/documents/document-list'
import { DocumentUploadModal } from '@/components/documents/document-upload-modal'
import type { DocumentRow } from '@/components/documents/document-list'

export default async function DocumentsPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const documents = await prisma.document.findMany({
    where: { orgId: org.orgId, deleted: false, projectId: null },
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Organization Documents
        </h1>
        {canUpload && <DocumentUploadModal projectId={null} />}
      </div>

      <DocumentList documents={documents as DocumentRow[]} />
    </div>
  )
}
