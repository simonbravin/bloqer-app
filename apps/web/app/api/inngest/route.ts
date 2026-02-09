import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { eventDispatcher } from '@/inngest/functions/event-dispatcher'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [eventDispatcher],
})
