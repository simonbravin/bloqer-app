'use client'

import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Mail, UserX } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface TeamManagementProps {
  members: Array<{
    id: string
    role: string
    active: boolean
    createdAt: Date
    user: {
      id: string
      email: string
      fullName: string | null
      avatarUrl: string | null
    }
  }>
  currentUserRole: string
}

const roleVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  OWNER: 'danger',
  ADMIN: 'warning',
  EDITOR: 'info',
  ACCOUNTANT: 'neutral',
  VIEWER: 'neutral',
}

export function TeamManagement({
  members,
  currentUserRole,
}: TeamManagementProps) {
  const t = useTranslations('settings')

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                {t('member')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                {t('role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">
                {t('joined')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-slate-500">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {member.user.fullName?.charAt(0)?.toUpperCase() ||
                          member.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">
                        {member.user.fullName || member.user.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={roleVariants[member.role] || 'neutral'}>
                    {t(`role_${member.role.toLowerCase()}`)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {member.active ? (
                    <Badge variant="success">{t('active')}</Badge>
                  ) : (
                    <Badge variant="neutral">{t('inactive')}</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {formatDistanceToNow(new Date(member.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  {currentUserRole === 'OWNER' && member.role !== 'OWNER' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <Mail className="mr-2 h-4 w-4" />
                          {t('resendInvite')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          {t('deactivate')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
