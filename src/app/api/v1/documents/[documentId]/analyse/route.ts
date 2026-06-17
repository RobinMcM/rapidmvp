import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../../lib/server/workspace-access'
import { analyseDocumentFindings } from '../../../../../../lib/ai/analysis-client'
import { HttpError } from '../../../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params
    const { dbUser } = await requireWorkspaceUser()

    const doc = await prisma.documentUpload.findUnique({
      where: { id: documentId },
      include: {
        blueprint: { include: { client: true } },
        findings: true,
      },
    })

    if (!doc || doc.blueprint.client.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (doc.findings.length === 0) {
      return NextResponse.json({ error: 'Parse the document before analysing' }, { status: 422 })
    }

    const analysisResults = await analyseDocumentFindings(
      doc.findings,
      doc.fileType,
      doc.blueprint.slug
    )

    await prisma.$transaction([
      prisma.architectureFinding.deleteMany({
        where: { documentUploadId: documentId },
      }),
      ...analysisResults.map((r) =>
        prisma.architectureFinding.create({
          data: {
            clientBlueprintId: doc.clientBlueprintId,
            documentUploadId: documentId,
            category: r.category,
            severity: r.severity,
            finding: r.finding,
            recommendation: r.recommendation,
            aiGenerated: true,
          },
        })
      ),
    ])

    return NextResponse.json({ findingsCount: analysisResults.length })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('[POST /api/v1/documents/[documentId]/analyse]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
