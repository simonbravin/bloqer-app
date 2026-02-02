import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { SubmittalList } from '@/components/quality/submittal-list'
import type { SubmittalRow } from '@/components/quality/submittal-list'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

export default async function SubmittalsPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id: projectId } = await params
  const { status: statusFilter } = await searchParams

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
  })
  if (!project) return redirectTo('/projects')

  const submittals = await prisma.submittal.findMany({
    where: {
      projectId,
      orgId: org.orgId,
      ...(statusFilter && { status: statusFilter }),
    },
    orderBy: { number: 'desc' },
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/quality`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Quality
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Submittals
        </h1>
        <Link
          href={`/projects/${projectId}/quality/submittals/new`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Submittal
        </Link>
      </div>

      <SubmittalList submittals={submittals as SubmittalRow[]} projectId={projectId} />
    </div>
  )
}
