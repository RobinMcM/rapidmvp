import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 20
const guardedAuthEndpoints = ['/signin', '/signup', '/signinup']

type RateLimitEntry = {
  count: number
  resetAt: number
}

const requestBucket = new Map<string, RateLimitEntry>()

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }

  return request.headers.get('x-real-ip') ?? 'unknown'
}

function isGuardedEndpoint(pathname: string): boolean {
  return guardedAuthEndpoints.some((segment) => pathname.includes(segment))
}

function logAuthGuardEvent(reason: string, request: NextRequest) {
  const payload = {
    event: 'auth_request_blocked',
    reason,
    path: request.nextUrl.pathname,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') ?? 'missing',
    timestamp: new Date().toISOString(),
  }

  console.warn(JSON.stringify(payload))
}

export function applyAuthRequestGuards(request: NextRequest): NextResponse | null {
  if (!isGuardedEndpoint(request.nextUrl.pathname)) {
    return null
  }

  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.trim().length < 4) {
    logAuthGuardEvent('missing_or_invalid_user_agent', request)
    return NextResponse.json({ message: 'Invalid auth request.' }, { status: 400 })
  }

  const ip = getClientIp(request)
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  const existing = requestBucket.get(key)

  if (!existing || existing.resetAt <= now) {
    requestBucket.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return null
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    logAuthGuardEvent('rate_limited', request)

    const retryAfterSeconds = Math.max(1, Math.floor((existing.resetAt - now) / 1000))
    return NextResponse.json(
      { message: 'Too many authentication attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'retry-after': String(retryAfterSeconds) },
      }
    )
  }

  existing.count += 1
  requestBucket.set(key, existing)
  return null
}
