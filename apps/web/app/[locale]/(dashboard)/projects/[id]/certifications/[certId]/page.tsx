import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { getProject } from '@/app/actions/projects'
import { getCertification } from '@/app/actions/certifications'
import { CertDetail } from '@/components/certifications/cert-detail'
import type { CertLineRow } from '@/components/certifications/cert-line-table'

type PageProps = {
  params: Promise<{ id: string; certId: string }>
}

export default async function CertificationDetailPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id: projectId, certId } = await params

  const project = await getProject(projectId)
  if (!project) notFound()

  const cert = await getCertification(certId)
  if (!cert || cert.projectId !== projectId) notFound()

  const totalAmount = cert.lines.reduce((sum, l) => sum + Number(l.periodAmount), 0)

  const lines: CertLineRow[] = cert.lines.map((l) => ({
    id: l.id,
    wbsNode: l.wbsNode,
    budgetLine: l.budgetLine,
    prevProgressPct: Number(l.prevProgressPct),
    periodProgressPct: Number(l.periodProgressPct),
    totalProgressPct: Number(l.totalProgressPct),
    contractualQtySnapshot: Number(l.contractualQtySnapshot),
    unitPriceSnapshot: Number(l.unitPriceSnapshot),
    prevQty: Number(l.prevQty),
    periodQty: Number(l.periodQty),
    totalQty: Number(l.totalQty),
    remainingQty: Number(l.remainingQty),
    prevAmount: Number(l.prevAmount),
    periodAmount: Number(l.periodAmount),
    totalAmount: Number(l.totalAmount),
  }))

  const canIssue = hasMinimumRole(org.role, 'EDITOR')
  const canApprove = hasMinimumRole(org.role, 'ADMIN')
  const canEdit = hasMinimumRole(org.role, 'EDITOR')

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center gap-4">
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

      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Certification #{cert.number}
        </h1>
      </div>

      <CertDetail
        certId={certId}
        projectId={projectId}
        number={cert.number}
        periodMonth={cert.periodMonth}
        periodYear={cert.periodYear}
        status={cert.status}
        totalAmount={totalAmount}
        integritySeal={cert.integritySeal}
        issuedDate={cert.issuedDate}
        issuedBy={cert.issuedBy}
        approvedBy={cert.approvedBy}
        lines={lines}
        canIssue={canIssue}
        canApprove={canApprove}
        canEdit={canEdit}
      />
    </div>
  )
}
