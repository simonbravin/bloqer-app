import { z } from 'zod'

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
  website: z.union([z.string().url(), z.literal('')]).optional(),
  baseCurrency: z.string().length(3),
  defaultTaxPct: z.union([z.number().min(0).max(100), z.string()]),
  documentFooterText: z.string().max(1000).optional(),
})

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
