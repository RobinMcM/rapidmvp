import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'
import { requireAccountUser } from '../../../../../lib/server/account-access'
import { HttpError } from '../../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireAccountUser()
    const body = await request.json()
    const { documentId } = body as { documentId: string }

    if (!documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 })
    }

    const doc = await prisma.documentUpload.findUnique({
      where: { id: documentId },
      include: { repositoryPackage: { include: { account: true } } },
    })

    if (!doc || !doc.repositoryPackage || doc.repositoryPackage.account.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.documentUpload.update({
      where: { id: documentId },
      data: { parseStatus: 'uploaded' },
    })

    // Name the repository after the uploaded ZIP (unless already named).
    if (doc.repositoryPackage.name === 'Untitled repository') {
      await prisma.repositoryPackage.update({
        where: { id: doc.repositoryPackage.id },
        data: { name: doc.fileName.replace(/\.zip$/i, '') },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/documents/confirm]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
