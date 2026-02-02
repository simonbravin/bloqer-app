import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { RfiDetail } from '@/components/quality/rfi-detail'
import { RfiCommentForm } from '@/components/quality/rfi-comment-form'

type PageProps = {
  params: Promise<{ id: string; rfiId: string }>
}

export default async function RfiDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId, rfiId } = await params

  const rfi = await prisma.rFI.findFirst({
    where: {
      id: rfiId,
      projectId,
      orgId: org.orgId,
    },
    include: {
      raisedBy: {
        select: { user: { select: { fullName: true, email: true } } },
      },
      assignedTo: {
        select: { user: { select: { fullName: true, email: true } } },
      },
      wbsNode: {
        select: { code: true, name: true },
      },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: { user: { select: { fullName: true } } },
          },
        },
      },
    },
  })

  if (!rfi) notFound()

  const canAnswer = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/quality/rfis`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← RFIs
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          href={`/projects/${projectId}/quality`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Quality
        </Link>
      </div>

      <RfiDetail
        rfi={{
          id: rfi.id,
          number: rfi.number,
          subject: rfi.subject,
          question: rfi.question,
          answer: rfi.answer,
          status: rfi.status,
          priority: rfi.priority,
          dueDate: rfi.dueDate,
          answeredDate: rfi.answeredDate,
          closedDate: rfi.closedDate,
          raisedBy: rfi.raisedBy,
          assignedTo: rfi.assignedTo,
          wbsNode: rfi.wbsNode,
        }}
        projectId={projectId}
        canAnswer={canAnswer}
      />

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Discussion
        </h3>
        <RfiCommentForm rfiId={rfiId} projectId={projectId} />

        <div className="mt-4 space-y-4">
          {rfi.comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.author.user.fullName}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {comment.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
