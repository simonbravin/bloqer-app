import { z } from 'zod'

export const createSavedReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  entityType: z.string().min(1, 'Entity type is required'),
  filtersJson: z.record(z.unknown()),
  columnsJson: z.array(z.string()),
  sortJson: z
    .array(
      z.object({
        key: z.string(),
        direction: z.enum(['asc', 'desc']),
      })
    )
    .optional(),
  aggregationsJson: z
    .array(
      z.object({
        column: z.string(),
        fn: z.enum(['sum', 'avg', 'count', 'min', 'max']),
      })
    )
    .optional(),
  visibility: z.enum(['PRIVATE', 'SHARED']),
})

export type CreateSavedReportInput = z.infer<typeof createSavedReportSchema>

export const ENTITY_TYPES = [
  { value: 'PROJECT', label: 'Projects' },
  { value: 'FINANCE_TRANSACTION', label: 'Finance Transactions' },
  { value: 'BUDGET_LINE', label: 'Budget Lines' },
] as const
