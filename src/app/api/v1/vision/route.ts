import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser } from '../../../../lib/server/workspace-access'
import { generateVisionSummary } from '../../../../lib/vision/summary-generator'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { dbUser, clientProfile } = await requireWorkspaceUser()
    void dbUser

    const body = await request.json()
    const fields = {
      businessGoal: body.businessGoal ?? '',
      targetUsers: body.targetUsers ?? '',
      currentPlatform: body.currentPlatform ?? '',
      expectedGrowth: body.expectedGrowth ?? '',
      integrations: body.integrations ?? '',
      securityRequirements: body.securityRequirements ?? '',
      complianceRequirements: body.complianceRequirements ?? '',
      preferredCloud: body.preferredCloud ?? '',
      aiRequirements: body.aiRequirements ?? '',
      teamCapability: body.teamCapability ?? '',
    }

    const { generatedSummary, recommendedBlueprint } = generateVisionSummary(fields)

    const blueprint = await prisma.clientBlueprint.create({
      data: {
        clientId: clientProfile.id,
        slug: recommendedBlueprint,
        title: body.title ?? `Architecture Session — ${new Date().toLocaleDateString('en-GB')}`,
        status: 'draft',
        summary: generatedSummary,
        vision: {
          create: {
            ...fields,
            generatedSummary,
            recommendedBlueprint,
          },
        },
      },
    })

    return NextResponse.json({ blueprintId: blueprint.id })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/vision]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
