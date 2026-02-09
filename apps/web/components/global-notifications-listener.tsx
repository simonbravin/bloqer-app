'use client'

import { useMessageBus } from '@/hooks/use-message-bus'
import { toast } from 'sonner'

/** Milestone events only — no high-frequency updates (e.g. WBS moves). */
const MILESTONE_MESSAGES: Record<string, string> = {
  'PROJECT.CREATED': 'Proyecto creado exitosamente.',
  'BUDGET_VERSION.APPROVED': '✅ Versión de presupuesto aprobada.',
  'CERTIFICATION.ISSUED': '📄 Certificación emitida.',
  'ORG_MEMBER.INVITED': '✉️ Invitación enviada al usuario.',
  'DOCUMENT.UPLOADED': 'Documento subido correctamente.',
  'FINANCE_TRANSACTION.CREATED': 'Transacción registrada.',
}

/**
 * Listens to milestone message-bus events and shows a toast.
 * Mount once in RootLayout (no visible UI).
 */
export function GlobalNotificationsListener() {
  useMessageBus('PROJECT.CREATED', () => {
    toast.success(MILESTONE_MESSAGES['PROJECT.CREATED'])
  })
  useMessageBus('BUDGET_VERSION.APPROVED', () => {
    toast.success(MILESTONE_MESSAGES['BUDGET_VERSION.APPROVED'])
  })
  useMessageBus('CERTIFICATION.ISSUED', () => {
    toast.success(MILESTONE_MESSAGES['CERTIFICATION.ISSUED'])
  })
  useMessageBus('ORG_MEMBER.INVITED', () => {
    toast.success(MILESTONE_MESSAGES['ORG_MEMBER.INVITED'])
  })
  useMessageBus('DOCUMENT.UPLOADED', () => {
    toast.success(MILESTONE_MESSAGES['DOCUMENT.UPLOADED'])
  })
  useMessageBus('FINANCE_TRANSACTION.CREATED', () => {
    toast.success(MILESTONE_MESSAGES['FINANCE_TRANSACTION.CREATED'])
  })

  return null
}
