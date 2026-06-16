import { NextRequest, NextResponse } from 'next/server'
import { HttpError, jsonError, withCors, corsPreflight } from '../../../../lib/server/http'
import { prisma } from '../../../../lib/db'

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) throw new HttpError(400, 'Invalid request body')

    const { name, company, email, projectType, teamSize, turnstileToken } = body as Record<string, string>

    if (!name?.trim())    throw new HttpError(400, 'Name is required')
    if (!company?.trim()) throw new HttpError(400, 'Company is required')
    if (!email?.trim())   throw new HttpError(400, 'Email is required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Valid email is required')

    // Cloudflare Turnstile verification (only when secret key is configured)
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (secretKey && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: turnstileToken }),
      })
      const verify = await verifyRes.json()
      if (!verify.success) throw new HttpError(400, 'Security verification failed. Please try again.')
    }

    // Persist lead — gracefully handle missing table (migration not yet run)
    try {
      await prisma.lead.create({
        data: {
          name:        name.trim(),
          company:     company.trim(),
          email:       email.trim().toLowerCase(),
          projectType: projectType?.trim() || null,
          teamSize:    teamSize?.trim()    || null,
        },
      })
    } catch (dbErr) {
      // Log but don't surface DB errors to the client — the form still succeeds
      console.error('[leads] DB insert failed:', dbErr)
    }

    return withCors(
      NextResponse.json({ ok: true }, { status: 201 }),
      request
    )
  } catch (err) {
    return jsonError(request, err)
  }
}
