import { prisma } from '../db'
import { requireSessionUser } from './site-access'
import { HttpError } from './http'

/**
 * Resolves the authenticated user and their AccountProfile (the owner of
 * repository packages). Creates both on first access.
 */
export async function requireAccountUser() {
  const sessionUser = await requireSessionUser()

  const dbUser = await prisma.user.upsert({
    where: { supertokensUserId: sessionUser.supertokensUserId },
    update: { email: sessionUser.email },
    create: {
      supertokensUserId: sessionUser.supertokensUserId,
      email: sessionUser.email,
    },
  })

  const accountProfile = await prisma.accountProfile.upsert({
    where: { userId: dbUser.id },
    update: {},
    create: { userId: dbUser.id },
  })

  return { sessionUser, dbUser, accountProfile }
}

/**
 * Verifies the given repository package belongs to the user and returns it.
 * Throws 404 otherwise (do not leak existence of other users' packages).
 */
export async function requireRepositoryOwnership(repositoryId: string, dbUserId: string) {
  const repository = await prisma.repositoryPackage.findUnique({
    where: { id: repositoryId },
    include: { account: true },
  })

  if (!repository || repository.account.userId !== dbUserId) {
    throw new HttpError(404, 'Repository not found')
  }

  return repository
}

/**
 * Verifies the given cloud installation belongs to the user (via its package)
 * and returns it with its package. Throws 404 otherwise.
 */
export async function requireInstallationOwnership(installationId: string, dbUserId: string) {
  const installation = await prisma.cloudInstallation.findUnique({
    where: { id: installationId },
    include: { package: { include: { account: true } } },
  })

  if (!installation || installation.package.account.userId !== dbUserId) {
    throw new HttpError(404, 'Installation not found')
  }

  return installation
}
