import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { SubmittalDetail } from '@/components/quality/submittal-detail'

type PageProps = {
  params: Promise<{ id: string; submittalId: string }>
}

export default async function SubmittalDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId, submittalId } = await params

  const submittal = await prisma.submittal.findFirst({
    where: {
      id: submittalId,
      projectId,
      orgId: org.orgId,
    },
    include: {
      submittedBy: { select: { name: true } },
      reviewedBy: {
        select: { user: { select: { fullName: true } } },
      },
      wbsNode: {
        select: { code: true, name: true },
      },
    },
  })

  if (!submittal) notFound()

  const canEdit = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/quality/submittals`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Submittals
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          href={`/projects/${projectId}/quality`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Quality
        </Link>
      </div>

      <SubmittalDetail
        submittal={{
          id: submittal.id,
          number: submittal.number,
          submittalType: submittal.submittalType,
          specSection: submittal.specSection,
          status: submittal.status,
          revisionNumber: submittal.revisionNumber,
          dueDate: submittal.dueDate,
          submittedDate: submittal.submittedDate,
          reviewedDate: submittal.reviewedDate,
          reviewComments: submittal.reviewComments,
          submittedBy: submittal.submittedBy,
          reviewedBy: submittal.reviewedBy,
          wbsNode: submittal.wbsNode,
        }}
        projectId={projectId}
        canEdit={canEdit}
      />
    </div>
  )
}
