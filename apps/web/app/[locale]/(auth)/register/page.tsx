import { LoginPageCard } from '@/components/auth/login-page-card'

/** Misma vista que login pero con pestaña Registrarse activa (toggle in-place) */
export default function RegisterPage() {
  return (
    <div className="flex w-full max-w-4xl shrink-0 justify-center px-4">
      <LoginPageCard initialTab="register" />
    </div>
  )
}
