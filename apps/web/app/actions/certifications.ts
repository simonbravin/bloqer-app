'use server'

import { redirectToLogin } from '@/lib/i18n-redirect'
import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import crypto from 'crypto'

async function getAuthContext() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()
  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()
  return { session, org }
}

async function generateCertNumber(projectId: string): Promise<number> {
  const lastCert = await prisma.certification.findFirst({
    where: { projectId },
    orderBy: { number: 'desc' },
    select: { number: true },
  })
  return (lastCert?.number ?? 0) + 1
}

async function calculatePrevProgress(
  budgetLineId: string,
  currentPeriod: { month: number; year: number }
) {
  const prevCerts = await prisma.certificationLine.findMany({
    where: {
      budgetLineId,
      certification: {
        status: 'APPROVED',
        OR: [
          { periodYear: { lt: currentPeriod.year } },
          {
            AND: [
              { periodYear: currentPeriod.year },
              { periodMonth: { lt: currentPeriod.month } },
            ],
          },
        ],
      },
    },
    select: {
      periodQty: true,
      periodAmount: true,
      periodProgressPct: true,
    },
  })

  const prevQty = prevCerts.reduce((sum, l) => sum.add(l.periodQty), new Prisma.Decimal(0))
  const prevAmount = prevCerts.reduce((sum, l) => sum.add(l.periodAmount), new Prisma.Decimal(0))
  const prevPct = prevCerts.reduce((sum, l) => sum.add(l.periodProgressPct), new Prisma.Decimal(0))

  return { prevQty, prevAmount, prevPct }
}

export async function createCertification(
  projectId: string,
  data: {
    periodMonth: number
    periodYear: number
    budgetVersionId: string
    notes?: string
  }
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: org.orgId },
  })
  if (!project) throw new Error('Project not found')

  const existing = await prisma.certification.findFirst({
    where: {
      projectId,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
    },
  })
  if (existing) {
    throw new Error('Certification for this period already exists')
  }

  const number = await generateCertNumber(projectId)

  const cert = await prisma.certification.create({
    data: {
      orgId: org.orgId,
      projectId,
      budgetVersionId: data.budgetVersionId,
      number,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      status: 'DRAFT',
      notes: data.notes,
    },
  })

  revalidatePath(`/projects/${projectId}/certifications`)
  return { success: true, certId: cert.id }
}

export async function addCertificationLine(
  certId: string,
  data: {
    wbsNodeId: string
    budgetLineId: string
    periodProgressPct: number
  }
) {
  const { org } = await getAuthContext()

  const cert = await prisma.certification.findFirst({
    where: { id: certId, orgId: org.orgId, status: 'DRAFT' },
  })
  if (!cert) throw new Error('Certification not found or not editable')

  const budgetLine = await prisma.budgetLine.findUnique({
    where: { id: data.budgetLineId },
    select: {
      quantity: true,
      salePriceTotal: true,
    },
  })
  if (!budgetLine) throw new Error('Budget line not found')

  const contractualQty = budgetLine.quantity
  const unitPrice =
    contractualQty.greaterThan(0) ? budgetLine.salePriceTotal.div(contractualQty) : new Prisma.Decimal(0)

  const { prevQty, prevAmount, prevPct } = await calculatePrevProgress(data.budgetLineId, {
    month: cert.periodMonth,
    year: cert.periodYear,
  })

  const periodProgressPct = new Prisma.Decimal(data.periodProgressPct)
  const totalProgressPct = prevPct.add(periodProgressPct)

  if (totalProgressPct.greaterThan(100)) {
    throw new Error('Total progress cannot exceed 100%')
  }

  const periodQty = contractualQty.mul(periodProgressPct).div(100)
  const totalQty = prevQty.add(periodQty)
  const remainingQty = contractualQty.sub(totalQty)

  const periodAmount = periodQty.mul(unitPrice)
  const totalAmount = prevAmount.add(periodAmount)

  await prisma.certificationLine.create({
    data: {
      orgId: org.orgId,
      certificationId: certId,
      wbsNodeId: data.wbsNodeId,
      budgetLineId: data.budgetLineId,
      prevProgressPct: prevPct,
      periodProgressPct,
      totalProgressPct,
      contractualQtySnapshot: contractualQty,
      unitPriceSnapshot: unitPrice,
      prevQty,
      periodQty,
      totalQty,
      remainingQty,
      prevAmount,
      periodAmount,
      totalAmount,
    },
  })

  revalidatePath(`/projects/${cert.projectId}/certifications`)
  revalidatePath(`/projects/${cert.projectId}/certifications/${certId}`)
  return { success: true }
}

export async function deleteCertificationLine(lineId: string) {
  const { org } = await getAuthContext()

  const line = await prisma.certificationLine.findFirst({
    where: { id: lineId, orgId: org.orgId },
    include: {
      certification: { select: { projectId: true, status: true } },
    },
  })
  if (!line) throw new Error('Line not found')
  if (line.certification.status !== 'DRAFT') {
    throw new Error('Cannot delete line from issued or approved certification')
  }

  await prisma.certificationLine.delete({
    where: { id: lineId },
  })

  revalidatePath(`/projects/${line.certification.projectId}/certifications`)
  revalidatePath(`/projects/${line.certification.projectId}/certifications/${line.certificationId}`)
  return { success: true }
}

export async function issueCertification(certId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const cert = await prisma.certification.findFirst({
    where: { id: certId, orgId: org.orgId, status: 'DRAFT' },
    include: { lines: true },
  })

  if (!cert) throw new Error('Certification not found')
  if (cert.lines.length === 0) throw new Error('Cannot issue empty certification')

  const data = JSON.stringify({
    id: cert.id,
    number: cert.number,
    period: { month: cert.periodMonth, year: cert.periodYear },
    lines: cert.lines.map((l) => ({
      wbsNodeId: l.wbsNodeId,
      budgetLineId: l.budgetLineId,
      periodQty: l.periodQty.toString(),
      unitPrice: l.unitPriceSnapshot.toString(),
      periodAmount: l.periodAmount.toString(),
    })),
  })
  const integritySeal = crypto.createHash('sha256').update(data).digest('hex')

  await prisma.certification.update({
    where: { id: certId },
    data: {
      status: 'ISSUED',
      integritySeal,
      issuedByOrgMemberId: org.memberId,
      issuedAt: new Date(),
      issuedDate: new Date(),
    },
  })

  revalidatePath(`/projects/${cert.projectId}/certifications`)
  revalidatePath(`/projects/${cert.projectId}/certifications/${certId}`)
  return { success: true }
}

export async function getCertification(certId: string) {
  const { org } = await getAuthContext()
  const cert = await prisma.certification.findFirst({
    where: { id: certId, orgId: org.orgId },
    include: {
      issuedBy: { select: { user: { select: { fullName: true } } } },
      approvedBy: { select: { user: { select: { fullName: true } } } },
      lines: {
        include: {
          wbsNode: { select: { code: true, name: true } },
          budgetLine: { select: { description: true } },
        },
      },
    },
  })
  return cert
}

export async function getBudgetLinesForCert(budgetVersionId: string) {
  const { org } = await getAuthContext()
  const lines = await prisma.budgetLine.findMany({
    where: {
      budgetVersionId,
      budgetVersion: { orgId: org.orgId },
    },
    include: {
      wbsNode: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ wbsNode: { code: 'asc' } }, { sortOrder: 'asc' }],
  })
  return lines
}

export async function approveCertification(certId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const cert = await prisma.certification.findFirst({
    where: { id: certId, orgId: org.orgId, status: 'ISSUED' },
  })

  if (!cert) throw new Error('Certification not found or not issued')

  await prisma.certification.update({
    where: { id: certId },
    data: {
      status: 'APPROVED',
      approvedByOrgMemberId: org.memberId,
      approvedAt: new Date(),
    },
  })

  revalidatePath(`/projects/${cert.projectId}/certifications`)
  revalidatePath(`/projects/${cert.projectId}/certifications/${certId}`)
  return { success: true }
}
