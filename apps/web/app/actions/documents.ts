'use server'

import { redirectToLogin } from '@/lib/i18n-redirect'
import { revalidatePath } from 'next/cache'
import { prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import { uploadToR2, getDownloadUrl, calculateChecksum } from '@/lib/r2-client'

async function getAuthContext() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()
  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()
  return { session, org }
}

export async function createDocument(formData: FormData) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const title = formData.get('title') as string
  const docType = formData.get('docType') as string
  const category = (formData.get('category') as string) || undefined
  const description = (formData.get('description') as string) || undefined
  const projectIdRaw = formData.get('projectId') as string | null
  const projectId = projectIdRaw && projectIdRaw.trim() ? projectIdRaw : undefined
  const file = formData.get('file') as File

  if (!title || !docType || !file) {
    throw new Error('Missing required fields: title, docType, and file are required')
  }

  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 50MB)')
  }

  const checksum = await calculateChecksum(file)

  const doc = await prisma.$transaction(async (tx) => {
    const created = await tx.document.create({
      data: {
        orgId: org.orgId,
        projectId,
        title,
        docType,
        category,
        description,
        isPublic: false,
        createdByOrgMemberId: org.memberId,
      },
    })

    const storageKey = `${org.orgId}/${created.id}/1/${file.name}`
    await uploadToR2(file, storageKey)

    await tx.documentVersion.create({
      data: {
        orgId: org.orgId,
        documentId: created.id,
        versionNumber: 1,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageKey,
        checksum,
        uploadedByOrgMemberId: org.memberId,
      },
    })

    return created
  })

  revalidatePath('/documents')
  if (projectId) {
    revalidatePath(`/projects/${projectId}/documents`)
  }

  return { success: true, docId: doc.id }
}

export async function uploadNewVersion(docId: string, formData: FormData) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const file = formData.get('file') as File
  const notes = (formData.get('notes') as string) || undefined

  if (!file) throw new Error('No file provided')

  const doc = await prisma.document.findFirst({
    where: { id: docId, orgId: org.orgId },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1,
      },
    },
  })

  if (!doc) throw new Error('Document not found')
  if (doc.deleted) throw new Error('Cannot add version to deleted document')

  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 50MB)')
  }

  const nextVersion = (doc.versions[0]?.versionNumber ?? 0) + 1
  const checksum = await calculateChecksum(file)
  const storageKey = `${org.orgId}/${doc.id}/${nextVersion}/${file.name}`

  await uploadToR2(file, storageKey)

  await prisma.documentVersion.create({
    data: {
      orgId: org.orgId,
      documentId: docId,
      versionNumber: nextVersion,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      checksum,
      notes,
      uploadedByOrgMemberId: org.memberId,
    },
  })

  revalidatePath('/documents')
  revalidatePath(`/documents/${docId}`)
  if (doc.projectId) {
    revalidatePath(`/projects/${doc.projectId}/documents`)
  }
  return { success: true }
}

export async function getDocumentDownloadUrl(versionId: string) {
  const { org } = await getAuthContext()

  const version = await prisma.documentVersion.findFirst({
    where: { id: versionId, orgId: org.orgId },
    select: { storageKey: true },
  })

  if (!version) throw new Error('Version not found')

  const url = await getDownloadUrl(version.storageKey)
  return { url }
}

export async function linkDocumentToEntity(
  docId: string,
  entityType: string,
  entityId: string
) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'EDITOR')

  const doc = await prisma.document.findFirst({
    where: { id: docId, orgId: org.orgId },
  })
  if (!doc) throw new Error('Document not found')
  if (doc.deleted) throw new Error('Cannot link deleted document')

  const existing = await prisma.documentLink.findFirst({
    where: {
      documentId: docId,
      entityType,
      entityId,
    },
  })

  if (existing) return { success: true, linkId: existing.id }

  const link = await prisma.documentLink.create({
    data: {
      orgId: org.orgId,
      documentId: docId,
      entityType,
      entityId,
    },
  })

  revalidatePath(`/documents/${docId}`)
  return { success: true, linkId: link.id }
}

export async function deleteDocument(docId: string) {
  const { org } = await getAuthContext()
  requireRole(org.role, 'ADMIN')

  const doc = await prisma.document.findFirst({
    where: { id: docId, orgId: org.orgId },
  })
  if (!doc) throw new Error('Document not found')

  await prisma.document.update({
    where: { id: docId },
    data: { deleted: true },
  })

  revalidatePath('/documents')
  if (doc.projectId) {
    revalidatePath(`/projects/${doc.projectId}/documents`)
  }
  revalidatePath(`/documents/${docId}`)
  return { success: true }
}
