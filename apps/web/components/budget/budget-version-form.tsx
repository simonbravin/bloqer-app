'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createBudgetVersionSchema,
  BUDGET_VERSION_TYPE,
  type CreateBudgetVersionInput,
} from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createBudgetVersion } from '@/app/actions/budget'
import Link from 'next/link'

type BudgetVersionFormProps = {
  projectId: string
}

export function BudgetVersionForm({ projectId }: BudgetVersionFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateBudgetVersionInput>({
    resolver: zodResolver(createBudgetVersionSchema),
    defaultValues: { versionType: 'WORKING', notes: '' },
  })

  async function onSubmit(data: CreateBudgetVersionInput) {
    const result = await createBudgetVersion(projectId, data)
    if (result?.error) {
      const err = result.error as { _form?: string[]; [key: string]: string[] | undefined }
      if (err._form) setError('root', { message: err._form[0] })
      Object.entries(err).forEach(([field, messages]) => {
        if (field !== '_form' && messages?.[0]) {
          setError(field as keyof CreateBudgetVersionInput, { message: messages[0] })
        }
      })
      return
    }
    const versionId = result && 'versionId' in result ? result.versionId : null
    if (versionId) {
      router.push(`/projects/${projectId}/budget/${versionId}`)
    } else {
      router.push(`/projects/${projectId}/budget`)
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="versionType">Type</Label>
        <select
          id="versionType"
          {...register('versionType')}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          {BUDGET_VERSION_TYPE.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        />
      </div>
      {errors.root && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          Create version
        </Button>
        <Link href={`/projects/${projectId}/budget`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
