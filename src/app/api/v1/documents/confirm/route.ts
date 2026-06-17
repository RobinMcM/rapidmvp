import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../lib/server/workspace-access'
import { HttpError } from '../../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { documentId } = body as { documentId: string }

    if (!documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 })
    }

    const doc = await prisma.documentUpload.findUnique({
      where: { id: documentId },
      include: { blueprint: { include: { client: true } } },
    })

    if (!doc || doc.blueprint.client.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.documentUpload.update({
      where: { id: documentId },
      data: { parseStatus: 'uploaded' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('[POST /api/v1/documents/confirm]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
