import { z } from 'zod'

/** Acepta URL completa (https://...) o dominio (ej: bravingroup.com, www.bravingroup.com) */
export const websiteSchema = z
  .union([
    z.literal(''),
    z
      .string()
      .max(255)
      .refine(
        (val) => {
          const v = val.trim()
          if (!v) return true
          if (/^https?:\/\//i.test(v)) {
            try {
              new URL(v)
              return true
            } catch {
              return false
            }
          }
          // Dominio: sin espacios, al menos un punto (ej: bravingroup.com, www.ejemplo.com)
          return !/\s/.test(v) && v.includes('.') && v.length >= 4
        },
        { message: 'Ingrese una URL (https://...) o un dominio (ej: ejemplo.com)' }
      ),
  ])
  .optional()

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  taxId: z.string().max(50).optional(),
  country: z.string().max(2).optional(),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, 'Nombre de la organización es requerido').max(255),
  legalName: z.string().min(1, 'La razón social es requerida').max(255),
  taxId: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  website: websiteSchema,
  baseCurrency: z.string().length(3),
  defaultTaxPct: z.union([z.number().min(0).max(100), z.string()]),
  documentFooterText: z.string().max(1000).optional(),
})

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
