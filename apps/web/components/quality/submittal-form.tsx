'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const SUBMITTAL_TYPES = [
  'MATERIAL',
  'PRODUCT',
  'SHOP_DRAWING',
  'SAMPLES',
  'CUT_SHEETS',
  'OTHER',
] as const

const createSubmittalSchema = z.object({
  submittalType: z.string().min(1, 'Type is required'),
  specSection: z.string().max(50).optional().nullable(),
  wbsNodeId: z.string().uuid().optional().nullable(),
  submittedByPartyId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date(),
})
type CreateSubmittalInput = z.infer<typeof createSubmittalSchema>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSubmittal } from '@/app/actions/quality'

type WbsNode = { id: string; code: string; name: string }
type Party = { id: string; name: string }

type SubmittalFormProps = {
  projectId: string
  wbsNodes: WbsNode[]
  parties: Party[]
}

export function SubmittalForm({
  projectId,
  wbsNodes,
  parties,
}: SubmittalFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubmittalInput>({
    resolver: zodResolver(createSubmittalSchema),
  })

  async function onSubmit(data: CreateSubmittalInput) {
    try {
      const result = await createSubmittal(projectId, {
        ...data,
        wbsNodeId: data.wbsNodeId || null,
        submittedByPartyId: data.submittedByPartyId || null,
        specSection: data.specSection || null,
      })
      if ('submittalId' in result) {
        router.push(
          `/projects/${projectId}/quality/submittals/${result.submittalId}`
        )
        router.refresh()
      }
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create submittal',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="submittalType">Type</Label>
        <select
          id="submittalType"
          {...register('submittalType')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          {SUBMITTAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="specSection">Spec Section</Label>
        <Input
          id="specSection"
          {...register('specSection')}
          placeholder="e.g. 03 30 00"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          className="mt-1"
          required
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="wbsNodeId">WBS / Location</Label>
        <select
          id="wbsNodeId"
          {...register('wbsNodeId')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">— Select —</option>
          {wbsNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.code} — {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="submittedByPartyId">Submitted By (Party)</Label>
        <select
          id="submittedByPartyId"
          {...register('submittedByPartyId')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">— Select —</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create Submittal'}
        </Button>
        <Link href={`/projects/${projectId}/quality/submittals`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
