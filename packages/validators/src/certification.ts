import { z } from 'zod'

export const createCertificationSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2020).max(2100),
  budgetVersionId: z.string().uuid(),
  notes: z.string().optional(),
})

export const addCertLineSchema = z.object({
  wbsNodeId: z.string().uuid(),
  budgetLineId: z.string().uuid(),
  periodProgressPct: z.number().min(0).max(100),
})

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>
export type AddCertLineInput = z.infer<typeof addCertLineSchema>
