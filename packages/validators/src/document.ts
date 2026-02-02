import { z } from 'zod'

export const DOC_TYPE = [
  'CONTRACT',
  'DRAWING',
  'SPEC',
  'PHOTO',
  'REPORT',
  'INVOICE',
  'CERTIFICATE',
  'OTHER',
] as const

export const createDocumentSchema = z.object({
  title: z.string().min(1),
  docType: z.enum(DOC_TYPE),
  category: z.string().optional(),
  description: z.string().optional(),
  projectId: z.string().uuid().optional().nullable(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
