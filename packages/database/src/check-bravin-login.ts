/**
 * Diagnóstico: qué hay en la DB para el usuario Bravin (para poder iniciar sesión).
 * Ejecutar: pnpm --filter @repo/database exec tsx src/check-bravin-login.ts
 */
import bcrypt from 'bcryptjs'
import { prisma } from './client'

const PASSWORD = '123qwe123'

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: 'Bravin' },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      active: true,
      passwordHash: true,
      isSuperAdmin: true,
    },
  })

  if (!user) {
    console.log('No existe ningún usuario con username exacto "Bravin".')
    const byEmail = await prisma.user.findFirst({
      where: { email: { contains: 'bravin', mode: 'insensitive' } },
      select: { id: true, email: true, username: true, active: true },
    })
    if (byEmail) {
      console.log('Sí existe un usuario con email que contiene "bravin":', byEmail)
      console.log('Para entrar usá ese email y contraseña 123qwe123 (o ejecutá set-bravin-password).')
    }
    return
  }

  const passwordOk = user.passwordHash ? await bcrypt.compare(PASSWORD, user.passwordHash) : false
  const members = await prisma.orgMember.findMany({
    where: { userId: user.id },
    select: { id: true, orgId: true, role: true, active: true },
  })
  const orgs = await prisma.organization.findMany({
    where: { id: { in: members.map((m) => m.orgId) } },
    select: { id: true, name: true, slug: true },
  })

  console.log('--- Usuario Bravin ---')
  console.log('id:', user.id)
  console.log('email:', user.email)
  console.log('username:', user.username)
  console.log('active:', user.active)
  console.log('tiene passwordHash:', !!user.passwordHash)
  console.log('contraseña "123qwe123" coincide:', passwordOk)
  console.log('membresías en org:', members.length)
  members.forEach((m) => {
    const org = orgs.find((o) => o.id === m.orgId)
    console.log('  -', org?.name ?? m.orgId, 'role:', m.role, 'active:', m.active)
  })
  const hasActiveOrg = members.some((m) => m.active)
  console.log('tiene al menos una org activa (necesario para login):', hasActiveOrg)
  console.log('')
  console.log('Para entrar en la app usá:')
  console.log('  Usuario o Email:', user.username, 'o', user.email)
  console.log('  Contraseña: 123qwe123')
  if (!passwordOk) console.log('  ⚠ La contraseña en DB no coincide con 123qwe123. Ejecutá: pnpm --filter @repo/database set-bravin-password')
  if (!hasActiveOrg) console.log('  ⚠ Sin org activa no podés entrar. Ejecutá: pnpm --filter @repo/database set-bravin-password')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
