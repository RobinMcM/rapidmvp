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

    const documents = await prisma.documentUpload.findMany({
      where: { clientBlueprintId: blueprintId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { findings: true } } },
    })

    return NextResponse.json(documents)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
