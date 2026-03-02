/**
 * One-off: asegura que el usuario Demo tenga una organización y org_member activo.
 * Si Demo no tiene fila en org_members, crea una org "Demo" y lo asigna como OWNER.
 *
 * Ejecutar con env de Neon (ej. .env.production.local):
 *   pnpm exec dotenv -e .env.production.local -- tsx src/ensure-demo-org.ts
 * Desde packages/database.
 */
import { prisma } from './client'

const DEMO_USERNAME = 'Demo'
const DEMO_ORG_NAME = 'Demo'

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: DEMO_USERNAME, active: true },
    select: { id: true, email: true, fullName: true },
  })
  if (!user) {
    console.log('Usuario Demo no encontrado. Nada que hacer.')
    return
  }

  const existing = await prisma.orgMember.findFirst({
    where: { userId: user.id, active: true },
    include: { organization: true },
  })
  if (existing) {
    console.log('Demo ya tiene organización:', existing.organization.name)
    return
  }

  // Crear org + perfil + member para Demo
  const slug = 'demo-' + Date.now().toString(36)
  const org = await prisma.organization.create({
    data: {
      name: DEMO_ORG_NAME,
      slug,
      active: true,
    },
  })
  await prisma.orgProfile.create({
    data: {
      orgId: org.id,
      legalName: DEMO_ORG_NAME,
      baseCurrency: 'ARS',
      defaultTaxPct: 21,
    },
  })
  await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId: user.id,
      role: 'OWNER',
      active: true,
    },
  })
  console.log('Org y org_member creados para Demo. Ya puede iniciar sesión.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
