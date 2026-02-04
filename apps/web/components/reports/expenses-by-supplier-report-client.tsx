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
import type { ExpensesBySupplierRow } from '@/app/actions/predefined-reports'

interface Props {
  data: ExpensesBySupplierRow[]
}

export function ExpensesBySupplierReportClient({ data }: Props) {
  const chartData = data.slice(0, 10).map((s) => ({
    name: s.supplierName.length > 20 ? s.supplierName.substring(0, 20) + '…' : s.supplierName,
    Total: s.total,
  }))

  const totalSpent = data.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio por Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency(data.length === 0 ? 0 : totalSpent / data.length)}
            </p>
          </CardContent>
        </Card>
      </div>

      <ChartCard
        title="Top 10 proveedores por gasto"
        description="Total gastado por proveedor"
      >
        <div className="h-[320px]">
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
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="Total" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle>Detalle completo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Todos los proveedores ordenados por total gastado
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Proveedor</th>
                  <th className="pb-2 text-right font-medium">Total Gastado</th>
                  <th className="pb-2 text-right font-medium">Transacciones</th>
                  <th className="pb-2 text-right font-medium">Proyectos</th>
                  <th className="pb-2 text-right font-medium">Promedio/Tx</th>
                </tr>
              </thead>
              <tbody>
                {data.map((supplier) => (
                  <tr key={supplier.supplierId} className="border-b">
                    <td className="py-2">{supplier.supplierName}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(supplier.total)}
                    </td>
                    <td className="py-2 text-right">{supplier.count}</td>
                    <td className="py-2 text-right">{supplier.projectCount}</td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(supplier.total / supplier.count)}
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
