'use client'

import { useState, useCallback } from 'react'
import { Activity, X, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMessageBusAll } from '@/hooks/use-message-bus'
import type { MessageBusEventType, MessageBusPayload } from '@/hooks/use-message-bus'

const MAX_EVENTS = 20

type LogEntry = {
  id: string
  time: string
  eventType: MessageBusEventType
  payload: MessageBusPayload
}

function eventCategory(eventType: MessageBusEventType): 'create' | 'update' | 'delete' | 'other' {
  if (
    eventType.includes('.CREATED') ||
    eventType.includes('.UPLOADED') ||
    eventType.includes('.ADDED') ||
    eventType.includes('.INVITED') ||
    eventType.includes('.ISSUED') ||
    eventType.includes('.APPROVED') ||
    eventType.includes('.LINKED')
  ) {
    return 'create'
  }
  if (
    eventType.includes('.DELETED') ||
    eventType.includes('.REJECTED') ||
    eventType.includes('.UNLINKED')
  ) {
    return 'delete'
  }
  if (
    eventType.includes('.UPDATED') ||
    eventType.includes('.REORDERED') ||
    eventType.includes('.VERSION_ADDED')
  ) {
    return 'update'
  }
  return 'other'
}

function payloadSummary(payload: MessageBusPayload): string {
  const parts: string[] = []
  if (payload.entityId) parts.push(`id: ${String(payload.entityId).slice(0, 8)}…`)
  if (payload.projectId) parts.push(`project: ${String(payload.projectId).slice(0, 8)}…`)
  if (payload.name) parts.push(String(payload.name).slice(0, 20))
  return parts.length > 0 ? parts.join(' · ') : JSON.stringify(payload).slice(0, 50)
}

type SystemHealthWidgetProps = {
  /** When true, render inline (e.g. in super-admin tab) without floating button; panel always open. */
  embedded?: boolean
}

export function SystemHealthWidget({ embedded = false }: SystemHealthWidgetProps = {}) {
  const [open, setOpen] = useState(embedded)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const handleEvent = useCallback((eventType: MessageBusEventType, payload: MessageBusPayload) => {
    setLogs((prev) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        time: new Date().toLocaleTimeString('es-AR', { hour12: false, second: '2-digit' }),
        eventType,
        payload,
      }
      return [entry, ...prev].slice(0, MAX_EVENTS)
    })
  }, [])

  useMessageBusAll(handleEvent)

  const clearLog = () => setLogs([])

  return (
    <>
      {!embedded && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-lg"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Cerrar monitor de eventos' : 'Abrir monitor de eventos'}
        >
          <Activity className="h-5 w-5" />
        </Button>
      )}

      {open && (
        <Card
          className={
            embedded
              ? 'w-full max-h-[500px] flex flex-col border-border'
              : 'fixed bottom-20 right-6 z-50 w-[380px] max-h-[420px] flex flex-col shadow-xl border-border'
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b">
            <span className="text-sm font-semibold">Event Bus (últimos {MAX_EVENTS})</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={clearLog} aria-label="Limpiar log">
                <Trash2 className="h-4 w-4" />
              </Button>
              {!embedded && (
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <div className={embedded ? 'overflow-y-auto max-h-[400px] p-2 space-y-1.5' : 'overflow-y-auto max-h-[340px] p-2 space-y-1.5'}>
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">
                  Esperando eventos…
                </p>
              ) : (
                logs.map((entry) => {
                  const cat = eventCategory(entry.eventType)
                  const badgeVariant =
                    cat === 'create'
                      ? 'success'
                      : cat === 'delete'
                        ? 'danger'
                        : cat === 'update'
                          ? 'info'
                          : 'secondary'
                  return (
                    <div
                      key={entry.id}
                      className="rounded-md border border-border bg-muted/30 px-2.5 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground font-mono shrink-0">
                          {entry.time}
                        </span>
                        <Badge variant={badgeVariant} className="font-mono text-[10px]">
                          {entry.eventType}
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground truncate" title={JSON.stringify(entry.payload)}>
                        {payloadSummary(entry.payload)}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
