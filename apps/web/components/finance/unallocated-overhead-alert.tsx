'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/format-utils'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnallocatedOverheadAlertProps {
  amount: number
}

export function UnallocatedOverheadAlert({ amount }: UnallocatedOverheadAlertProps) {
  if (amount <= 0) return null

  return (
    <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle>Overhead sin asignar</AlertTitle>
      <AlertDescription>
        Hay {formatCurrency(amount, 'ARS')} en gastos generales (overhead) que aún no se han asignado a proyectos.
        <Link href="/finance/overhead" className="ml-2 inline-block">
          <Button variant="outline" size="sm" className="mt-2">
            Asignar overhead
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}
