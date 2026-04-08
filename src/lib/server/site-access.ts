import { AccessStatus, SiteRole } from '@prisma/client'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import SuperTokens from 'supertokens-node'
import { getSSRSession } from 'supertokens-node/nextjs'
import { prisma } from '../db'
import { ensureSuperTokensInit } from '../auth/supertokens-backend'
import { HttpError } from './http'

type SessionPayload = {
  sub?: string
  email?: string
}

export type AuthenticatedUser = {
  supertokensUserId: string
  email: string
}

function stripPort(hostname: string) {
  return hostname.split(':')[0] ?? hostname
}

function extractRequestHost(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost?.split(',')[0]?.trim() ?? request.headers.get('host') ?? ''
  return stripPort(host).toLowerCase()
}

function deriveDisplayName(email: string) {
  const localPart = email.split('@')[0]?.trim()
  return localPart && localPart.length > 1 ? localPart : 'New User'
}

async function resolveEmailFromSession(payload: SessionPayload, supertokensUserId: string) {
  if (payload.email && payload.email.trim()) {
    return payload.email.trim().toLowerCase()
  }

  const user = await SuperTokens.getUser(supertokensUserId)
  const recipeEmail = user?.emails?.[0]
  if (recipeEmail) {
    return recipeEmail.toLowerCase()
  }

  throw new HttpError(400, 'Could not resolve email from authenticated session')
}

export async function requireSessionUser(): Promise<AuthenticatedUser> {
  ensureSuperTokensInit()
  const cookieStore = await cookies()
  const { hasToken, error, accessTokenPayload } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    throw new HttpError(401, 'Authentication required')
  }

  const payload = (accessTokenPayload ?? {}) as SessionPayload
  const supertokensUserId = payload.sub?.trim()
  if (!supertokensUserId) {
    throw new HttpError(401, 'Invalid session payload')
  }

  const email = await resolveEmailFromSession(payload, supertokensUserId)
  return { supertokensUserId, email }
}

export async function resolveSiteFromRequest(request: NextRequest) {
  const requestHost = extractRequestHost(request)
  if (!requestHost) {
    throw new HttpError(400, 'Could not resolve request host')
  }

  const hostCandidates = requestHost.startsWith('www.') ? [requestHost, requestHost.slice(4)] : [requestHost, `www.${requestHost}`]
  const site = await prisma.site.findFirst({
    where: { primaryDomain: { in: hostCandidates } },
  })

  if (!site || !site.isActive) {
    throw new HttpError(403, `No active site configuration for host: ${requestHost}`)
  }

  return site
}

export async function provisionUserForSite(input: { user: AuthenticatedUser; siteId: string }) {
  const { user, siteId } = input
  const dbUser = await prisma.user.upsert({
    where: { supertokensUserId: user.supertokensUserId },
    update: { email: user.email },
    create: { supertokensUserId: user.supertokensUserId, email: user.email },
  })

  const profile = await prisma.siteProfile.upsert({
    where: { userId_siteId: { userId: dbUser.id, siteId } },
    update: {},
    create: {
      userId: dbUser.id,
      siteId,
      displayName: deriveDisplayName(user.email),
      bio: '',
    },
  })

  const role = await prisma.userSiteRole.upsert({
    where: { userId_siteId: { userId: dbUser.id, siteId } },
    update: {},
    create: {
      userId: dbUser.id,
      siteId,
      role: SiteRole.user,
      status: AccessStatus.active,
    },
  })

  return { dbUser, profile, role }
}

export async function requireSiteRole(input: {
  userId: string
  siteId: string
  minimumRole: SiteRole
}) {
  const roleRecord = await prisma.userSiteRole.findUnique({
    where: { userId_siteId: { userId: input.userId, siteId: input.siteId } },
  })

  if (!roleRecord || roleRecord.status !== AccessStatus.active) {
    throw new HttpError(403, 'User is not active for this site')
  }

  if (input.minimumRole === SiteRole.admin && roleRecord.role !== SiteRole.admin) {
    throw new HttpError(403, 'Admin role required')
  }

  return roleRecord
}
