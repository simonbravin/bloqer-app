import { prisma } from '@repo/database'

export type OrgContext = {
  orgId: string
  orgName: string
  role: string
  memberId: string
}

export async function getOrgContext(userId: string): Promise<OrgContext | null> {
  const member = await prisma.orgMember.findFirst({
    where: { userId, active: true },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!member) return null
  return {
    orgId: member.orgId,
    orgName: member.organization.name,
    role: member.role,
    memberId: member.id,
  }
}
