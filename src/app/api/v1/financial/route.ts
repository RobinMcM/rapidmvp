import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import { calculateFinancialScore } from '../../../../lib/financial/resilience-scorer'
import { generateArchitectureSummary } from '../../../../lib/ai/analysis-client'
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

    const [csvDocuments, architectureFindings, assessments] = await Promise.all([
      prisma.documentUpload.findMany({
        where: { clientBlueprintId: blueprintId, fileType: { in: ['csv', 'terraform', 'bicep', 'arm'] } },
        include: { findings: true },
      }),
      prisma.architectureFinding.findMany({ where: { clientBlueprintId: blueprintId } }),
      prisma.buildAssessment.findMany({ where: { clientBlueprintId: blueprintId }, select: { layer: true, status: true } }),
    ])

    const allParsedFindings = csvDocuments.flatMap((d) => d.findings)

    const { score, leakageItems, riskDecision } = calculateFinancialScore(
      allParsedFindings,
      architectureFindings,
      assessments
    )

    let aiSummary: string | undefined
    if (architectureFindings.length > 0) {
      aiSummary = await generateArchitectureSummary(
        architectureFindings.filter((f) => f.category.toLowerCase().includes('cost') || leakageItems.length > 0),
        blueprint.slug
      )
    }

    const riskTier = riskDecision.tier

    await prisma.financialAssessment.upsert({
      where: { clientBlueprintId: blueprintId },
      update: {
        score,
        leakageItemsJson: JSON.stringify(leakageItems),
        riskDecisionJson: JSON.stringify(riskDecision),
        aiSummary: aiSummary ?? null,
        generatedAt: new Date(),
      },
      create: {
        clientBlueprintId: blueprintId,
        score,
        leakageItemsJson: JSON.stringify(leakageItems),
        riskDecisionJson: JSON.stringify(riskDecision),
        aiSummary: aiSummary ?? null,
      },
    })

    return NextResponse.json({ score, riskTier })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('[POST /api/v1/financial]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
