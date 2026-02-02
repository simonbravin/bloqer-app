import { Badge } from '@/components/ui/badge'
import type { StatusColor } from '@/lib/design-tokens'

interface StatusBadgeProps {
  status: StatusColor
  label: string
  className?: string
}

/**
 * Generic status badge using semantic design tokens.
 * Use for success, warning, danger, neutral, info states.
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      {label}
    </Badge>
  )
}
