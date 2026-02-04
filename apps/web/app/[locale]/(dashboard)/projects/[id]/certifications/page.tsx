import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { CertList } from '@/components/certifications/cert-list'
import type { CertRow } from '@/components/certifications/cert-list'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function CertificationsPage({ params }: PageProps) {
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

  const certifications = await prisma.certification.findMany({
    where: { projectId, orgId: org.orgId },
    orderBy: { number: 'desc' },
    include: {
      issuedBy: { select: { user: { select: { fullName: true } } } },
      approvedBy: { select: { user: { select: { fullName: true } } } },
      lines: { select: { id: true, periodAmount: true } },
    },
  })

  const certsWithTotals: CertRow[] = certifications.map((cert) => ({
    id: cert.id,
    number: cert.number,
    periodMonth: cert.periodMonth,
    periodYear: cert.periodYear,
    status: cert.status,
    issuedDate: cert.issuedDate,
    issuedAt: cert.issuedAt,
    issuedBy: cert.issuedBy,
    approvedBy: cert.approvedBy,
    totalAmount: cert.lines.reduce((sum, line) => sum + Number(line.periodAmount), 0),
    lines: cert.lines.map((l) => ({ id: l.id, periodAmount: Number(l.periodAmount) })),
  }))

  const approvedTotal = certifications
    .filter((c) => c.status === 'APPROVED')
    .reduce(
      (sum, c) =>
        sum + c.lines.reduce((s, l) => s + Number(l.periodAmount), 0),
      0
    )

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
            Certifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {project.name} ({project.projectNumber})
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/certifications/new`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New Certification
        </Link>
      </div>

      <CertList
        certifications={certsWithTotals}
        projectId={projectId}
        approvedTotal={approvedTotal}
      />
    </div>
  )
}
