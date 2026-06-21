import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '../../../../../lib/db'
import { requireAccountUser, requireRepositoryOwnership } from '../../../../../lib/server/account-access'
import { generateDocumentUploadUrl } from '../../../../../lib/server/spaces'
import { HttpError } from '../../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireAccountUser()
    const body = await request.json()
    const { repositoryId, fileName, fileType } = body as {
      repositoryId: string
      fileName: string
      fileType: string
    }

    if (!repositoryId || !fileName || !fileType) {
      return NextResponse.json({ error: 'repositoryId, fileName, fileType required' }, { status: 400 })
    }

    await requireRepositoryOwnership(repositoryId, dbUser.id)

    const documentId = randomUUID()
    const { presignedUrl, spacesKey, expiresIn, maxBytes } = await generateDocumentUploadUrl({
      repositoryId,
      documentId,
      fileName,
      fileType,
    })

    // A repository package owns exactly one ZIP — replace any previous upload.
    await prisma.documentUpload.deleteMany({ where: { repositoryPackageId: repositoryId } })

    await prisma.documentUpload.create({
      data: {
        id: documentId,
        repositoryPackageId: repositoryId,
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
