import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 *
 * On Vercel serverless functions, we must reuse the client across warm invocations.
 * On local dev, we stash it on globalThis to avoid exhausting connections during HMR.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
