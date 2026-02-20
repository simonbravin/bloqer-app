'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ExportDialog } from '@/components/export/export-dialog'
import { exportProjectCashflowToExcel } from '@/app/actions/export'
import type { ProjectCashflowExportParams } from '@/app/actions/export'
import { FileDown } from 'lucide-react'

type Props = {
  projectId: string
  dateFrom: Date
  dateTo: Date
}

const PROJECT_CASHFLOW_EXPORT_COLUMNS = [
  { field: 'month', label: 'Mes', defaultVisible: true },
  { field: 'income', label: 'Ingresos', defaultVisible: true },
  { field: 'expense', label: 'Gastos', defaultVisible: true },
  { field: 'net', label: 'Neto', defaultVisible: true },
  { field: 'balance', label: 'Balance', defaultVisible: true },
]

export function ProjectCashflowExportToolbar({ projectId, dateFrom, dateTo }: Props) {
  const t = useTranslations('finance')
  const [showExportDialog, setShowExportDialog] = useState(false)

  const params: ProjectCashflowExportParams = {
    projectId,
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
  }

  async function handleExport(format: 'excel' | 'pdf', selectedColumns: string[]) {
    if (format === 'excel') return exportProjectCashflowToExcel(params, selectedColumns)
    return { success: false, error: 'Solo exportación a Excel disponible para este reporte.' }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowExportDialog(true)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {t('export', { defaultValue: 'Exportar' })}
      </Button>
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title={t('exportCashflowTitle', {
          defaultValue: 'Exportar flujo de caja (según período actual)',
        })}
        columns={PROJECT_CASHFLOW_EXPORT_COLUMNS}
        onExport={handleExport}
      />
    </>
  )
}
