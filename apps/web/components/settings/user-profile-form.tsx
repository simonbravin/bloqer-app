'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
} from '@repo/validators'
import { updateUserProfile, uploadUserAvatar } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileAndCameraTrigger } from '@/components/ui/file-and-camera-trigger'

interface UserProfileFormProps {
  user: {
    id: string
    email: string
    username: string | null
    fullName: string
    avatarUrl: string | null
  }
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserProfileInput>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      fullName: user.fullName || '',
      username: user.username ?? '',
    },
  })

  async function onSubmit(data: UpdateUserProfileInput) {
    setIsSubmitting(true)
    try {
      const result = await updateUserProfile(data)
      if (result.success) {
        toast.success(t('profileUpdated'))
      } else {
        toast.error(result.error || t('errorUpdating'))
      }
    } catch {
      toast.error(t('errorUpdating'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAvatarSelect(file: File) {
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.set('avatar', file)
      const result = await uploadUserAvatar(formData)
      if (result.success) {
        toast.success(t('profileUpdated'))
        router.refresh()
      } else {
        toast.error(result.error || t('errorUpdating'))
      }
    } catch {
      toast.error(t('errorUpdating'))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as (data: UpdateUserProfileInput) => Promise<void>)} className="w-full min-w-0 space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {user.fullName?.charAt(0)?.toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <FileAndCameraTrigger
            imagesOnly
            onFileSelect={handleAvatarSelect}
            loading={isUploadingAvatar}
            uploadLabel={isUploadingAvatar ? t('saving') : t('uploadAvatar')}
            cameraLabel={tCommon('takePhoto')}
            t={tCommon}
          />
          <p className="mt-2 text-xs text-slate-500">{t('avatarHelp')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full min-w-0">
          <Label htmlFor="fullName">{t('fullName')}</Label>
          <Input
            id="fullName"
            {...register('fullName')}
            className="mt-1 w-full min-w-0"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>
        <div className="w-full min-w-0">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="mt-1 w-full min-w-0 bg-muted/50"
          />
          <p className="mt-1 text-xs text-slate-500">{t('emailNotEditable')}</p>
        </div>
        <div className="w-full min-w-0">
          <Label htmlFor="username">{t('username')}</Label>
          <Input
            id="username"
            {...register('username')}
            className="mt-1 w-full min-w-0"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : t('saveChanges')}
        </Button>
      </div>
    </form>
  )
}
