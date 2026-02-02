'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { runSavedReport } from '@/app/actions/reports'

type ReportRunClientProps = {
  reportId: string
  reportName: string
}

export function ReportRunClient({
  reportId,
  reportName,
}: ReportRunClientProps) {
  const router = useRouter()
  const [running, setRunning] = useState(false)

  async function handleExport(format: 'EXCEL' | 'CSV') {
    setRunning(true)
    try {
      await runSavedReport(reportId, format)
      window.open(`/api/reports/${reportId}/export?format=${format}`, '_blank')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Export &quot;{reportName}&quot; to download the report data.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleExport('EXCEL')}
          disabled={running}
        >
          {running ? 'Preparing…' : 'Export to Excel'}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExport('CSV')}
          disabled={running}
        >
          Export to CSV
        </Button>
      </div>
    </div>
  )
}
