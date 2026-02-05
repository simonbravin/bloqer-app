/**
 * One-off script: set user "Bravin" org role to ADMIN.
 * Run from repo root: pnpm --filter @repo/database exec tsx src/set-bravin-admin.ts
 * Or from packages/database: npx tsx src/set-bravin-admin.ts
 */
import { prisma } from './client'

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { fullName: { contains: 'Bravin', mode: 'insensitive' } },
        { email: { contains: 'bravin', mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, fullName: true },
  })

  if (!user) {
    console.log('No user found with name or email containing "Bravin".')
    process.exit(1)
  }

  const updated = await prisma.orgMember.updateMany({
    where: { userId: user.id },
    data: { role: 'ADMIN' },
  })

  console.log(`User: ${user.fullName} (${user.email})`)
  console.log(`Updated ${updated.count} org membership(s) to role ADMIN.`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
