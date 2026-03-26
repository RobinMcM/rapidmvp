import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/account']

export function proxy(req: NextRequest) {
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  const hasAccessTokenCookie = Boolean(req.cookies.get('sAccessToken')?.value)
  if (hasAccessTokenCookie) {
    return NextResponse.next()
  }

  const authUrl = new URL('/auth', req.url)
  authUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
  return NextResponse.redirect(authUrl)
}

export const config = {
  matcher: ['/account/:path*'],
}
