import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const blueprintId = request.nextUrl.searchParams.get('blueprintId')

    if (!blueprintId) {
      return NextResponse.json({ error: 'blueprintId required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    const assessments = await prisma.repositoryAssessment.findMany({
      where: { clientBlueprintId: blueprintId },
      orderBy: { createdAt: 'desc' },
      include: { documentUpload: { select: { id: true, fileName: true, parseStatus: true } } },
    })

    return NextResponse.json(assessments)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[GET /api/v1/repository-assessment]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId, documentUploadId, repositoryName } = body as {
      blueprintId: string
      documentUploadId: string
      repositoryName: string
    }

    if (!blueprintId || !documentUploadId || !repositoryName) {
      return NextResponse.json({ error: 'blueprintId, documentUploadId, repositoryName required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    // Verify documentUpload belongs to this blueprint
    const doc = await prisma.documentUpload.findUnique({
      where: { id: documentUploadId },
      include: { blueprint: { include: { client: true } } },
    })
    if (!doc || doc.blueprint.client.userId !== dbUser.id || doc.clientBlueprintId !== blueprintId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (doc.fileType !== 'repository_zip') {
      return NextResponse.json({ error: 'Document must be a repository_zip' }, { status: 400 })
    }

    const assessment = await prisma.repositoryAssessment.create({
      data: {
        clientBlueprintId: blueprintId,
        documentUploadId,
        repositoryName: repositoryName.replace(/\.zip$/i, ''),
        status: 'pending',
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repository-assessment]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
