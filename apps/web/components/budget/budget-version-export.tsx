'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ExportDialog } from '@/components/export/export-dialog'
import { exportBudgetToExcel, exportBudgetToPDF } from '@/app/actions/export'
import { FileDown } from 'lucide-react'

interface BudgetVersionExportProps {
  versionId: string
  versionCode: string
}

const exportColumns = [
  { field: 'code', label: 'Código', defaultVisible: true },
  { field: 'description', label: 'Descripción', defaultVisible: true },
  { field: 'unit', label: 'Unidad', defaultVisible: true },
  { field: 'quantity', label: 'Cantidad', defaultVisible: true },
  { field: 'unitPrice', label: 'Precio Unitario', defaultVisible: true },
  { field: 'totalCost', label: 'Costo Total', defaultVisible: true },
  { field: 'overheadPct', label: 'GG %', defaultVisible: false },
  { field: 'profitPct', label: 'Beneficio %', defaultVisible: false },
  { field: 'taxPct', label: 'IVA %', defaultVisible: false },
]

export function BudgetVersionExport({ versionId, versionCode }: BudgetVersionExportProps) {
  const t = useTranslations('export')
  const [showExportDialog, setShowExportDialog] = useState(false)

  async function handleExport(format: 'excel' | 'pdf', selectedColumns: string[]) {
    if (format === 'excel') {
      return await exportBudgetToExcel(versionId, selectedColumns)
    }
    return await exportBudgetToPDF(versionId, selectedColumns)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
        <FileDown className="mr-2 h-4 w-4" />
        {t('export')}
      </Button>
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        title={`Presupuesto ${versionCode}`}
        columns={exportColumns}
        onExport={handleExport}
      />
    </>
  )
}
