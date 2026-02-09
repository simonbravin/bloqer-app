'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createChangeOrderSchema,
  updateChangeOrderSchema,
  type CreateChangeOrderInput,
  type UpdateChangeOrderInput,
} from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type COFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<UpdateChangeOrderInput>
  /** For create mode: submit handler with form data (CreateChangeOrderInput only) */
  onSubmit?: (data: CreateChangeOrderInput) => Promise<{ error?: Record<string, string[]> } | { success: boolean }>
  /** For edit mode: server action (coId, data) - use from app/actions/change-orders */
  editAction?: (coId: string, data: UpdateChangeOrderInput) => Promise<{ error?: Record<string, string[]> } | { success: boolean }>
  coId?: string
  onCancelHref: string
}

export function COForm({
  mode,
  defaultValues,
  onSubmit,
  editAction,
  coId,
  onCancelHref,
}: COFormProps) {
  const isCreate = mode === 'create'
  const schema = isCreate ? createChangeOrderSchema : updateChangeOrderSchema
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateChangeOrderInput | UpdateChangeOrderInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: '',
      reason: '',
      justification: '',
      changeType: 'SCOPE',
    },
  })

  async function handleFormSubmit(data: CreateChangeOrderInput | UpdateChangeOrderInput) {
    const result = isCreate && onSubmit
      ? await onSubmit(data as CreateChangeOrderInput)
      : !isCreate && editAction && coId
        ? await editAction(coId, data as UpdateChangeOrderInput)
        : { error: { _form: ['Form not configured'] } }
    if (result && 'error' in result && result.error) {
      if (result.error._form) setError('root', { message: result.error._form[0] })
      Object.entries(result.error).forEach(([field, messages]) => {
        if (field !== '_form' && messages?.[0])
          setError(field as keyof CreateChangeOrderInput, { message: messages[0] })
      })
      return
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="co-title">Title</Label>
        <Input id="co-title" {...register('title')} className="mt-1" />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="co-reason">Reason</Label>
        <textarea
          id="co-reason"
          {...register('reason')}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-destructive">{errors.reason.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="co-justification">Justification (optional)</Label>
        <textarea
          id="co-justification"
          {...register('justification')}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        />
      </div>
      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isCreate ? 'Create change order' : 'Save'}
        </Button>
        <a href={onCancelHref}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </a>
      </div>
    </form>
  )
}
