import { z } from 'zod'

export const WBS_TYPE = ['PHASE', 'ACTIVITY', 'TASK'] as const
export type WbsType = (typeof WBS_TYPE)[number]

export const createWBSItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(WBS_TYPE),
  parentId: z.string().uuid().optional().nullable(),
  estimatedDuration: z.coerce.number().nonnegative().optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
})

export type CreateWBSItemInput = z.infer<typeof createWBSItemSchema>

export const updateWBSItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(WBS_TYPE).optional(),
  parentId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  estimatedDuration: z.coerce.number().nonnegative().optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
})

export type UpdateWBSItemInput = z.infer<typeof updateWBSItemSchema>

/** WBS code: numeric segments separated by dots (e.g. 1, 1.1, 1.1.1), no trailing dot. */
const wbsCodeSchema = z
  .string()
  .min(1, 'El código es requerido')
  .regex(/^\d+(\.\d+)*$/, 'El código debe ser como 1, 1.1 o 1.1.1 (solo números y puntos)')
  .refine((c) => !c.endsWith('.'), 'El código no debe terminar en punto')

export const wbsNodeSchema = z.object({
  code: wbsCodeSchema,
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['PHASE', 'TASK', 'SUBTASK', 'ITEM']),
  unit: z.string().min(1, 'La unidad es requerida'),
  quantity: z.string(),
  description: z.string().optional(),
})

export type WbsNodeInput = z.infer<typeof wbsNodeSchema>
