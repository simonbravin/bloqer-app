import { z } from 'zod'

export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['VIEWER', 'ACCOUNTANT', 'EDITOR', 'ADMIN']),
})

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>
