import { PrismaClient } from '@prisma/client'

// Fail fast in production if DB is not configured (avoids cryptic Prisma connection errors)
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.trim()) {
  throw new Error(
    'DATABASE_URL is required in production. Set it in Vercel (or your host) Environment Variables.'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
