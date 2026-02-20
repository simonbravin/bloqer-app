'use client'

import { useTranslations } from 'next-intl'
import { formatCurrency, formatNumber } from '@/lib/format-utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BudgetSummarySheetLine {
  code: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  overheadPct: number
  financialPct: number
  profitPct: number
  taxPct: number
}

interface BudgetSummarySheetProps {
  data: BudgetSummarySheetLine[]
  projectTotal: number
  markups: {
    overheadPct: number
    financialPct: number
    profitPct: number
    taxPct: number
  }
}

export function BudgetSummarySheet({
  data,
  projectTotal,
  markups,
}: BudgetSummarySheetProps) {
  const t = useTranslations('budget')

  function calculateSalePrice(line: BudgetSummarySheetLine): number {
    const directUnitCost = line.total / line.quantity
    const sub1 = directUnitCost * (1 + Number(line.overheadPct) / 100)
    const sub2 = sub1 * (1 + Number(line.financialPct) / 100 + Number(line.profitPct) / 100)
    return sub2 * (1 + Number(line.taxPct) / 100)
  }

  const totalDirectCost = data.reduce((sum, item) => sum + item.total, 0)

  const totalSale = data.reduce((sum, item) => {
    const salePrice = calculateSalePrice(item)
    return sum + salePrice * item.quantity
  }, 0)

  const overheadAmount = totalDirectCost * (markups.overheadPct / 100)
  const subtotal1 = totalDirectCost + overheadAmount

  const financialAmount = subtotal1 * (markups.financialPct / 100)
  const profitAmount = subtotal1 * (markups.profitPct / 100)
  const subtotal2 = subtotal1 + financialAmount + profitAmount

  const taxAmount = subtotal2 * (markups.taxPct / 100)

  return (
    <div className="space-y-8">
      {/* Tabla de items */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-table-head">
            <TableRow className="h-9">
              <TableHead className="text-foreground text-xs py-1 px-2 text-center w-12 min-w-[2.5rem]">
                {t('rowNumber')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2">
                {t('description')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2 w-[60px]">
                {t('unit')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2 text-right w-[80px]">
                {t('quantity')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2 text-right w-[100px]">
                {t('unitPrice')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2 text-right w-[120px]">
                {t('total')}
              </TableHead>
              <TableHead className="text-foreground text-xs py-1 px-2 text-right w-[70px]">
                {t('inc')} %
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => {
              const salePrice = calculateSalePrice(item)
              const totalSaleItem = salePrice * item.quantity
              const incidencePct =
                projectTotal > 0
                  ? (totalSaleItem / projectTotal) * 100
                  : 0

              return (
                <TableRow key={idx} className="h-8 hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-center text-muted-foreground tabular-nums py-1 px-2">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-xs py-1 px-2">
                    {item.description}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] py-1 px-2">
                    {item.unit}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-1 px-2">
                    {formatNumber(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-1 px-2">
                    {formatCurrency(salePrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold py-1 px-2">
                    {formatCurrency(totalSaleItem)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] py-1 px-2">
                    {incidencePct.toFixed(2)}%
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Resumen de totales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('budgetSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('subtotalDirectCost')}:
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">
                {formatCurrency(totalDirectCost)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                + {t('overhead')} ({markups.overheadPct}%):
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatCurrency(overheadAmount)}
              </span>
            </div>

            <div className="flex justify-between border-t border-border pt-1 text-sm font-medium">
              <span className="text-foreground">{t('subtotal', { defaultValue: 'Subtotal' })} 1:</span>
              <span className="font-mono tabular-nums text-foreground">{formatCurrency(subtotal1)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                + {t('financial')} ({markups.financialPct}%):
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatCurrency(financialAmount)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                + {t('profit')} ({markups.profitPct}%):
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatCurrency(profitAmount)}
              </span>
            </div>

            <div className="flex justify-between border-t border-border pt-1 text-sm font-medium">
              <span className="text-foreground">{t('subtotal', { defaultValue: 'Subtotal' })} 2:</span>
              <span className="font-mono tabular-nums text-foreground">{formatCurrency(subtotal2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                + {t('tax')} ({markups.taxPct}%):
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="flex justify-between border-t-2 border-border pt-3">
              <span className="text-lg font-bold text-primary">
                {t('totalSale')}:
              </span>
              <span className="font-mono text-2xl font-bold tabular-nums text-primary">
                {formatCurrency(totalSale)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
