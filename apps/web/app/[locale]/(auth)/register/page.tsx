import { LoginPageCard } from '@/components/auth/login-page-card'

/** Misma vista que login pero con pestaña Registrarse activa (toggle in-place) */
export default function RegisterPage() {
  return <LoginPageCard initialTab="register" />
}
