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
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/format-utils'
import type { TopMaterialsRow } from '@/app/actions/predefined-reports'

interface Props {
  data: TopMaterialsRow[]
}

export function TopMaterialsReportClient({ data }: Props) {
  const chartData = data.map((m) => ({
    name:
      m.materialName.length > 25
        ? m.materialName.substring(0, 25) + '…'
        : m.materialName,
    Costo: m.totalCost,
  }))

  return (
    <div className="space-y-6">
      <ChartCard
        title="Top 10 materiales por costo total"
        description="Presupuestos aprobados, agrupado por descripción y unidad"
      >
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="Costo" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de materiales</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cantidad total, costo unitario promedio y proyectos donde aparece
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Material</th>
                  <th className="pb-2 text-right font-medium">Unidad</th>
                  <th className="pb-2 text-right font-medium">Cantidad</th>
                  <th className="pb-2 text-right font-medium">Costo unit. prom.</th>
                  <th className="pb-2 text-right font-medium">Costo total</th>
                  <th className="pb-2 text-right font-medium">Proyectos</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{row.materialName}</td>
                    <td className="py-2 text-right">{row.unit}</td>
                    <td className="py-2 text-right tabular-nums">
                      {row.totalQuantity.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.avgUnitCost)}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.totalCost)}
                    </td>
                    <td className="py-2 text-right">{row.projectCount}</td>
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
