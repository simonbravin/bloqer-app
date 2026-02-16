import { z } from 'zod'

export const linkGlobalSupplierSchema = z.object({
  localAlias: z.string().max(100).optional().nullable(),
  localContactName: z.string().max(100).optional().nullable(),
  localContactEmail: z.string().email().max(255).optional().nullable().or(z.literal('')),
  localContactPhone: z.string().max(50).optional().nullable(),
  preferred: z.boolean().optional(),
  paymentTerms: z.string().max(100).optional().nullable(),
  discountPct: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateSupplierLinkSchema = z.object({
  localAlias: z.string().max(100).optional().nullable(),
  localContactName: z.string().max(100).optional().nullable(),
  localContactEmail: z.string().email().max(255).optional().nullable().or(z.literal('')),
  localContactPhone: z.string().max(50).optional().nullable(),
  preferred: z.boolean().optional(),
  paymentTerms: z.string().max(100).optional().nullable(),
  discountPct: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const createLocalSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  taxId: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  website: z
    .union([
      z.literal(''),
      z.string().max(255).refine(
        (val) => {
          const v = (val ?? '').trim()
          if (!v) return true
          if (/^https?:\/\//i.test(v)) {
            try {
              new URL(v)
              return true
            } catch {
              return false
            }
          }
          return /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z0-9.-]+$/i.test(v)
        },
        { message: 'Ingrese una URL o un dominio (ej: ejemplo.com)' }
      ),
    ])
    .optional()
    .nullable(),
})

export type LinkGlobalSupplierInput = z.infer<typeof linkGlobalSupplierSchema>
export type UpdateSupplierLinkInput = z.infer<typeof updateSupplierLinkSchema>
export type CreateLocalSupplierInput = z.infer<typeof createLocalSupplierSchema>
