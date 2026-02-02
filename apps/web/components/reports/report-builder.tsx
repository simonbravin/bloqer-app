'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ReportFilter } from './report-filter'
import { ReportPreview } from './report-preview'
import { createSavedReport, getReportPreview } from '@/app/actions/reports'

const ENTITY_TYPES = [
  { value: 'PROJECT', label: 'Projects' },
  { value: 'FINANCE_TRANSACTION', label: 'Finance Transactions' },
  { value: 'BUDGET_LINE', label: 'Budget Lines' },
]

const ENTITY_COLUMNS: Record<string, { key: string; label: string }[]> = {
  PROJECT: [
    { key: 'projectNumber', label: 'Number' },
    { key: 'name', label: 'Name' },
    { key: 'clientName', label: 'Client' },
    { key: 'status', label: 'Status' },
    { key: 'phase', label: 'Phase' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'plannedEndDate', label: 'Planned End' },
    { key: 'totalBudget', label: 'Total Budget' },
    { key: 'location', label: 'Location' },
  ],
  FINANCE_TRANSACTION: [
    { key: 'transactionNumber', label: 'Transaction #' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'description', label: 'Description' },
    { key: 'total', label: 'Total' },
    { key: 'currency', label: 'Currency' },
    { key: 'projectName', label: 'Project' },
  ],
  BUDGET_LINE: [
    { key: 'wbsCode', label: 'WBS Code' },
    { key: 'wbsName', label: 'WBS Name' },
    { key: 'description', label: 'Description' },
    { key: 'unit', label: 'Unit' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'directCostTotal', label: 'Direct Cost' },
    { key: 'salePriceTotal', label: 'Sale Price' },
    { key: 'projectName', label: 'Project' },
  ],
}

type ReportBuilderProps = {
  projects?: { id: string; name: string }[]
}

export function ReportBuilder({ projects = [] }: ReportBuilderProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [entityType, setEntityType] = useState('PROJECT')
  const [filters, setFilters] = useState<Record<string, string | undefined>>({})
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ENTITY_COLUMNS.PROJECT.map((c) => c.key)
  )
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED'>('SHARED')
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  const columns = ENTITY_COLUMNS[entityType] ?? ENTITY_COLUMNS.PROJECT

  async function refreshPreview() {
    setLoadingPreview(true)
    try {
      const data = await getReportPreview(entityType, filters, selectedColumns)
      setPreviewData(data)
    } finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    refreshPreview()
  }, [entityType]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleColumn(key: string) {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await createSavedReport({
        name,
        description: description || undefined,
        entityType,
        filtersJson: filters,
        columnsJson: selectedColumns,
        sortJson: sortKey ? [{ key: sortKey, direction: sortDir }] : [],
        visibility,
      })
      router.push(`/reports/${result.reportId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="erp-form-page space-y-6">
      <div>
        <Label htmlFor="name">Report name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Active Projects"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
      </div>
      <div>
        <Label htmlFor="entityType">Entity type</Label>
        <select
          id="entityType"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value)
            setSelectedColumns(
              (ENTITY_COLUMNS[e.target.value] ?? ENTITY_COLUMNS.PROJECT).map(
                (c) => c.key
              )
            )
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        >
          {ENTITY_TYPES.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      <ReportFilter
        entityType={entityType}
        filters={filters}
        onChange={setFilters}
        projects={projects}
      />

      <div>
        <Label className="mb-2 block">Columns to include</Label>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <label key={col.key} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
                className="rounded border-gray-300"
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sortKey">Sort by</Label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="">Default</option>
            {columns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="sortDir">Direction</Label>
          <select
            id="sortDir"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Visibility</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'PRIVATE'}
              onChange={() => setVisibility('PRIVATE')}
              className="rounded-full"
            />
            Private (only me)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="visibility"
              checked={visibility === 'SHARED'}
              onChange={() => setVisibility('SHARED')}
              className="rounded-full"
            />
            Shared (org)
          </label>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshPreview}
            disabled={loadingPreview}
          >
            {loadingPreview ? 'Loading…' : 'Refresh preview'}
          </Button>
        </div>
        <ReportPreview
          data={previewData}
          columns={columns.filter((c) => selectedColumns.includes(c.key))}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save report'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/reports')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
