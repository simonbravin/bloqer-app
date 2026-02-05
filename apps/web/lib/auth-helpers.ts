import { auth } from '@/lib/auth'
import {
  hasPermission,
  canAccess,
  MODULES,
  type Module,
  type Permission,
  type CustomPermissionsMap,
} from '@/lib/permissions'
import type { OrgRole } from '@/types/next-auth'
import { prisma } from '@repo/database'

type ModuleKey = keyof typeof MODULES

async function getMemberWithPermissions(orgId: string, userId: string) {
  const member = await prisma.orgMember.findUnique({
    where: {
      orgId_userId: { orgId, userId },
    },
    select: { role: true, customPermissions: true },
  })
  return member
}

export async function requirePermission(
  moduleKey: ModuleKey,
  permission: Permission
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  const orgId = session.user.orgId
  if (!orgId) {
    throw new Error('No tienes una organización asignada')
  }

  const member = await getMemberWithPermissions(orgId, session.user.id)
  if (!member) {
    throw new Error('Miembro no encontrado')
  }

  const module = MODULES[moduleKey] as Module
  const customPerms = (member.customPermissions as CustomPermissionsMap) ?? null
  if (!hasPermission(member.role as OrgRole, module, permission, customPerms)) {
    throw new Error(`No tienes permiso para ${permission} en este módulo`)
  }

  return session
}

export async function requireAccess(moduleKey: ModuleKey) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('No autorizado')
  }

  const orgId = session.user.orgId
  if (!orgId) {
    throw new Error('No tienes una organización asignada')
  }

  const member = await getMemberWithPermissions(orgId, session.user.id)
  if (!member) {
    throw new Error('Miembro no encontrado')
  }

  const module = MODULES[moduleKey] as Module
  const customPerms = (member.customPermissions as CustomPermissionsMap) ?? null
  if (!canAccess(member.role as OrgRole, module, customPerms)) {
    throw new Error('No tienes acceso a este módulo')
  }

  return session
}
