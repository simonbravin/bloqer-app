import { getAuthContext } from '@/lib/auth-helpers'
import { getTopMaterialsReport } from '@/app/actions/predefined-reports'
import { PrintDocumentShell } from '@/components/print/print-document-shell'
import { PrintTable } from '@/components/print/print-table'
import { formatCurrency } from '@/lib/format-utils'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PrintTopMaterialsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  await getAuthContext()
  const data = await getTopMaterialsReport(10)

  const columns = [
    { key: 'materialName' as const, label: 'Material', align: 'left' as const },
    { key: 'unit' as const, label: 'Unidad', align: 'center' as const },
    {
      key: 'totalQuantity' as const,
      label: 'Cantidad total',
      align: 'right' as const,
      format: (v: unknown) =>
        typeof v === 'number' ? v.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : String(v),
    },
    {
      key: 'avgUnitCost' as const,
      label: 'Costo unit. prom.',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'totalCost' as const,
      label: 'Costo total',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    { key: 'projectCount' as const, label: 'Proyectos', align: 'right' as const },
  ]

  const totalCost = data.reduce((s, r) => s + r.totalCost, 0)

  return (
    <PrintDocumentShell templateId="top-materials" query={sp}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Top 10 Materiales más Caros</h2>
        <p className="text-sm text-muted-foreground">
          Análisis de materiales por costo total en presupuestos aprobados
        </p>
        <PrintTable
          columns={columns}
          rows={data}
          totals={{ totalCost: formatCurrency(totalCost) }}
          totalsLabel="Total"
        />
      </div>
    </PrintDocumentShell>
  )
}
