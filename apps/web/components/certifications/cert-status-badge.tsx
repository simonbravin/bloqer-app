import { Badge } from '@/components/ui/badge'

/** Maps certification status to semantic Badge variant */
const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'default',
  BASELINE: 'info',
  ISSUED: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
}

interface CertStatusBadgeProps {
  status: string
  label?: string
}

export function CertStatusBadge({ status, label }: CertStatusBadgeProps) {
  const variant = STATUS_VARIANT[status] ?? 'default'
  return (
    <Badge
      variant={
        variant === 'info'
          ? 'info'
          : variant === 'success'
            ? 'success'
            : variant === 'danger'
              ? 'danger'
              : 'default'
      }
    >
      {label ?? status}
    </Badge>
  )
}
