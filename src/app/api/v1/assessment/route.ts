import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

type LayerInput = {
  layer: string
  status?: string
  description?: string
  tasksJson?: string
  validationJson?: string
  evidenceNotes?: string
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId, layers } = body as { blueprintId: string; layers: LayerInput[] }

    if (!blueprintId || !Array.isArray(layers)) {
      return NextResponse.json({ error: 'blueprintId and layers required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    for (const l of layers) {
      const existing = await prisma.buildAssessment.findFirst({
        where: { clientBlueprintId: blueprintId, layer: l.layer },
        select: { id: true },
      })

      if (existing) {
        await prisma.buildAssessment.update({
          where: { id: existing.id },
          data: {
            status: l.status ?? 'planned',
            description: l.description,
            tasksJson: l.tasksJson,
            validationJson: l.validationJson,
            evidenceNotes: l.evidenceNotes,
          },
        })
      } else {
        await prisma.buildAssessment.create({
          data: {
            clientBlueprintId: blueprintId,
            layer: l.layer,
            status: l.status ?? 'planned',
            description: l.description,
            tasksJson: l.tasksJson,
            validationJson: l.validationJson,
            evidenceNotes: l.evidenceNotes,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/assessment]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
