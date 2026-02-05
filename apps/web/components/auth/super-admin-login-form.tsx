'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { superAdminLogin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { Eye, EyeOff } from 'lucide-react'

type FormData = { username: string; password: string }

export function SuperAdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(data: FormData) {
    const result = await superAdminLogin(data.username, data.password)
    if (result?.error) {
      const err = result.error as { _form?: string[] }
      if (err._form) setError('root', { message: err._form[0] })
      return
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-w-0 flex-col gap-6">
      <div className="space-y-3">
        <Label htmlFor="superadmin-username" className="text-base font-medium">
          Usuario
        </Label>
        <Input
          id="superadmin-username"
          type="text"
          autoComplete="username"
          placeholder="Usuario"
          className="h-12 rounded-lg border-slate-200 text-base dark:border-slate-600"
          {...register('username', { required: 'Ingresá el usuario' })}
        />
        {errors.username && (
          <p className="text-base text-red-600 dark:text-red-400">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-3">
        <Label htmlFor="superadmin-password" className="text-base font-medium">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="superadmin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Contraseña"
            className="h-12 rounded-lg border-slate-200 pr-12 text-base dark:border-slate-600"
            {...register('password', { required: 'Ingresá la contraseña' })}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-base text-red-600 dark:text-red-400">{errors.password.message}</p>
        )}
      </div>
      {errors.root && (
        <p className="text-base text-red-600 dark:text-red-400" role="alert">
          {errors.root.message}
        </p>
      )}
      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-amber-600 text-base font-medium text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Entrando…' : 'Entrar al portal'}
      </Button>
      <Link
        href="/login"
        className="text-center text-base text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        ← Volver al login normal
      </Link>
    </form>
  )
}
