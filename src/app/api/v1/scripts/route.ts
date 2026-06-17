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

    const scripts = await prisma.buildScript.findMany({
      where: { clientBlueprintId: blueprintId },
      orderBy: { scriptType: 'asc' },
    })

    return NextResponse.json(scripts)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type ScriptInput = {
  scriptType: string
  title: string
  content: string
  explanation?: string
  requiredSecrets?: string
  validationSteps?: string
}

export async function POST(request: NextRequest) {
  try {
    const { dbUser } = await requireWorkspaceUser()
    const body = await request.json()
    const { blueprintId, scripts } = body as { blueprintId: string; scripts: ScriptInput[] }

    if (!blueprintId || !Array.isArray(scripts)) {
      return NextResponse.json({ error: 'blueprintId and scripts required' }, { status: 400 })
    }

    await requireBlueprintOwnership(blueprintId, dbUser.id)

    await prisma.$transaction([
      prisma.buildScript.deleteMany({ where: { clientBlueprintId: blueprintId } }),
      ...scripts.map((s) =>
        prisma.buildScript.create({
          data: {
            clientBlueprintId: blueprintId,
            scriptType: s.scriptType,
            title: s.title,
            content: s.content,
            explanation: s.explanation,
            requiredSecrets: s.requiredSecrets,
            validationSteps: s.validationSteps,
          },
        })
      ),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/scripts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
