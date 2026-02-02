/**
 * Role hierarchy: VIEWER < ACCOUNTANT < EDITOR < ADMIN < OWNER
 * Higher index = more permissions.
 */
const ROLE_ORDER = ['VIEWER', 'ACCOUNTANT', 'EDITOR', 'ADMIN', 'OWNER'] as const

export type OrgRole = (typeof ROLE_ORDER)[number]

export function hasMinimumRole(userRole: string, minRole: OrgRole): boolean {
  const userIndex = ROLE_ORDER.indexOf(userRole as OrgRole)
  const minIndex = ROLE_ORDER.indexOf(minRole)
  if (userIndex === -1) return false
  return userIndex >= minIndex
}

/**
 * Throws if user does not have at least the given role.
 * Use in server actions before mutations.
 */
export function requireRole(userRole: string, minRole: OrgRole): void {
  if (!hasMinimumRole(userRole, minRole)) {
    throw new Error('You do not have permission to perform this action.')
  }
}
