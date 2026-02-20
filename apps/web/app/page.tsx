import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const year = new Date().getFullYear()
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Bloqer
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de gestión integral para proyectos de construcción
          </p>

          <div className="flex justify-center gap-4 pt-6">
            <Button asChild size="lg" variant="default">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Image src="/icon" alt="Bloqer" width={20} height={20} className="h-5 w-5 shrink-0" />
          <span>© {year} Bloqer. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  )
}
