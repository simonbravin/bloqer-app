import { getMemberPermissions } from '@/app/actions/team'
import { MemberPermissionsClient } from '@/components/team/member-permissions-client'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ memberId: string }>
}

export default async function MemberPermissionsPage({ params }: PageProps) {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) redirect({ href: '/login', locale })

  const { memberId } = await params

  let member
  try {
    member = await getMemberPermissions(memberId)
  } catch {
    redirect({ href: '/team', locale })
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Permisos de {member.user.fullName}</CardTitle>
          <CardDescription>{member.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <MemberPermissionsClient member={member} />
        </CardContent>
      </Card>
    </div>
  )
}
