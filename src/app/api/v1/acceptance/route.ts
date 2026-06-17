import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import { generateAcceptanceReport } from '../../../../lib/acceptance/report-generator'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId } = body as { blueprintId: string }

    if (!blueprintId) {
      return NextResponse.json({ error: 'blueprintId required' }, { status: 400 })
    }

    const blueprint = await requireBlueprintOwnership(blueprintId, dbUser.id)

    const [assessments, findings] = await Promise.all([
      prisma.buildAssessment.findMany({ where: { clientBlueprintId: blueprintId }, select: { layer: true, status: true } }),
      prisma.architectureFinding.findMany({ where: { clientBlueprintId: blueprintId }, select: { category: true, severity: true, finding: true } }),
    ])

    const { categories, overallStatus } = await generateAcceptanceReport(assessments, findings, blueprint.slug)

    await prisma.acceptanceReport.upsert({
      where: { clientBlueprintId: blueprintId },
      update: {
        overallStatus,
        categoriesJson: JSON.stringify(categories),
        generatedAt: new Date(),
      },
      create: {
        clientBlueprintId: blueprintId,
        overallStatus,
        categoriesJson: JSON.stringify(categories),
      },
    })

    return NextResponse.json({ overallStatus })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('[POST /api/v1/acceptance]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
