import { z } from 'zod'

export const updateUserProfileSchema = z.object({
  fullName: z.string().min(1, 'Nombre completo es requerido').max(255),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres').max(50).optional().or(z.literal('')),
})

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
