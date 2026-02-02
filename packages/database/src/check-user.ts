/**
 * One-off: busca usuarios por email.
 * Uso: pnpm exec tsx src/check-user.ts (desde packages/database)
 */
import { prisma } from './client'

const EMAILS = [
  'simon@visionbuildingtechs.com',
  'bravin.simon@gmail.com',
]

async function main() {
  for (const email of EMAILS) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        active: true,
        createdAt: true,
      },
    })
    if (user) {
      console.log('Usuario encontrado:', JSON.stringify(user, null, 2))
    } else {
      console.log('No encontrado:', email)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
