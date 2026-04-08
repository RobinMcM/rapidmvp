import { NextRequest, NextResponse } from 'next/server'
import { corsPreflight, HttpError, jsonError, withCors } from '../../../../../../lib/server/http'
import {
  provisionUserForSite,
  requireSessionUser,
  resolveSiteFromRequest,
} from '../../../../../../lib/server/site-access'
import { createAvatarUploadUrl } from '../../../../../../lib/server/spaces'

export const runtime = 'nodejs'

type UploadRequestBody = {
  contentType?: string
}

export async function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as UploadRequestBody
    const contentType = payload.contentType?.trim().toLowerCase()
    if (!contentType) {
      throw new HttpError(400, 'contentType is required')
    }

    const sessionUser = await requireSessionUser()
    const site = await resolveSiteFromRequest(request)
    const { dbUser } = await provisionUserForSite({
      user: sessionUser,
      siteId: site.id,
    })

    const upload = await createAvatarUploadUrl({
      siteKey: site.siteKey,
      userId: dbUser.id,
      contentType,
    })

    return withCors(NextResponse.json(upload), request)
  } catch (error) {
    return jsonError(request, error)
  }
}
