import { getAuthContext } from '@/lib/auth-helpers'
import { getCertificationsByProjectReport } from '@/app/actions/predefined-reports'
import { PrintDocumentShell } from '@/components/print/print-document-shell'
import { PrintTable } from '@/components/print/print-table'
import { formatCurrency } from '@/lib/format-utils'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PrintCertificationsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  await getAuthContext()
  const data = await getCertificationsByProjectReport()

  const columns = [
    { key: 'projectNumber' as const, label: 'Nº Proyecto', align: 'left' as const },
    { key: 'projectName' as const, label: 'Proyecto', align: 'left' as const },
    {
      key: 'totalCertified' as const,
      label: 'Total certificado',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'draft' as const,
      label: 'Borrador',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'issued' as const,
      label: 'Emitido',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    {
      key: 'approved' as const,
      label: 'Aprobado',
      align: 'right' as const,
      format: (v: unknown) => (typeof v === 'number' ? formatCurrency(v) : String(v)),
    },
    { key: 'count' as const, label: 'Certificados', align: 'right' as const },
  ]

  const totalCertified = data.reduce((s, r) => s + r.totalCertified, 0)

  return (
    <PrintDocumentShell templateId="certifications-report" query={sp}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Evolución de Certificaciones</h2>
        <p className="text-sm text-muted-foreground">
          Ingresos cobrados por proyecto (por estado)
        </p>
        <PrintTable
          columns={columns}
          rows={data}
          totals={{ totalCertified: formatCurrency(totalCertified) }}
          totalsLabel="Total"
        />
      </div>
    </PrintDocumentShell>
  )
}
