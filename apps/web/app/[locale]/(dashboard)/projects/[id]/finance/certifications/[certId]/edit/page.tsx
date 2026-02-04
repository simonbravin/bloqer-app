import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/app/actions/projects'
import { getCertification } from '@/app/actions/certifications'
import { CertEditForm } from '@/components/certifications/cert-edit-form'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'

interface PageProps {
  params: Promise<{ id: string; certId: string; locale: string }>
}

export default async function FinanceCertificationEditPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()

  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  if (!hasMinimumRole(org.role, 'EDITOR')) return notFound()

  const { id: projectId, certId } = await params

  const project = await getProject(projectId)
  if (!project) notFound()

  const cert = await getCertification(certId)
  if (!cert || cert.projectId !== projectId || cert.status !== 'DRAFT') notFound()

  const defaultValues = {
    notes: cert.notes ?? '',
    periodMonth: cert.periodMonth,
    periodYear: cert.periodYear,
    issuedDate: cert.issuedDate ? new Date(cert.issuedDate).toISOString().slice(0, 10) : '',
  }

  const basePath = `/projects/${projectId}/finance/certifications`
  const backHref = `${basePath}/${certId}`

  return (
    <div className="space-y-6 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-4">
          <Link href={backHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Certificación #{cert.number}
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href={basePath} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Certificaciones
          </Link>
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground">Editar certificación #{cert.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.name} • Solo se pueden editar certificaciones en borrador
          </p>
        </div>

        <CertEditForm
          certId={certId}
          projectId={projectId}
          defaultValues={defaultValues}
          backHref={backHref}
        />
      </div>
    </div>
  )
}
