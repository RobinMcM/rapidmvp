import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

type CostInput = {
  category: string
  costLevel?: string
  costDriver?: string
  notes?: string
  optimisation?: string
}

type RiskInput = {
  category: string
  severity?: string
  likelihood?: string
  mitigation?: string
  owner?: string
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId, costs, risks } = body as {
      blueprintId: string
      costs: CostInput[]
      risks: RiskInput[]
    }

    if (!blueprintId) {
      return NextResponse.json({ error: 'blueprintId required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    await prisma.$transaction([
      prisma.costEstimate.deleteMany({ where: { clientBlueprintId: blueprintId } }),
      prisma.riskItem.deleteMany({ where: { clientBlueprintId: blueprintId } }),
      ...((costs ?? []).map((c) =>
        prisma.costEstimate.create({
          data: {
            clientBlueprintId: blueprintId,
            category: c.category,
            costLevel: c.costLevel,
            costDriver: c.costDriver,
            notes: c.notes,
            optimisation: c.optimisation,
          },
        })
      )),
      ...((risks ?? []).map((r) =>
        prisma.riskItem.create({
          data: {
            clientBlueprintId: blueprintId,
            category: r.category,
            severity: r.severity,
            likelihood: r.likelihood,
            mitigation: r.mitigation,
            owner: r.owner,
          },
        })
      )),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/costs-risks]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
