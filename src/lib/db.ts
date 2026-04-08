import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (runtimeEnv.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
