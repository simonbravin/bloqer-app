'use server'

import { redirectToLogin } from '@/lib/i18n-redirect'
import { revalidatePath } from 'next/cache'
import { prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'

async function getAuthContext() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()
  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()
  return { org }
}

export async function createSavedReport(data: {
  name: string
  description?: string
  entityType: string
  filtersJson: Record<string, unknown>
  columnsJson: string[]
  sortJson?: { key: string; direction: string }[]
  aggregationsJson?: { column: string; fn: string }[]
  visibility: 'PRIVATE' | 'SHARED'
}) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'VIEWER')

  const report = await prisma.savedReport.create({
    data: {
      orgId: org.orgId,
      name: data.name,
      description: data.description,
      entityType: data.entityType,
      filtersJson: data.filtersJson as object,
      columnsJson: data.columnsJson as object,
      sortJson: (data.sortJson ?? []) as object,
      aggregationsJson: (data.aggregationsJson ?? []) as object,
      visibility: data.visibility,
      createdByOrgMemberId: org.memberId,
    },
  })

  revalidatePath('/reports')
  return { success: true, reportId: report.id }
}

export async function runSavedReport(
  reportId: string,
  format: 'EXCEL' | 'PDF' | 'CSV',
  paramsOverride?: Record<string, unknown>
) {
  const { org } = await getAuthContext()

  const report = await prisma.savedReport.findFirst({
    where: {
      id: reportId,
      orgId: org.orgId,
      OR: [
        { visibility: 'SHARED' },
        { createdByOrgMemberId: org.memberId },
      ],
    },
  })

  if (!report) throw new Error('Report not found')

  const run = await prisma.savedReportRun.create({
    data: {
      orgId: org.orgId,
      reportId,
      requestedByOrgMemberId: org.memberId,
      format,
      status: 'COMPLETED',
      paramsOverride: (paramsOverride ?? {}) as object,
      completedAt: new Date(),
    },
  })

  revalidatePath(`/reports/${reportId}`)
  revalidatePath(`/reports/${reportId}/run`)
  return { success: true, runId: run.id }
}

export async function getReportPreview(
  entityType: string,
  filters: Record<string, string | undefined>,
  columns: string[]
) {
  const { org } = await getAuthContext()
  const { generateReportData } = await import('@/lib/report-generator')
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null && v !== '')
  )
  const data = await generateReportData(
    org.orgId,
    entityType,
    cleanFilters as Record<string, string>,
    columns
  )
  return data
}

export async function deleteSavedReport(reportId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const report = await prisma.savedReport.findFirst({
    where: { id: reportId, orgId: org.orgId },
  })
  if (!report) throw new Error('Report not found')

  await prisma.savedReport.delete({ where: { id: reportId } })
  revalidatePath('/reports')
  return { success: true }
}
