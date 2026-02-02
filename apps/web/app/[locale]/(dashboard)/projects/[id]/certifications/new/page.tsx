import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { CertForm } from '@/components/certifications/cert-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function NewCertificationPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id: projectId } = await params

  if (!['EDITOR', 'ADMIN', 'OWNER'].includes(org.role)) {
    return redirectTo(`/projects/${projectId}`)
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
    select: {
      id: true,
      name: true,
      budgetVersions: {
        where: { versionType: { in: ['BASELINE', 'APPROVED', 'WORKING'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          versionCode: true,
          versionType: true,
        },
      },
    },
  })

  if (!project) return redirectTo('/projects')

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/projects/${projectId}/certifications`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Certifications
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {project.name}
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">New Certification</h1>
      <CertForm project={project} />
    </div>
  )
}
