import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/app/actions/projects'
import { getCertification } from '@/app/actions/certifications'
import { CertDetail } from '@/components/certifications/cert-detail'
import type { CertLineRow } from '@/components/certifications/cert-line-table'
import { hasMinimumRole } from '@/lib/rbac'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'

interface PageProps {
  params: Promise<{ id: string; certId: string; locale: string }>
}

export default async function FinanceCertificationDetailPage({ params }: PageProps) {
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
    wbsNode: l.wbsNode ? { code: l.wbsNode.code, name: l.wbsNode.name } : null,
    budgetLine: l.budgetLine ? { description: l.budgetLine.description } : null,
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
  const canDelete = org.role === 'ADMIN' || org.role === 'OWNER'

  return (
    <div className="space-y-6 p-6">
      <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/projects/${projectId}/finance/certifications`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Certificaciones
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link
          href={`/projects/${projectId}/finance`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Finanzas
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {project.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Certificación #{cert.number}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cert.project.name} • {cert.budgetVersion.versionCode}
        </p>
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
        canReject={canApprove}
        canEdit={canEdit}
        canDelete={canDelete}
      />
      </div>
    </div>
  )
}
