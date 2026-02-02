import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VarianceBadge } from './variance-badge'
import { formatCurrency } from '@/lib/format-utils'
import { cn } from '@/lib/utils'

interface BudgetSummaryCardProps {
  estimated: number
  actual: number
  label?: string
  className?: string
}

/**
 * Budget summary card showing estimated vs actual with variance.
 * Uses semantic design tokens and VarianceBadge for status.
 */
export function BudgetSummaryCard({
  estimated,
  actual,
  label = 'Resumen',
  className,
}: BudgetSummaryCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="border-b border-border py-4">
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimado</span>
          <span className="font-mono tabular-nums text-foreground">
            {formatCurrency(estimated)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Real</span>
          <span className="font-mono tabular-nums text-foreground">
            {formatCurrency(actual)}
          </span>
        </div>
        {estimated > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Varianza</span>
            <VarianceBadge
              actual={actual}
              estimated={estimated}
              showAmount
              showPercentage
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
