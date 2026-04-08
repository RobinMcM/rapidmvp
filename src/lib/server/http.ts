import { NextRequest, NextResponse } from 'next/server'
import { authEnv } from '../auth/app-info'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function allowedOriginFromRequest(request: NextRequest) {
  const requestOrigin = request.headers.get('origin')
  if (!requestOrigin) {
    return null
  }

  return authEnv.allowedOrigins.includes(requestOrigin) ? requestOrigin : null
}

export function withCors(response: NextResponse, request: NextRequest) {
  const allowedOrigin = allowedOriginFromRequest(request)
  if (!allowedOrigin) {
    return response
  }

  response.headers.set('access-control-allow-origin', allowedOrigin)
  response.headers.set('access-control-allow-credentials', 'true')
  response.headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set(
    'access-control-allow-headers',
    'content-type,rid,fdi-version,anti-csrf,st-auth-mode,authorization'
  )
  response.headers.set('access-control-expose-headers', 'front-token,anti-csrf')
  response.headers.set('vary', 'origin')
  return response
}

export function corsPreflight(request: NextRequest) {
  const allowedOrigin = allowedOriginFromRequest(request)
  if (!allowedOrigin) {
    return NextResponse.json({ message: 'Origin not allowed' }, { status: 403 })
  }

  return withCors(new NextResponse(null, { status: 204 }), request)
}

export function jsonError(request: NextRequest, error: unknown) {
  if (error instanceof HttpError) {
    return withCors(NextResponse.json({ error: error.message }, { status: error.status }), request)
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error'
  return withCors(NextResponse.json({ error: message }, { status: 500 }), request)
}
