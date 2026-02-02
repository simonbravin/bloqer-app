'use server'

import { revalidatePath } from 'next/cache'
import { prisma, Prisma } from '@repo/database'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { requireRole } from '@/lib/rbac'
import { uploadToR2, getDownloadUrl } from '@/lib/r2-client'
import { r2Client } from '@/lib/r2-client'
import type { UpdateUserProfileInput, UpdateOrganizationInput } from '@repo/validators'

const IMAGE_MAX_BYTES = 5 * 1024 * 1024 // 5MB
const IMAGE_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

export async function updateUserProfile(data: UpdateUserProfileInput) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: data.fullName,
        username: data.username || null,
      },
    })
    revalidatePath('/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Error al actualizar el perfil' }
  }
}

export async function updateOrganization(data: UpdateOrganizationInput) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) throw new Error('Unauthorized')
  requireRole(orgContext.role, 'ADMIN')

  try {
    await prisma.organization.update({
      where: { id: orgContext.orgId },
      data: {
        name: data.name,
        taxId: data.taxId || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
      },
    })

    const defaultTaxNum =
      typeof data.defaultTaxPct === 'string'
        ? parseFloat(data.defaultTaxPct) || 21
        : (data.defaultTaxPct ?? 21)

    await prisma.orgProfile.upsert({
      where: { orgId: orgContext.orgId },
      create: {
        orgId: orgContext.orgId,
        legalName: data.legalName || data.name,
        taxId: data.taxId || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        phone: data.phone || null,
        email: (data.email === '' || !data.email) ? null : data.email,
        website: (data.website === '' || !data.website) ? null : data.website,
        baseCurrency: data.baseCurrency || 'ARS',
        defaultTaxPct: new Prisma.Decimal(defaultTaxNum),
        documentFooterText: data.documentFooterText || null,
      },
      update: {
        legalName: data.legalName ?? undefined,
        taxId: data.taxId ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        country: data.country ?? undefined,
        phone: data.phone ?? undefined,
        email: (data.email === '' || !data.email) ? null : data.email,
        website: (data.website === '' || !data.website) ? null : data.website,
        baseCurrency: data.baseCurrency ?? undefined,
        defaultTaxPct: new Prisma.Decimal(defaultTaxNum),
        documentFooterText: data.documentFooterText ?? undefined,
      },
    })

    revalidatePath('/settings/organization')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error updating organization:', error)
    return { success: false, error: 'Error al actualizar la organización' }
  }
}

export async function uploadOrgLogo(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }
  requireRole(orgContext.role, 'ADMIN')

  const file = formData.get('logo') as File | null
  if (!file || !file.size) return { success: false, error: 'Selecciona una imagen' }
  if (file.size > IMAGE_MAX_BYTES) return { success: false, error: 'La imagen no debe superar 5 MB' }
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Formato no válido. Usa PNG, JPG, GIF o WebP' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const key = `orgs/${orgContext.orgId}/logo.${ext}`

  try {
    await uploadToR2(file, key)

    const org = await prisma.organization.findUnique({
      where: { id: orgContext.orgId },
      select: { name: true },
    })

    await prisma.orgProfile.upsert({
      where: { orgId: orgContext.orgId },
      create: {
        orgId: orgContext.orgId,
        legalName: org?.name ?? 'Organization',
        baseCurrency: 'ARS',
        defaultTaxPct: new Prisma.Decimal(21),
        logoStorageKey: key,
      },
      update: { logoStorageKey: key },
    })

    revalidatePath('/settings/organization')
    revalidatePath('/dashboard')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return { success: false, error: 'Error al subir el logo' }
  }
}

export async function removeOrgLogo() {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) return { success: false, error: 'Unauthorized' }
  requireRole(orgContext.role, 'ADMIN')

  try {
    const profile = await prisma.orgProfile.findUnique({
      where: { orgId: orgContext.orgId },
      select: { logoStorageKey: true },
    })
    if (!profile?.logoStorageKey) return { success: true }

    await prisma.orgProfile.update({
      where: { orgId: orgContext.orgId },
      data: { logoStorageKey: null },
    })

    revalidatePath('/settings/organization')
    revalidatePath('/dashboard')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error removing logo:', error)
    return { success: false, error: 'Error al quitar el logo' }
  }
}

export async function uploadUserAvatar(formData: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const file = formData.get('avatar') as File | null
  if (!file || !file.size) return { success: false, error: 'Selecciona una imagen' }
  if (file.size > IMAGE_MAX_BYTES) return { success: false, error: 'La imagen no debe superar 5 MB' }
  if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Formato no válido. Usa PNG, JPG, GIF o WebP' }
  }

  const userId = session.user.id
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const key = `users/${userId}/avatar.${ext}`

  try {
    await uploadToR2(file, key)

    const displayUrl = r2Client && process.env.R2_BUCKET_NAME
      ? `r2:${key}`
      : `/uploads/${key}`

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: displayUrl },
    })

    revalidatePath('/settings/profile')
    return { success: true }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return { success: false, error: 'Error al subir la foto' }
  }
}

/** Resolve logo URL for display from OrgProfile.logoStorageKey */
export async function resolveLogoUrl(storageKey: string | null): Promise<string | null> {
  if (!storageKey) return null
  try {
    const url = await getDownloadUrl(storageKey)
    return url.startsWith('http') || url.startsWith('/') ? url : null
  } catch {
    return null
  }
}

/** Resolve avatar URL for display (presigned when stored as r2:key) */
export async function resolveAvatarUrl(avatarUrl: string | null): Promise<string | null> {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('r2:')) {
    try {
      const url = await getDownloadUrl(avatarUrl.slice(3))
      return url.startsWith('http') || url.startsWith('/') ? url : null
    } catch {
      return null
    }
  }
  return avatarUrl.startsWith('/') || avatarUrl.startsWith('http') ? avatarUrl : null
}
