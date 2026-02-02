import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  clientName: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  m2: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().positive().optional().nullable()
  ),
  startDate: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.date().optional().nullable()
  ),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  clientName: z.string().max(255).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  m2: z.coerce.number().positive().optional().nullable(),
  status: z.string().max(50).optional(),
  startDate: z.coerce.date().optional().nullable(),
  plannedEndDate: z.coerce.date().optional().nullable(),
  active: z.boolean().optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
