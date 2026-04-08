import { SiteRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../lib/db'
import { corsPreflight, HttpError, jsonError, withCors } from '../../../../../../../lib/server/http'
import {
  provisionUserForSite,
  requireSessionUser,
  requireSiteRole,
  resolveSiteFromRequest,
} from '../../../../../../../lib/server/site-access'

export const runtime = 'nodejs'

type RolePayload = {
  role?: SiteRole
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const payload = (await request.json()) as RolePayload
    if (!payload.role || (payload.role !== SiteRole.user && payload.role !== SiteRole.admin)) {
      throw new HttpError(400, 'role must be user or admin')
    }

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

    const updatedRole = await prisma.userSiteRole.update({
      where: {
        userId_siteId: {
          userId,
          siteId: site.id,
        },
      },
      data: {
        role: payload.role,
      },
    })

    return withCors(NextResponse.json({ role: updatedRole }), request)
  } catch (error) {
    return jsonError(request, error)
  }
}
