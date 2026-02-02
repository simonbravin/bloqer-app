import { z } from 'zod'

export const TRANSACTION_TYPE = [
  'INVOICE_RECEIVED',
  'PAYMENT_MADE',
  'EXPENSE',
  'ADVANCE_PAYMENT',
  'REFUND',
] as const
export type TransactionType = (typeof TRANSACTION_TYPE)[number]

export const TRANSACTION_STATUS = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PAID',
  'VOIDED',
] as const
export type TransactionStatus = (typeof TRANSACTION_STATUS)[number]

const TYPE_PREFIX: Record<TransactionType, string> = {
  INVOICE_RECEIVED: 'INV',
  PAYMENT_MADE: 'PAY',
  EXPENSE: 'EXP',
  ADVANCE_PAYMENT: 'ADV',
  REFUND: 'REF',
}
export function getTransactionTypePrefix(type: TransactionType): string {
  return TYPE_PREFIX[type] ?? 'TXN'
}

export const createFinanceTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPE),
  description: z.string().min(1, 'Description is required').max(2000),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  partyId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters').default('USD'),
  exchangeRateSnapshot: z.coerce.number().positive('Exchange rate must be positive').default(1),
  reference: z.string().max(200).optional().nullable(),
})
export type CreateFinanceTransactionInput = z.infer<typeof createFinanceTransactionSchema>

export const updateFinanceTransactionSchema = z.object({
  description: z.string().min(1).max(2000).optional(),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  partyId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  currencyCode: z.string().length(3).optional(),
  exchangeRateSnapshot: z.coerce.number().positive().optional(),
  reference: z.string().max(200).optional().nullable(),
})
export type UpdateFinanceTransactionInput = z.infer<typeof updateFinanceTransactionSchema>

export const createFinanceLineSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.coerce.number(),
  wbsNodeId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  unit: z.string().max(50).optional().nullable(),
  quantity: z.coerce.number().nonnegative().optional(),
})
export type CreateFinanceLineInput = z.infer<typeof createFinanceLineSchema>

export const updateFinanceLineSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  amount: z.coerce.number().optional(),
  wbsNodeId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  unit: z.string().max(50).optional().nullable(),
  quantity: z.coerce.number().nonnegative().optional(),
})
export type UpdateFinanceLineInput = z.infer<typeof updateFinanceLineSchema>
