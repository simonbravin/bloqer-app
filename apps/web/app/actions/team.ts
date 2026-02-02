'use server'

import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@repo/database'
import { revalidatePath } from 'next/cache'
import type { InviteTeamMemberInput } from '@repo/validators'

export async function inviteTeamMember(data: InviteTeamMemberInput) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }

  try {
    requireRole(orgContext.role, 'OWNER')
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  const orgId = orgContext.orgId

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })

    if (existingUser) {
      const existingMember = await prisma.orgMember.findUnique({
        where: {
          orgId_userId: { orgId, userId: existingUser.id },
        },
      })

      if (existingMember) {
        return { success: false, error: 'Este usuario ya es miembro de la organización' }
      }

      await prisma.orgMember.create({
        data: {
          orgId,
          userId: existingUser.id,
          role: data.role,
          active: true,
        },
      })

      // TODO: Enviar email de notificación

      revalidatePath('/settings/team')
      return { success: true }
    }

    // Usuario no existe - requiere registro previo (sin modelo OrgInvitation)
    return {
      success: false,
      error: 'Usuario no encontrado. Debe registrarse primero en la plataforma.',
    }
  } catch (error) {
    console.error('Error inviting member:', error)
    return { success: false, error: 'Error al enviar la invitación' }
  }
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }

  try {
    requireRole(orgContext.role, 'OWNER')
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, orgId: orgContext.orgId },
    })

    if (!member) {
      return { success: false, error: 'Miembro no encontrado' }
    }

    if (member.role === 'OWNER') {
      return { success: false, error: 'No se puede cambiar el rol del propietario' }
    }

    if (!['ADMIN', 'EDITOR', 'ACCOUNTANT', 'VIEWER'].includes(newRole)) {
      return { success: false, error: 'Rol inválido' }
    }

    await prisma.orgMember.update({
      where: { id: memberId },
      data: { role: newRole as any },
    })

    revalidatePath('/settings/team')
    return { success: true }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Error al actualizar el rol' }
  }
}

export async function deactivateMember(memberId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }

  try {
    requireRole(orgContext.role, 'OWNER')
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, orgId: orgContext.orgId },
    })

    if (!member) {
      return { success: false, error: 'Miembro no encontrado' }
    }

    if (member.role === 'OWNER') {
      return { success: false, error: 'No se puede desactivar al propietario' }
    }

    await prisma.orgMember.update({
      where: { id: memberId },
      data: { active: false },
    })

    revalidatePath('/settings/team')
    return { success: true }
  } catch (error) {
    console.error('Error deactivating member:', error)
    return { success: false, error: 'Error al desactivar el miembro' }
  }
}

export async function activateMember(memberId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }

  try {
    requireRole(orgContext.role, 'OWNER')
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const member = await prisma.orgMember.findFirst({
      where: { id: memberId, orgId: orgContext.orgId },
    })

    if (!member) {
      return { success: false, error: 'Miembro no encontrado' }
    }

    await prisma.orgMember.update({
      where: { id: memberId },
      data: { active: true },
    })

    revalidatePath('/settings/team')
    return { success: true }
  } catch (error) {
    console.error('Error activating member:', error)
    return { success: false, error: 'Error al activar el miembro' }
  }
}

export async function resendInvitation(memberId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }

  try {
    requireRole(orgContext.role, 'OWNER')
  } catch {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // TODO: Recuperar email del miembro pendiente (requiere modelo OrgInvitation)
    // TODO: Reenviar email con link de registro

    revalidatePath('/settings/team')
    return { success: true }
  } catch (error) {
    console.error('Error resending invitation:', error)
    return { success: false, error: 'Error al reenviar la invitación' }
  }
}
