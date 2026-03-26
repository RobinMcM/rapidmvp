import { NextResponse } from 'next/server'
import { ensureSuperTokensInit } from '../../../../lib/auth/supertokens-backend'

export const runtime = 'nodejs'

export async function GET() {
  ensureSuperTokensInit()

  return NextResponse.json({
    ok: true,
    service: 'auth-api',
    timestamp: new Date().toISOString(),
  })
}
