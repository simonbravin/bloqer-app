'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateShort } from '@/lib/format-utils'
import { AlertCircleIcon } from 'lucide-react'

export interface UpcomingPayment {
  id: string
  description: string
  dueDate: Date | string | null
  amount: number
  supplier: string
}

interface Props {
  payments: UpcomingPayment[]
}

export function UpcomingPaymentsTable({ payments }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <AlertCircleIcon className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Próximos Vencimientos (30 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const due = payment.dueDate ? new Date(payment.dueDate) : null
              const daysUntilDue = due
                ? Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <TableRow key={payment.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {payment.description}
                  </TableCell>
                  <TableCell>{payment.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.dueDate ? formatDateShort(payment.dueDate) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {daysUntilDue !== null && (
                      <Badge
                        variant={
                          daysUntilDue <= 0 ? 'danger' : daysUntilDue <= 7 ? 'warning' : 'neutral'
                        }
                      >
                        {daysUntilDue <= 0 ? 'Vencido' : `${daysUntilDue} días`}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
