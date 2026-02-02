import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

type PageProps = {
  params: Promise<{ id: string }>
}

/**
 * Redirects /projects/[id]/finance/certifications to /projects/[id]/certifications
 * Keeps route structure aligned with architecture doc while using existing certifications page
 */
export default async function FinanceCertificationsRedirect({ params }: PageProps) {
  const { id: projectId } = await params
  const locale = await getLocale()
  redirect({ href: `/projects/${projectId}/certifications`, locale })
}
