import { z } from 'zod'

export const RESOURCE_CATEGORY = [
  'MATERIAL',
  'LABOR',
  'EQUIPMENT',
  'SUBCONTRACT',
  'OTHER',
] as const
export type ResourceCategory = (typeof RESOURCE_CATEGORY)[number]

export const createResourceSchema = z.object({
  code: z
    .string()
    .max(50)
    .optional()
    .transform((v) => (v === '' || v == null || !v?.trim() ? undefined : v.trim())),
  name: z.string().min(1, 'Name is required').max(255),
  category: z.enum(RESOURCE_CATEGORY),
  description: z.string().max(2000).optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(50),
  unitCost: z.coerce.number().nonnegative('Unit cost must be non-negative'),
  supplierId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (!v || v === '' || v === 'undefined' ? null : v)),
})
export type CreateResourceInput = z.infer<typeof createResourceSchema>

export const updateResourceSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(255).optional(),
  category: z.enum(RESOURCE_CATEGORY).optional(),
  description: z.string().max(2000).optional().nullable(),
  unit: z.string().min(1).max(50).optional(),
  unitCost: z.coerce.number().nonnegative().optional(),
  supplierId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (!v || v === '' || v === 'undefined' ? null : v)),
})
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>
