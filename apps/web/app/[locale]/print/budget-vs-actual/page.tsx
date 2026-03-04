import { getAuthContext } from '@/lib/auth-helpers'
import { getBudgetVsActualReport } from '@/app/actions/predefined-reports'
import { PrintDocumentShell } from '@/components/print/print-document-shell'
import { PrintTable } from '@/components/print/print-table'
import { formatCurrency } from '@/lib/format-utils'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PrintBudgetVsActualPage({ searchParams }: PageProps) {
  const sp = await searchParams
  await getAuthContext()
  const data = await getBudgetVsActualReport()

  const columns = [
    { key: 'projectNumber' as const, label: 'Nº Proyecto', align: 'left' as const },
    { key: 'projectName' as const, label: 'Proyecto', align: 'left' as const },
    {
      key: 'budgeted' as const,
      label: 'Presupuestado',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'actual' as const,
      label: 'Real',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'variance' as const,
      label: 'Variación',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'variancePct' as const,
      label: '%',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? `${v.toFixed(1)}%` : String(v)),
    },
  ]

  const totalBudgeted = data.reduce((s, r) => s + r.budgeted, 0)
  const totalActual = data.reduce((s, r) => s + r.actual, 0)
  const totalVariance = totalBudgeted - totalActual

  return (
    <PrintDocumentShell templateId="budget-vs-actual" query={sp}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Presupuesto vs Real</h2>
        <p className="text-sm text-muted-foreground">Control de costos por proyecto</p>
        <PrintTable
          columns={columns}
          rows={data}
          totals={{
            budgeted: formatCurrency(totalBudgeted),
            actual: formatCurrency(totalActual),
            variance: formatCurrency(totalVariance),
          }}
          totalsLabel="Total"
        />
      </div>
    </PrintDocumentShell>
  )
}
