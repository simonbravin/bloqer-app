'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inviteTeamMember } from '@/app/actions/team'
import { inviteTeamMemberSchema } from '@repo/validators'
import type { InviteTeamMemberInput } from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Mail } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export function InviteMemberForm() {
  const t = useTranslations('settings')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InviteTeamMemberInput>({
    resolver: zodResolver(inviteTeamMemberSchema),
    defaultValues: {
      email: '',
      role: 'VIEWER',
    },
  })

  async function onSubmit(data: InviteTeamMemberInput) {
    setIsSubmitting(true)
    try {
      const result = await inviteTeamMember(data)

      if (result.success) {
        toast.success(t('invitationSent'), {
          description: t('invitationSentDesc', { email: data.email }),
        })
        router.push('/settings/team')
      } else {
        toast.error(result.error || t('invitationError'))
      }
    } catch {
      toast.error(t('invitationError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              className="mt-1"
              placeholder="usuario@ejemplo.com"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">{t('inviteEmailHint')}</p>
          </div>

          <div>
            <Label htmlFor="role">{t('role')}</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) =>
                form.setValue('role', value as InviteTeamMemberInput['role'])
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div>
                    <p className="font-medium">{t('role_viewer')}</p>
                    <p className="text-xs text-slate-500">
                      {t('roleVIEWERDesc')}
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="ACCOUNTANT">
                  <div>
                    <p className="font-medium">{t('role_accountant')}</p>
                    <p className="text-xs text-slate-500">
                      {t('roleACCOUNTANTDesc')}
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR">
                  <div>
                    <p className="font-medium">{t('role_editor')}</p>
                    <p className="text-xs text-slate-500">
                      {t('roleEDITORDesc')}
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div>
                    <p className="font-medium">{t('role_admin')}</p>
                    <p className="text-xs text-slate-500">
                      {t('roleADMINDesc')}
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-900">
                <p className="font-medium">{t('inviteFlowTitle')}</p>
                <ul className="mt-2 space-y-1 text-blue-800">
                  <li>• {t('inviteFlowStep1')}</li>
                  <li>• {t('inviteFlowStep2')}</li>
                  <li>• {t('inviteFlowStep3')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href="/settings/team">{t('cancel')}</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Mail className="mr-2 h-4 w-4" />
          {isSubmitting ? t('sending') : t('sendInvitation')}
        </Button>
      </div>
    </form>
  )
}
