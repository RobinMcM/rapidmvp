import { NextRequest, NextResponse } from 'next/server'
import { corsPreflight, jsonError, withCors } from '../../../../lib/server/http'
import {
  provisionUserForSite,
  requireSessionUser,
  resolveSiteFromRequest,
} from '../../../../lib/server/site-access'

export const runtime = 'nodejs'

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await requireSessionUser()
    const site = await resolveSiteFromRequest(request)
    const { dbUser, profile, role } = await provisionUserForSite({
      user: sessionUser,
      siteId: site.id,
    })

    return withCors(
      NextResponse.json({
        user: {
          id: dbUser.id,
          supertokensUserId: dbUser.supertokensUserId,
          email: dbUser.email,
        },
        site: {
          id: site.id,
          siteKey: site.siteKey,
          primaryDomain: site.primaryDomain,
        },
        role: {
          role: role.role,
          status: role.status,
        },
        profile,
      }),
      request
    )
  } catch (error) {
    return jsonError(request, error)
  }
}
