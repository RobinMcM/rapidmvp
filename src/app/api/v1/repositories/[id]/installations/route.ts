import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireAccountUser, requireRepositoryOwnership } from '../../../../../../lib/server/account-access'
import { HttpError } from '../../../../../../lib/server/http'

export const runtime = 'nodejs'

const SUPPORTED_PROVIDERS = ['azure', 'aws', 'gcp'] as const
const LIVE_PROVIDERS = ['azure']

/** List cloud installations for a repository package. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { dbUser } = await requireAccountUser()
    await requireRepositoryOwnership(id, dbUser.id)

    const installations = await prisma.cloudInstallation.findMany({
      where: { repositoryPackageId: id },
      orderBy: { createdAt: 'desc' },
      include: { handoverReport: { select: { id: true, generatedAt: true } } },
    })

    return NextResponse.json(installations)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[GET /api/v1/repositories/[id]/installations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Create a cloud installation for a given provider. Azure is the only live provider. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { dbUser } = await requireAccountUser()
    await requireRepositoryOwnership(id, dbUser.id)

    const body = await request.json().catch(() => ({}))
    const { provider, environment } = body as { provider?: string; environment?: string }
    const target = provider ?? 'azure'

    if (!SUPPORTED_PROVIDERS.includes(target as (typeof SUPPORTED_PROVIDERS)[number])) {
      return NextResponse.json({ error: `Unsupported provider: ${target}` }, { status: 400 })
    }

    if (!LIVE_PROVIDERS.includes(target)) {
      return NextResponse.json({ error: `${target} installations are coming soon` }, { status: 400 })
    }

    const installation = await prisma.cloudInstallation.create({
      data: {
        repositoryPackageId: id,
        provider: target,
        environment: environment ?? null,
        status: 'draft',
      },
    })

    return NextResponse.json(installation, { status: 201 })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repositories/[id]/installations]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
