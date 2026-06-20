import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../lib/server/workspace-access'
import { HttpError } from '../../../../../lib/server/http'

export const runtime = 'nodejs'

/**
 * Creates a draft ClientBlueprint scoped to repository analysis.
 * Called before the ZIP upload so the upload has a blueprint to attach to.
 * The draft blueprint can be promoted later when the Vision Workflow is completed.
 */
export async function POST() {
  try {
    const { clientProfile } = await requireWorkspaceUser()

    const slug = `repo-analysis-${Date.now()}`

    const blueprint = await prisma.clientBlueprint.create({
      data: {
        id: randomUUID(),
        clientId: clientProfile.id,
        slug,
        title: 'Software Project Analysis',
        status: 'repository_analysis',
      },
    })

    return NextResponse.json({ blueprintId: blueprint.id }, { status: 201 })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repository-assessment/start]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
