import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function UnauthorizedPage() {
  return (
    <div className="flex w-full max-w-4xl shrink-0 justify-center px-4">
      <Card className="w-full min-w-0">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500" />
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            No tienes permisos para acceder a esta sección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Si crees que deberías tener acceso, contacta al administrador de tu organización.
          </p>
          <Button asChild>
            <Link href="/dashboard">Volver al Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
