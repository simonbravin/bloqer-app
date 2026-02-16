'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Auth segment error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">
          Algo salió mal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No se pudo cargar la página. Puedes intentar de nuevo o ir al inicio de sesión.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={reset}>
            Reintentar
          </Button>
          <Button variant="default" onClick={() => router.push('/login')}>
            Ir a Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
