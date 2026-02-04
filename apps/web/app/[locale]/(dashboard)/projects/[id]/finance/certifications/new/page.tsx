import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { CertForm } from '@/components/certifications/cert-form'
import { Card, CardContent } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function FinanceNewCertificationPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id: projectId } = await params

  if (!['EDITOR', 'ADMIN', 'OWNER'].includes(org.role)) {
    return redirectTo(`/projects/${projectId}/finance`)
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

  const basePath = `/projects/${projectId}/finance/certifications`
  const cancelHref = basePath

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={cancelHref}
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
          <h1 className="text-2xl font-bold text-foreground">Nueva Certificación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Proyecto: {project.name} • Seleccioná presupuesto y partidas
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-6 pt-6">
              <CertForm
                project={project}
                successRedirectBasePath={basePath}
                cancelHref={cancelHref}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
