import { z } from 'zod'

export const orgRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'EDITOR',
  'ACCOUNTANT',
  'VIEWER',
])

export type OrgRole = z.infer<typeof orgRoleSchema>

export const inviteOrgMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: orgRoleSchema,
})

export type InviteOrgMemberInput = z.infer<typeof inviteOrgMemberSchema>

export const updateOrgMemberRoleSchema = z.object({
  role: orgRoleSchema,
  active: z.boolean().optional(),
})

export type UpdateOrgMemberRoleInput = z.infer<typeof updateOrgMemberRoleSchema>
