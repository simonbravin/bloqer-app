'use client'

import { ChartCard } from '@/components/charts/chart-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/format-utils'
import type { CertificationsByProjectRow } from '@/app/actions/predefined-reports'

interface Props {
  data: CertificationsByProjectRow[]
}

export function CertificationsReportClient({ data }: Props) {
  const chartData = data.slice(0, 12).map((p) => ({
    name: p.projectNumber,
    Borrador: p.draft,
    Emitida: p.issued,
    Aprobada: p.approved,
    Rechazada: p.rejected,
  }))

  return (
    <div className="space-y-6">
      <ChartCard
        title="Certificaciones por proyecto (apilado)"
        description="Montos por estado: Borrador, Emitida, Aprobada, Rechazada"
      >
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Bar dataKey="Borrador" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Emitida" stackId="a" fill="hsl(var(--chart-3))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Aprobada" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Rechazada" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Monto certificado por estado y cantidad de certificaciones
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Proyecto</th>
                  <th className="pb-2 text-right font-medium">Certificaciones</th>
                  <th className="pb-2 text-right font-medium">Borrador</th>
                  <th className="pb-2 text-right font-medium">Emitida</th>
                  <th className="pb-2 text-right font-medium">Aprobada</th>
                  <th className="pb-2 text-right font-medium">Rechazada</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.projectId} className="border-b">
                    <td className="py-2">
                      <span className="font-medium">{row.projectNumber}</span>
                      <span className="ml-1 text-muted-foreground">
                        {row.projectName}
                      </span>
                    </td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.draft)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.issued)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.approved)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.rejected)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {formatCurrency(row.totalCertified)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
