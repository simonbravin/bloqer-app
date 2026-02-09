import { inngest } from '@/inngest/client'
import { prisma } from '@repo/database'

const BATCH_SIZE = 50

/**
 * Inngest function triggered by cron. Fetches PENDING OutboxEvents,
 * marks each as PROCESSING, logs the event, then marks COMPLETED.
 * Respects orgId isolation: events are stored with orgId for audit only;
 * processing is global (no cross-org data leakage in payload).
 */
export const eventDispatcher = inngest.createFunction(
  {
    id: 'outbox-event-dispatcher',
    name: 'Outbox Event Dispatcher',
    retries: 1,
  },
  { cron: '*/30 * * * * *' }, // every 30 seconds (Inngest cron supports 6 fields: sec min hour day month dow)
  async ({ step }) => {
    const pending = await step.run('fetch-pending-events', async () => {
      const events = await prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: BATCH_SIZE,
        select: {
          id: true,
          orgId: true,
          eventType: true,
          payload: true,
          createdAt: true,
        },
      })
      return events
    })

    if (pending.length === 0) {
      return { processed: 0 }
    }

    const processed: string[] = []
    const failed: { id: string; error: string }[] = []

    for (const event of pending) {
      const updated = await step.run(`mark-processing-${event.id}`, async () => {
        const result = await prisma.outboxEvent.updateMany({
          where: { id: event.id, status: 'PENDING' },
          data: { status: 'PROCESSING' },
        })
        return result.count
      })

      if (updated === 0) {
        continue
      }

      await step.run(`process-${event.id}`, async () => {
        try {
          // Auditoría: log del payload
          console.log('[OutboxEvent]', {
            id: event.id,
            orgId: event.orgId,
            eventType: event.eventType,
            payload: event.payload,
            createdAt: event.createdAt,
          })

          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
              errorMessage: null,
            },
          })
          processed.push(event.id)
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          failed.push({ id: event.id, error: message })
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'PENDING',
              errorMessage: message,
              retryCount: { increment: 1 },
            },
          })
        }
      })
    }

    return { processed: processed.length, processedIds: processed, failed }
  }
)
