'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createRfiSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  question: z.string().min(1, 'Question is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  wbsNodeId: z.string().uuid().optional().nullable(),
  assignedToOrgMemberId: z.string().uuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
})
type CreateRfiInput = z.infer<typeof createRfiSchema>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRfi } from '@/app/actions/quality'

type WbsNode = { id: string; code: string; name: string }
type OrgMember = { id: string; user: { fullName: string } }

type RfiFormProps = {
  projectId: string
  wbsNodes: WbsNode[]
  orgMembers: OrgMember[]
}

export function RfiForm({ projectId, wbsNodes, orgMembers }: RfiFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateRfiInput>({
    resolver: zodResolver(createRfiSchema),
    defaultValues: { priority: 'MEDIUM' },
  })

  async function onSubmit(data: CreateRfiInput) {
    try {
      const result = await createRfi(projectId, {
        ...data,
        wbsNodeId: data.wbsNodeId || null,
        assignedToOrgMemberId: data.assignedToOrgMemberId || null,
        dueDate: data.dueDate || null,
      })
      if ('rfiId' in result) {
        router.push(`/projects/${projectId}/quality/rfis/${result.rfiId}`)
        router.refresh()
      }
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to create RFI',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          {...register('subject')}
          placeholder="Brief description of the question"
          className="mt-1"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="question">Question</Label>
        <textarea
          id="question"
          {...register('question')}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        {errors.question && (
          <p className="mt-1 text-sm text-destructive">{errors.question.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            {...register('priority')}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            className="mt-1"
          />
        </div>
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
        <Label htmlFor="assignedToOrgMemberId">Assign To</Label>
        <select
          id="assignedToOrgMemberId"
          {...register('assignedToOrgMemberId')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="">— Unassigned —</option>
          {orgMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.user.fullName}
            </option>
          ))}
        </select>
      </div>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create RFI'}
        </Button>
        <Link href={`/projects/${projectId}/quality/rfis`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
