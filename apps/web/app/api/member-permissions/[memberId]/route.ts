import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@repo/database'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ memberId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { memberId } = await context.params

  const member = await prisma.orgMember.findUnique({
    where: { id: memberId },
    select: { id: true, userId: true, orgId: true, role: true, customPermissions: true },
  })

  if (!member) {
    return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 })
  }

  // Solo el propio usuario puede pedir sus permisos (para el hook usePermissions)
  if (member.userId !== session.user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  return NextResponse.json({
    customPermissions: member.customPermissions,
    role: member.role,
  })
}
