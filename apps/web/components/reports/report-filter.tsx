'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FilterConfig = Record<string, string | undefined>

type ReportFilterProps = {
  entityType: string
  filters: FilterConfig
  onChange: (filters: FilterConfig) => void
  projects?: { id: string; name: string }[]
}

const PROJECT_FILTERS = [
  { key: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED'] },
  { key: 'phase', label: 'Phase', type: 'select', options: ['PRE_CONSTRUCTION', 'CONSTRUCTION', 'POST_CONSTRUCTION'] },
  { key: 'startDateFrom', label: 'Start date from', type: 'date' },
  { key: 'startDateTo', label: 'Start date to', type: 'date' },
]

const FINANCE_FILTERS = [
  { key: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'PENDING', 'PAID', 'VOID'] },
  { key: 'type', label: 'Type', type: 'select', options: ['EXPENSE', 'INCOME', 'PURCHASE', 'SALE', 'OVERHEAD'] },
]

const BUDGET_FILTERS = [
  { key: 'projectId', label: 'Project', type: 'project' },
]

export function ReportFilter({ entityType, filters, onChange, projects = [] }: ReportFilterProps) {
  const filterDefs =
    entityType === 'PROJECT'
      ? PROJECT_FILTERS
      : entityType === 'FINANCE_TRANSACTION'
        ? FINANCE_FILTERS
        : entityType === 'BUDGET_LINE'
          ? BUDGET_FILTERS
          : []

  if (filterDefs.length === 0) return null

  function update(key: string, value: string) {
    onChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Filters</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        {filterDefs.map((f) => (
          <div key={f.key}>
            <Label htmlFor={f.key} className="text-xs text-gray-500">
              {f.label}
            </Label>
            {f.type === 'select' && (
              <select
                id={f.key}
                value={filters[f.key] ?? ''}
                onChange={(e) => update(f.key, e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All</option>
                {(f as { options?: string[] }).options?.map((o) => (
                  <option key={o} value={o}>
                    {o.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}
            {f.type === 'date' && (
              <Input
                id={f.key}
                type="date"
                value={filters[f.key] ?? ''}
                onChange={(e) => update(f.key, e.target.value)}
                className="mt-1"
              />
            )}
            {f.type === 'project' && (
              <select
                id={f.key}
                value={filters[f.key] ?? ''}
                onChange={(e) => update(f.key, e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
