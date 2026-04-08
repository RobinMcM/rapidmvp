import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { corsPreflight, HttpError, jsonError, withCors } from '../../../../../lib/server/http'
import {
  provisionUserForSite,
  requireSessionUser,
  resolveSiteFromRequest,
} from '../../../../../lib/server/site-access'

export const runtime = 'nodejs'

type ProfilePayload = {
  displayName?: string
  bio?: string
  avatarUrl?: string
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = (await request.json()) as ProfilePayload
    if (!payload || typeof payload !== 'object') {
      throw new HttpError(400, 'Invalid profile payload')
    }

    const sessionUser = await requireSessionUser()
    const site = await resolveSiteFromRequest(request)
    const { dbUser } = await provisionUserForSite({
      user: sessionUser,
      siteId: site.id,
    })

    const updateData: Record<string, string> = {}
    if (typeof payload.displayName === 'string') {
      updateData.displayName = payload.displayName.trim().slice(0, 80)
    }
    if (typeof payload.bio === 'string') {
      updateData.bio = payload.bio.trim().slice(0, 280)
    }
    if (typeof payload.avatarUrl === 'string') {
      updateData.avatarUrl = payload.avatarUrl.trim()
    }

    if (Object.keys(updateData).length === 0) {
      throw new HttpError(400, 'No profile fields to update')
    }

    const profile = await prisma.siteProfile.update({
      where: {
        userId_siteId: {
          userId: dbUser.id,
          siteId: site.id,
        },
      },
      data: updateData,
    })

    return withCors(NextResponse.json({ profile }), request)
  } catch (error) {
    return jsonError(request, error)
  }
}
