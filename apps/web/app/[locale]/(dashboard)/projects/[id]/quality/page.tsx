import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { QualityDashboard } from '@/components/quality/quality-dashboard'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function QualityPage({ params }: PageProps) {
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

  const [rfiCount, submittalCount, openRfis, pendingSubmittals] = await Promise.all([
    prisma.rFI.count({ where: { projectId, orgId: org.orgId } }),
    prisma.submittal.count({ where: { projectId, orgId: org.orgId } }),
    prisma.rFI.count({
      where: { projectId, orgId: org.orgId, status: 'OPEN' },
    }),
    prisma.submittal.count({
      where: {
        projectId,
        orgId: org.orgId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
    }),
  ])

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Quality Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {project.name} ({project.projectNumber})
        </p>
      </div>

      <QualityDashboard
        projectId={projectId}
        stats={{
          totalRfis: rfiCount,
          totalSubmittals: submittalCount,
          openRfis,
          pendingSubmittals,
        }}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          href={`/projects/${projectId}/quality/rfis`}
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">RFIs</h3>
          <p className="text-sm text-gray-500">
            {openRfis} open, {rfiCount} total
          </p>
        </Link>
        <Link
          href={`/projects/${projectId}/quality/submittals`}
          className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700"
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Submittals</h3>
          <p className="text-sm text-gray-500">
            {pendingSubmittals} pending, {submittalCount} total
          </p>
        </Link>
      </div>
    </div>
  )
}
