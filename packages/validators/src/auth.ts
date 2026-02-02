import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>

/** Form schema: accepts "Usuario o Email" (username or email); server resolves to email */
export const loginFormSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Usuario o email es requerido')
    .max(255, 'Máximo 255 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginFormInput = z.infer<typeof loginFormSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Formato de email inválido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(50, 'Máximo 50 caracteres')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, _ . -'),
    fullName: z.string().min(1, 'Nombre completo es requerido').max(255),
    email: z.string().min(1, 'Email es requerido').email('Formato de email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    passwordConfirm: z.string().min(1, 'Confirmá tu contraseña'),
    country: z.string().min(1, 'País es requerido').max(100),
    city: z.string().min(1, 'Ciudad es requerida').max(100),
    phone: z.string().max(50).optional().or(z.literal('')),
    orgName: z.string().min(1, 'Nombre de la organización es requerido').max(255),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
