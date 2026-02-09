'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@repo/validators'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ForgotPasswordModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const t = useTranslations('auth')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setStatus('idle')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(json.error ?? t('forgotPasswordError'))
        return
      }
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
      setErrorMessage(t('forgotPasswordError'))
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStatus('idle')
      setErrorMessage(null)
      reset()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full min-w-[24rem] max-w-[32rem] p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>{t('forgotPasswordTitle')}</DialogTitle>
          <DialogDescription>{t('forgotPasswordDescription')}</DialogDescription>
        </DialogHeader>
        {status === 'success' ? (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            {t('forgotPasswordSuccess')}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t('email')}</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            {status === 'error' && errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? t('sendingResetLink') : t('sendResetLink')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
