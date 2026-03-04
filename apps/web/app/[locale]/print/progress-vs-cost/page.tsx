import { getAuthContext } from '@/lib/auth-helpers'
import { getProgressVsCostReport } from '@/app/actions/predefined-reports'
import { PrintDocumentShell } from '@/components/print/print-document-shell'
import { PrintTable } from '@/components/print/print-table'
import { formatCurrency } from '@/lib/format-utils'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PrintProgressVsCostPage({ searchParams }: PageProps) {
  const sp = await searchParams
  await getAuthContext()
  const data = await getProgressVsCostReport()

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
      key: 'consumed' as const,
      label: 'Consumido',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'consumedPct' as const,
      label: '% Consumido',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? `${v.toFixed(1)}%` : String(v)),
    },
    {
      key: 'progressPct' as const,
      label: '% Avance',
      align: 'right' as const,
      format: (v: unknown) => (v == null ? '—' : `${Number(v).toFixed(1)}%`),
    },
  ]

  return (
    <PrintDocumentShell templateId="progress-vs-cost" query={sp}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Avance vs Costo</h2>
        <p className="text-sm text-muted-foreground">
          Consumido vs avance de obra por proyecto
        </p>
        <PrintTable columns={columns} rows={data} />
      </div>
    </PrintDocumentShell>
  )
}
