import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Construction ERP
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de gestión integral para proyectos de construcción
          </p>

          <div className="flex justify-center gap-4 pt-6">
            <Button asChild size="lg" variant="accent">
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
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2025 Construction ERP. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
