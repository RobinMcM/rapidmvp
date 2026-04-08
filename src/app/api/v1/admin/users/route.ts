import { SiteRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { corsPreflight, jsonError, withCors } from '../../../../../lib/server/http'
import {
  provisionUserForSite,
  requireSessionUser,
  requireSiteRole,
  resolveSiteFromRequest,
} from '../../../../../lib/server/site-access'

export const runtime = 'nodejs'

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await requireSessionUser()
    const site = await resolveSiteFromRequest(request)
    const { dbUser } = await provisionUserForSite({
      user: sessionUser,
      siteId: site.id,
    })
    await requireSiteRole({
      userId: dbUser.id,
      siteId: site.id,
      minimumRole: SiteRole.admin,
    })

    const siteUsers = await prisma.userSiteRole.findMany({
      where: { siteId: site.id },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const userIds = siteUsers.map((entry) => entry.userId)
    const profiles = await prisma.siteProfile.findMany({
      where: { siteId: site.id, userId: { in: userIds } },
    })
    const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]))

    return withCors(
      NextResponse.json({
        users: siteUsers.map((entry) => ({
          user: {
            id: entry.user.id,
            supertokensUserId: entry.user.supertokensUserId,
            email: entry.user.email,
          },
          role: {
            role: entry.role,
            status: entry.status,
          },
          profile: profileByUserId.get(entry.user.id) ?? null,
        })),
      }),
      request
    )
  } catch (error) {
    return jsonError(request, error)
  }
}
