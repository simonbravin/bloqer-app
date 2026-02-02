import { z } from 'zod'

export const apuResourceSchema = z.object({
  resourceId: z.string().uuid(),
  resourceName: z.string().min(1),
  resourceCode: z.string().min(1),
  resourceUnit: z.string().min(1),
  resourceUnitCost: z.number().nonnegative(),
  quantityPerUnit: z.number().positive(),
})

export const computeAPUSchema = z.object({
  resources: z.array(apuResourceSchema),
  indirectCostPct: z.number().min(0).max(100).default(0),
})

export type APUResourceInput = z.infer<typeof apuResourceSchema>
export type ComputeAPUInput = z.infer<typeof computeAPUSchema>
