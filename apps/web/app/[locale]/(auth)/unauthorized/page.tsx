import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export default async function UnauthorizedPage({ params }: Props) {
  const { locale } = await params
  const signOutUrl = `/api/auth/signout?callbackUrl=/${locale}/super-admin`

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div
        className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        style={{ width: 'min(100%, 420px)', minWidth: '320px' }}
      >
        <div className="border-b border-border bg-muted/80 px-8 py-6">
          <div className="flex items-center gap-4">
            <ShieldAlert className="h-10 w-10 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Acceso denegado
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                No tenés permisos para acceder a esta sección.
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Si creés que deberías tener acceso, contactá al administrador de tu organización.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-11">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Sos Super Admin?{' '}
              <a
                href={signOutUrl}
                className="font-medium text-foreground underline hover:no-underline"
              >
                Cerrar sesión e ir al login de Super Admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
