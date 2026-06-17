import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '../../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { generateDocumentUploadUrl } from '../../../../../lib/server/spaces'
import { HttpError } from '../../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId, fileName, fileType } = body as {
      blueprintId: string
      fileName: string
      fileType: string
    }

    if (!blueprintId || !fileName || !fileType) {
      return NextResponse.json({ error: 'blueprintId, fileName, fileType required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    const documentId = randomUUID()
    const { presignedUrl, spacesKey, expiresIn, maxBytes } = await generateDocumentUploadUrl({
      blueprintId,
      documentId,
      fileName,
      fileType,
    })

    await prisma.documentUpload.create({
      data: {
        id: documentId,
        clientBlueprintId: blueprintId,
        fileName,
        fileType,
        spacesKey,
        parseStatus: 'pending',
      },
    })

    return NextResponse.json({ documentId, presignedUrl, spacesKey, expiresIn, maxBytes })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/documents/upload-url]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
