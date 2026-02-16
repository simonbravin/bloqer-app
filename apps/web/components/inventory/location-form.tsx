'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createInventoryLocation } from '@/app/actions/inventory'

type Project = { id: string; name: string; projectNumber: string }

type LocationFormProps = {
  projects: Project[]
}

const LOCATION_TYPES = [
  { value: 'CENTRAL_WAREHOUSE', label: 'Almacén central' },
  { value: 'PROJECT_SITE', label: 'Obra / Sitio de proyecto' },
  { value: 'SUPPLIER', label: 'Proveedor' },
] as const

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
      setError(err instanceof Error ? err.message : 'No se pudo crear la ubicación')
    } finally {
      setSubmitting(false)
    }
  }

  const selectClassName =
    'mt-1 flex h-10 w-full rounded-md border border-input bg-card dark:bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-4 text-base font-semibold text-foreground">Información básica</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              name="type"
              value={locType}
              onChange={(e) => setLocType(e.target.value)}
              className={selectClassName}
            >
              {LOCATION_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" name="name" required className="mt-1" />
          </div>
          {locType === 'PROJECT_SITE' && (
            <div>
              <Label htmlFor="projectId">Proyecto *</Label>
              <select
                id="projectId"
                name="projectId"
                required
                className={selectClassName}
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" className="mt-1" placeholder="Dirección opcional" />
          </div>
        </div>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/inventory/locations')}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="default" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Crear ubicación'}
        </Button>
      </div>
    </form>
  )
}
