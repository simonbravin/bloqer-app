/**
 * Asegura que el usuario superadmin exista y pueda entrar al portal superadmin.
 * Usuario: superadmin
 * Contraseña: SUPER_ADMIN_PASSWORD en .env, o por defecto Livestrong=15 (solo dev).
 *
 * Producción: definir SUPER_ADMIN_PASSWORD en packages/database/.env (Neon) y ejecutar:
 *   pnpm db:create-superadmin
 *
 * Desde packages/database: pnpm set-superadmin-password
 */
import bcrypt from 'bcryptjs'
import { prisma } from './client'

const USERNAME = 'superadmin'
const PLACEHOLDER_EMAIL = 'superadmin@system.internal'
const DEFAULT_PASSWORD = 'Livestrong=15'
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? DEFAULT_PASSWORD

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: USERNAME }, { email: PLACEHOLDER_EMAIL }],
    },
    select: { id: true, username: true, email: true },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        username: USERNAME,
        email: PLACEHOLDER_EMAIL,
        fullName: 'Super Administrator',
        passwordHash,
        isSuperAdmin: true,
        active: true,
      },
    })
    console.log('Super Admin actualizado.')
  } else {
    await prisma.user.create({
      data: {
        username: USERNAME,
        email: PLACEHOLDER_EMAIL,
        fullName: 'Super Administrator',
        passwordHash,
        isSuperAdmin: true,
        active: true,
      },
    })
    console.log('Super Admin creado.')
  }

  console.log('')
  console.log('Portal Super Admin:')
  console.log('  Usuario:    superadmin')
  console.log('  Contraseña: (la definida en SUPER_ADMIN_PASSWORD o Livestrong=15 por defecto)')
  console.log('  URL:        https://portal.bloqer.app/es/super-admin/login (producción)')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
