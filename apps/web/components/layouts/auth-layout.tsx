/**
 * Auth layout shell: centered content on dark background for login/register cards.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-800 px-4 py-8 dark:bg-slate-950">
      {children}
    </div>
  )
}
