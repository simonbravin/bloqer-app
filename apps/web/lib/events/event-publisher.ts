'use server'

import { prisma } from '@repo/database'
import type { Prisma } from '@repo/database'

/**
 * Transaction client type: first argument of the callback passed to prisma.$transaction.
 * Use this so the publisher can run inside an existing transaction and only commit
 * when the main mutation succeeds.
 */
export type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export type PublishOutboxEventParams = {
  orgId: string
  eventType: string
  entityType: string
  entityId: string
  payload: Record<string, unknown>
}

/**
 * Registers an event in the OutboxEvent table.
 * Must be called with a Prisma transaction client (tx) so the event is only
 * persisted if the surrounding transaction commits.
 *
 * Respects schema: org_id, event_type, payload (JSON). entityType and entityId
 * are stored inside payload for routing and filtering.
 */
export async function publishOutboxEvent(
  tx: PrismaTransaction,
  params: PublishOutboxEventParams
): Promise<void> {
  const { orgId, eventType, entityType, entityId, payload } = params

  await tx.outboxEvent.create({
    data: {
      orgId,
      eventType,
      payload: {
        entityType,
        entityId,
        ...payload,
      } as Prisma.InputJsonValue,
      status: 'PENDING',
    },
  })
}
