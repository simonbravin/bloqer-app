'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type ProjectFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<UpdateProjectInput>
  projectId?: string
  onSubmit: (
    dataOrProjectId: CreateProjectInput | UpdateProjectInput | string,
    data?: UpdateProjectInput
  ) => Promise<{ error?: Record<string, string[]> } | void>
  onCancelHref: string
}

export function ProjectForm({
  mode,
  defaultValues,
  projectId,
  onSubmit,
  onCancelHref,
}: ProjectFormProps) {
  const isCreate = mode === 'create'
  const schema = isCreate ? createProjectSchema : updateProjectSchema
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: '',
      clientName: '',
      description: '',
      m2: undefined,
      startDate: undefined,
    },
  })

  async function handleFormSubmit(data: CreateProjectInput | UpdateProjectInput) {
    const result =
      projectId != null
        ? await onSubmit(projectId, data as UpdateProjectInput)
        : await onSubmit(data)
    if (result?.error) {
      if (result.error._form) {
        setError('root', { message: result.error._form[0] })
      }
      Object.entries(result.error).forEach(([field, messages]) => {
        if (field !== '_form' && messages?.[0]) {
          setError(field as keyof CreateProjectInput, { message: messages[0] })
        }
      })
      return
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="erp-form-page space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g. Office Tower A"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientName">Client name</Label>
          <Input
            id="clientName"
            {...register('clientName')}
            placeholder="Client or company name"
          />
          {errors.clientName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.clientName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            placeholder="Brief description"
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="m2">Area (m²)</Label>
            <Input
              id="m2"
              type="number"
              step="0.01"
              min="0"
              {...register('m2')}
              placeholder="0"
            />
            {errors.m2 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.m2.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.startDate.message}
              </p>
            )}
          </div>
        </div>
        {!isCreate && defaultValues && 'status' in defaultValues && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              {...register('status')}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </div>
        )}
      </div>
      {errors.root && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.root.message}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isCreate
              ? 'Creating…'
              : 'Saving…'
            : isCreate
              ? 'Create project'
              : 'Save changes'}
        </Button>
        <Link
          href={onCancelHref}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
