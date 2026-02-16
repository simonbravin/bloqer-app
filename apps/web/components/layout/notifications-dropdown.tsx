'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format-utils'
import {
  getNotificationsPreview,
  getUnreadCount,
  markNotificationRead,
  type NotificationItem,
} from '@/app/actions/notifications'

/**
 * Notifications bell: badge only when unread, dropdown with last 3 + link to list.
 */
export function NotificationsDropdown() {
  const t = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [items, count] = await Promise.all([
        getNotificationsPreview(3),
        getUnreadCount(),
      ])
      setPreview(items)
      setUnreadCount(count)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  async function handleSelectNotification(n: NotificationItem) {
    if (!n.read) await markNotificationRead(n.id)
    setOpen(false)
    if (n.link) window.location.href = n.link
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative rounded-lg p-2 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={t('notifications', { defaultValue: 'Notificaciones' })}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="border-b border-border px-3 py-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t('notifications', { defaultValue: 'Notificaciones' })}
          </h3>
        </div>
        <div className="max-h-[280px] overflow-y-auto">
          {loading && preview.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('loading', { defaultValue: 'Cargando…' })}
            </div>
          ) : preview.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('noNotifications', { defaultValue: 'No hay notificaciones' })}
            </div>
          ) : (
            preview.map((n) => (
              <button
                key={n.id}
                type="button"
                className="flex w-full flex-col gap-0.5 border-b border-border/50 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                onClick={() => handleSelectNotification(n)}
              >
                <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                  {n.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(n.createdAt)}</span>
                  {n.actorName && (
                    <>
                      <span>·</span>
                      <span>{t('by', { defaultValue: 'Por' })} {n.actorName}</span>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-border p-2">
          <Link
            href="/notifications"
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            {t('goToNotifications', { defaultValue: 'Ir a notificaciones' })}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
