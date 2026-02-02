import { z } from 'zod'

export const CHANGE_ORDER_STATUS = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED',
] as const
export type ChangeOrderStatus = (typeof CHANGE_ORDER_STATUS)[number]

export const CHANGE_ORDER_LINE_TYPE = ['ADD', 'MODIFY', 'DELETE'] as const
export type ChangeOrderLineType = (typeof CHANGE_ORDER_LINE_TYPE)[number]

export const createChangeOrderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  reason: z.string().min(1, 'Reason is required').max(2000),
  justification: z.string().max(2000).optional().nullable(),
  changeType: z.string().max(50).default('SCOPE'),
})
export type CreateChangeOrderInput = z.infer<typeof createChangeOrderSchema>

export const updateChangeOrderSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  reason: z.string().min(1).max(2000).optional(),
  justification: z.string().max(2000).optional().nullable(),
})
export type UpdateChangeOrderInput = z.infer<typeof updateChangeOrderSchema>

export const createChangeOrderLineSchema = z.object({
  wbsNodeId: z.string().uuid(),
  changeType: z.enum(CHANGE_ORDER_LINE_TYPE).default('ADD'),
  justification: z.string().min(1, 'Justification is required').max(500),
  deltaCost: z.coerce.number(),
  newQty: z.coerce.number().nonnegative().optional().nullable(),
  newUnitCost: z.coerce.number().nonnegative().optional().nullable(),
})
export type CreateChangeOrderLineInput = z.infer<typeof createChangeOrderLineSchema>

export const updateChangeOrderLineSchema = z.object({
  justification: z.string().min(1).max(500).optional(),
  deltaCost: z.coerce.number().optional(),
  newQty: z.coerce.number().nonnegative().optional().nullable(),
  newUnitCost: z.coerce.number().nonnegative().optional().nullable(),
})
export type UpdateChangeOrderLineInput = z.infer<typeof updateChangeOrderLineSchema>
