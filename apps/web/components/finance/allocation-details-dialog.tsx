'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format-utils'
import { Trash2 } from 'lucide-react'

type AllocationRow = {
  id: string
  projectId: string
  projectName: string
  projectNumber: string
  allocationPct: number
  allocationAmount: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: {
    description: string
    total: number
    allocations: AllocationRow[]
  }
  onDelete: (allocationId: string) => void
}

export function AllocationDetailsDialog({
  open,
  onOpenChange,
  transaction,
  onDelete,
}: Props) {
  const totalPct = transaction.allocations.reduce((sum, a) => sum + a.allocationPct, 0)
  const totalAmount = transaction.allocations.reduce((sum, a) => sum + a.allocationAmount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de Asignación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Descripción</span>
            <span className="font-medium">{transaction.description}</span>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead className="text-right">Porcentaje</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.allocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell>
                      <span className="font-medium">{allocation.projectName}</span>
                      <span className="ml-2 text-muted-foreground">
                        {allocation.projectNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {allocation.allocationPct.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(allocation.allocationAmount, 'ARS')}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(allocation.id)}
                        title="Eliminar asignación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right tabular-nums">{totalPct.toFixed(2)}%</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(totalAmount, 'ARS')}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
