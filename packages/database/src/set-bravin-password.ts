/**
 * Asegura que el usuario "Bravin" pueda entrar con contraseña 123qwe123.
 * - Si existe (por username o email con "bravin"): actualiza contraseña y username a "Bravin".
 * - Si no existe: crea usuario Bravin + org por defecto.
 * Ejecutar desde repo root: pnpm --filter @repo/database set-bravin-password
 * O desde packages/database: pnpm set-bravin-password
 */
import bcrypt from 'bcryptjs'
import { prisma } from './client'

const USERNAME = 'Bravin'
const PASSWORD = '123qwe123'
const DEFAULT_EMAIL = 'bravin@dev.local'

/** Actualiza contraseña y asegura que el usuario tenga al menos una org activa (requerido por NextAuth signIn callback). */
async function ensurePasswordAndOrg(userId: string) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, active: true },
  })
  const hasMember = await prisma.orgMember.findFirst({
    where: { userId, active: true },
    select: { id: true },
  })
  if (hasMember) return
  const org = await prisma.organization.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' } })
  if (!org) {
    console.warn('Aviso: no hay ninguna organización activa. El login puede fallar hasta que el usuario tenga org.')
    return
  }
  await prisma.orgMember.create({
    data: { orgId: org.id, userId, role: 'OWNER', active: true },
  })
  console.log(`Usuario agregado a la organización "${org.name}" (sin org no se puede iniciar sesión).`)
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // Primero el que tiene username "Bravin" (así entra con "Bravin" en el login)
  let user = await prisma.user.findFirst({
    where: { username: USERNAME },
    select: { id: true, email: true, username: true, fullName: true, active: true },
  })

  if (user) {
    await ensurePasswordAndOrg(user.id)
    console.log(`Usuario actualizado: ${user.fullName ?? user.email} (username: ${user.username})`)
    console.log(`Contraseña: ${PASSWORD}`)
    console.log('Podés entrar con: Usuario "Bravin" y contraseña 123qwe123')
    return
  }

  // Si no hay usuario "Bravin", buscar por email y solo actualizar contraseña (no username)
  user = await prisma.user.findFirst({
    where: { email: { contains: 'bravin', mode: 'insensitive' } },
    select: { id: true, email: true, username: true, fullName: true, active: true },
  })

  if (user) {
    await ensurePasswordAndOrg(user.id)
    console.log(`Usuario actualizado: ${user.fullName ?? user.email} (email: ${user.email})`)
    console.log(`Contraseña: ${PASSWORD}`)
    console.log(`Podés entrar con: Email "${user.email}" o usuario "${user.username}" y contraseña 123qwe123`)
    return
  }

  // Crear usuario + org por defecto
  const org = await prisma.organization.findFirst({ where: { slug: 'dev-org' } })
  if (!org) {
    console.log('No hay organización dev-org. Ejecutá primero: pnpm --filter @repo/database db:seed')
    process.exit(1)
  }

  const created = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: {
        email: DEFAULT_EMAIL,
        username: USERNAME,
        fullName: 'Bravin',
        passwordHash,
        active: true,
      },
    })
    await tx.orgMember.create({
      data: { orgId: org.id, userId: u.id, role: 'OWNER', active: true },
    })
    return u
  })

  console.log(`Usuario creado: ${created.email} (username: ${USERNAME})`)
  console.log(`Contraseña: ${PASSWORD}`)
  console.log('Podés entrar con: Usuario "Bravin" y contraseña 123qwe123')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
