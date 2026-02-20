/**
 * Auth layout: full-width, two-column login/register; each column has its own background.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      {children}
    </div>
  )
}
