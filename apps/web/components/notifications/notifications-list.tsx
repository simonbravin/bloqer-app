'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format-utils'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from '@/app/actions/notifications'

const PAGE_SIZE = 20

export function NotificationsList() {
  const t = useTranslations('common')
  const [items, setItems] = useState<NotificationItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async (cursor?: string) => {
    if (cursor) setLoadingMore(true)
    else setLoading(true)
    try {
      const { items: nextItems, nextCursor: next } = await getNotifications({
        limit: PAGE_SIZE,
        cursor: cursor ?? undefined,
      })
      if (cursor) {
        setItems((prev) => [...prev, ...nextItems])
      } else {
        setItems(nextItems)
      }
      setNextCursor(next)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleMarkRead(n: NotificationItem) {
    if (n.read) return
    await markNotificationRead(n.id)
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true, readAt: new Date() } : i)))
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((i) => ({ ...i, read: true, readAt: new Date() })))
    } finally {
      setMarkingAll(false)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">{t('loading', { defaultValue: 'Cargando…' })}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">{t('noNotifications', { defaultValue: 'No hay notificaciones' })}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={markingAll || items.every((i) => i.read)}
        >
          {markingAll ? t('loading', { defaultValue: 'Cargando…' }) : t('markAllRead', { defaultValue: 'Marcar todas como leídas' })}
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {items.map((n) => (
          <li key={n.id}>
            {n.link ? (
              <Link
                href={n.link}
                className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50"
                onClick={() => handleMarkRead(n)}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                {n.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                )}
                {n.actorName && (
                  <p className="text-xs text-muted-foreground">
                    {t('by', { defaultValue: 'Por' })} {n.actorName}
                  </p>
                )}
              </Link>
            ) : (
              <div
                className="flex flex-col gap-1 px-4 py-3"
                role="button"
                tabIndex={0}
                onClick={() => handleMarkRead(n)}
                onKeyDown={(e) => e.key === 'Enter' && handleMarkRead(n)}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                {n.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                )}
                {n.actorName && (
                  <p className="text-xs text-muted-foreground">
                    {t('by', { defaultValue: 'Por' })} {n.actorName}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {nextCursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={loadingMore}
            onClick={() => load(nextCursor)}
          >
            {loadingMore ? t('loading', { defaultValue: 'Cargando…' }) : t('loadMore', { defaultValue: 'Cargar más' })}
          </Button>
        </div>
      )}
    </div>
  )
}
