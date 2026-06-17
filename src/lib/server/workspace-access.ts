import { prisma } from '../db'
import { requireSessionUser } from './site-access'
import { HttpError } from './http'

export async function requireWorkspaceUser() {
  const sessionUser = await requireSessionUser()

  const dbUser = await prisma.user.upsert({
    where: { supertokensUserId: sessionUser.supertokensUserId },
    update: { email: sessionUser.email },
    create: {
      supertokensUserId: sessionUser.supertokensUserId,
      email: sessionUser.email,
    },
  })

  const clientProfile = await prisma.clientProfile.upsert({
    where: { userId: dbUser.id },
    update: {},
    create: { userId: dbUser.id },
  })

  return { sessionUser, dbUser, clientProfile }
}

export async function requireBlueprintOwnership(blueprintId: string, dbUserId: string) {
  const blueprint = await prisma.clientBlueprint.findUnique({
    where: { id: blueprintId },
    include: { client: true },
  })

  if (!blueprint || blueprint.client.userId !== dbUserId) {
    throw new HttpError(404, 'Blueprint not found')
  }

  return blueprint
}
