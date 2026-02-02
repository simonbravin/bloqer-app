'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createCertification,
  addCertificationLine,
  getBudgetLinesForCert,
} from '@/app/actions/certifications'

type BudgetVersion = {
  id: string
  versionCode: string
  versionType: string
}

type Project = {
  id: string
  name: string
  budgetVersions: BudgetVersion[]
}

type BudgetLineForCert = {
  id: string
  wbsNodeId: string
  description: string
  quantity: { toString: () => string }
  salePriceTotal: { toString: () => string }
  wbsNode: { id: string; code: string; name: string }
}

type CertFormProps = {
  project: Project
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

export function CertForm({ project }: CertFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [periodMonth, setPeriodMonth] = useState(new Date().getMonth() + 1)
  const [periodYear, setPeriodYear] = useState(currentYear)
  const [budgetVersionId, setBudgetVersionId] = useState(project.budgetVersions[0]?.id ?? '')
  const [notes, setNotes] = useState('')

  const [certId, setCertId] = useState<string | null>(null)
  const [budgetLines, setBudgetLines] = useState<BudgetLineForCert[]>([])
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set())
  const [progressByLine, setProgressByLine] = useState<Record<string, number>>({})

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await createCertification(project.id, {
        periodMonth,
        periodYear,
        budgetVersionId,
        notes: notes || undefined,
      })
      if ('certId' in result) {
        setCertId(result.certId)
        const lines = await getBudgetLinesForCert(budgetVersionId)
        setBudgetLines(lines as BudgetLineForCert[])
        setSelectedLines(new Set())
        setProgressByLine({})
        setStep(2)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create certification')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLine = (lineId: string) => {
    setSelectedLines((prev) => {
      const next = new Set(prev)
      if (next.has(lineId)) next.delete(lineId)
      else next.add(lineId)
      return next
    })
  }

  const setProgress = (lineId: string, value: number) => {
    setProgressByLine((prev) => ({ ...prev, [lineId]: value }))
  }

  const handleStep2 = () => {
    if (selectedLines.size === 0) {
      setError('Select at least one budget line')
      return
    }
    setError(null)
    setStep(3)
  }

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certId) return
    setError(null)
    setSubmitting(true)
    try {
      for (const lineId of selectedLines) {
        const line = budgetLines.find((l) => l.id === lineId)
        if (!line) continue
        const pct = progressByLine[lineId] ?? 0
        await addCertificationLine(certId, {
          wbsNodeId: line.wbsNodeId,
          budgetLineId: line.id,
          periodProgressPct: pct,
        })
      }
      router.push(`/projects/${project.id}/certifications/${certId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lines')
    } finally {
      setSubmitting(false)
    }
  }

  if (project.budgetVersions.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          No budget versions available. Create a baseline or approved budget version first.
        </p>
        <Link href={`/projects/${project.id}/budget`} className="mt-2 inline-block text-sm font-medium underline">
          Go to Budget
        </Link>
      </div>
    )
  }

  return (
    <div className="erp-form-page space-y-6">
      <div className="flex gap-2 text-sm">
        <span className={step >= 1 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}>1. Period</span>
        <span className="text-gray-400">→</span>
        <span className={step >= 2 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}>2. Select lines</span>
        <span className="text-gray-400">→</span>
        <span className={step >= 3 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}>3. Progress %</span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodMonth">Month</Label>
              <select
                id="periodMonth"
                value={periodMonth}
                onChange={(e) => setPeriodMonth(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="periodYear">Year</Label>
              <select
                id="periodYear"
                value={periodYear}
                onChange={(e) => setPeriodYear(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="budgetVersionId">Budget version</Label>
            <select
              id="budgetVersionId"
              value={budgetVersionId}
              onChange={(e) => setBudgetVersionId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            >
              {project.budgetVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.versionCode} — {v.versionType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create & continue'}
            </Button>
            <Link href={`/projects/${project.id}/certifications`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select budget lines to include in this certification.
          </p>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2 text-left font-medium">WBS</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines.map((line) => (
                  <tr
                    key={line.id}
                    className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                      selectedLines.has(line.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => toggleLine(line.id)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedLines.has(line.id)}
                        onChange={() => toggleLine(line.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                      {line.wbsNode.code}
                    </td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{line.description}</td>
                    <td className="text-right tabular-nums px-3 py-2 text-gray-600 dark:text-gray-400">
                      {typeof line.quantity === 'object' && 'toString' in line.quantity
                        ? line.quantity.toString()
                        : String(line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleStep2} disabled={selectedLines.size === 0}>
              Continue
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter period progress % for each selected line. Total progress (previous + this period) cannot exceed 100%.
          </p>
          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left font-medium">WBS</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Period %</th>
                </tr>
              </thead>
              <tbody>
                {budgetLines
                  .filter((l) => selectedLines.has(l.id))
                  .map((line) => (
                    <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                        {line.wbsNode.code}
                      </td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{line.description}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={progressByLine[line.id] ?? ''}
                          onChange={(e) => setProgress(line.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding lines…' : 'Add lines & finish'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
