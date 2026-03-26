import { getAppDirRequestHandler } from 'supertokens-node/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { applyAuthRequestGuards } from '../../../../lib/auth/auth-protection'
import { authEnv } from '../../../../lib/auth/app-info'
import { ensureSuperTokensInit } from '../../../../lib/auth/supertokens-backend'

export const runtime = 'nodejs'

const handleCall = getAppDirRequestHandler()

function getAllowedOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get('origin')
  if (!requestOrigin) {
    return null
  }

  if (authEnv.allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  return null
}

function addCorsHeaders(response: Response, request: NextRequest) {
  const allowedOrigin = getAllowedOrigin(request)
  if (!allowedOrigin) {
    return response
  }

  response.headers.set('access-control-allow-origin', allowedOrigin)
  response.headers.set('access-control-allow-credentials', 'true')
  response.headers.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS')
  response.headers.set(
    'access-control-allow-headers',
    'content-type,rid,fdi-version,anti-csrf,st-auth-mode,authorization'
  )
  response.headers.set('access-control-expose-headers', 'front-token,anti-csrf')
  response.headers.set('vary', 'origin')
  return response
}

async function authHandler(request: NextRequest) {
  try {
    ensureSuperTokensInit()
    const response = await handleCall(request)
    return addCorsHeaders(response, request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown auth backend error'
    const status = message.includes('No SuperTokens core available to query') ? 503 : 500

    const response = NextResponse.json(
      {
        error: 'AUTH_BACKEND_ERROR',
        message,
      },
      { status }
    )

    return addCorsHeaders(response, request)
  }
}

export async function OPTIONS(request: NextRequest) {
  const allowedOrigin = getAllowedOrigin(request)
  if (!allowedOrigin) {
    return NextResponse.json({ message: 'Origin not allowed' }, { status: 403 })
  }

  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response, request)
}

export async function GET(request: NextRequest) {
  return authHandler(request)
}

export async function POST(request: NextRequest) {
  const guardResponse = applyAuthRequestGuards(request)
  if (guardResponse) {
    return addCorsHeaders(guardResponse, request)
  }

  return authHandler(request)
}

export async function PUT(request: NextRequest) {
  return authHandler(request)
}

export async function DELETE(request: NextRequest) {
  return authHandler(request)
}

export async function PATCH(request: NextRequest) {
  return authHandler(request)
}

export async function HEAD(request: NextRequest) {
  return authHandler(request)
}
