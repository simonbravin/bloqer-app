import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { RfiForm } from '@/components/quality/rfi-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewRfiPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id: projectId } = await params

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
  })
  if (!project) return redirectTo('/projects')

  const [wbsNodes, orgMembers] = await Promise.all([
    prisma.wbsNode.findMany({
      where: { projectId, active: true },
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' },
    }),
    prisma.orgMember.findMany({
      where: { orgId: org.orgId, active: true },
      select: {
        id: true,
        user: { select: { fullName: true } },
      },
    }),
  ])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/quality/rfis`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← RFIs
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        New RFI
      </h1>
      <RfiForm
        projectId={projectId}
        wbsNodes={wbsNodes}
        orgMembers={orgMembers}
      />
    </div>
  )
}
