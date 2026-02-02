'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { loginFormSchema, type LoginFormInput } from '@repo/validators'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { ForgotPasswordModal } from './forgot-password-modal'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const t = useTranslations('auth')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { emailOrUsername: '', password: '' },
  })

  async function onSubmit(data: LoginFormInput) {
    const result = await login(data)
    if (result?.error) {
      const err = result.error as {
        _form?: string[]
        emailOrUsername?: string[]
        password?: string[]
      }
      if (err._form) setError('root', { message: err._form[0] })
      if (err.emailOrUsername) setError('emailOrUsername', { message: err.emailOrUsername[0] })
      if (err.password) setError('password', { message: err.password[0] })
      return
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="space-y-2">
          <Label htmlFor="emailOrUsername" className="text-slate-700 dark:text-slate-300">
            {t('userOrEmail')}
          </Label>
          <Input
            id="emailOrUsername"
            type="text"
            autoComplete="username"
            placeholder={t('userOrEmailPlaceholder')}
            className="rounded-lg border-slate-200 dark:border-slate-600"
            {...register('emailOrUsername')}
          />
          {errors.emailOrUsername && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.emailOrUsername.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
            {t('password')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('passwordPlaceholder')}
              className="rounded-lg border-slate-200 pr-10 dark:border-slate-600"
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full rounded-lg bg-[#5D5CDE] text-white hover:bg-[#4A49A8] dark:bg-[#5D5CDE] dark:hover:bg-[#4A49A8]"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('signingIn') : t('signIn')}
        </Button>
        <button
          type="button"
          className="text-center text-sm font-medium text-[#5D5CDE] hover:underline dark:text-[#8B8BEE]"
          onClick={() => setForgotOpen(true)}
        >
          {t('forgotPassword')}
        </button>
      </form>
      <ForgotPasswordModal open={forgotOpen} onOpenChange={setForgotOpen} />
    </>
  )
}
