'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createInventoryLocation } from '@/app/actions/inventory'

type Project = { id: string; name: string; projectNumber: string }

type LocationFormProps = {
  projects: Project[]
}

export function LocationForm({ projects }: LocationFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locType, setLocType] = useState<string>('CENTRAL_WAREHOUSE')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      await createInventoryLocation({
        type: fd.get('type') as string,
        name: (fd.get('name') as string).trim(),
        projectId: (fd.get('projectId') as string) || null,
        address: (fd.get('address') as string)?.trim() || undefined,
      })
      router.push('/inventory/locations')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          value={locType}
          onChange={(e) => setLocType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          <option value="CENTRAL_WAREHOUSE">Central warehouse</option>
          <option value="PROJECT_SITE">Project site</option>
          <option value="SUPPLIER">Supplier</option>
        </select>
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required className="mt-1" />
      </div>
      {locType === 'PROJECT_SITE' && (
        <div>
          <Label htmlFor="projectId">Project</Label>
          <select
            id="projectId"
            name="projectId"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.projectNumber})
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" className="mt-1" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create location'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/inventory/locations')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
