import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '../../../../lib/db'
import { requireAccountUser, requireRepositoryOwnership } from '../../../../lib/server/account-access'
import { HttpError } from '../../../../lib/server/http'

export const runtime = 'nodejs'

/** List the account's repository packages (latest first). */
export async function GET() {
  try {
    const { accountProfile } = await requireAccountUser()

    const repositories = await prisma.repositoryPackage.findMany({
      where: { accountId: accountProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        documentUpload: { select: { id: true, fileName: true, parseStatus: true } },
        installations: {
          select: { id: true, provider: true, status: true, readinessScore: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json(repositories)
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[GET /api/v1/repositories]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Create a repository package (the container for an uploaded ZIP). Called before
 * the ZIP upload so the upload has a package to attach to. Optionally chains a
 * new version onto a previous package via `supersedesId`.
 */
export async function POST(request: NextRequest) {
  try {
    const { dbUser, accountProfile } = await requireAccountUser()
    const body = await request.json().catch(() => ({}))
    const { name, supersedesId } = body as { name?: string; supersedesId?: string }

    let version = 1
    if (supersedesId) {
      const previous = await requireRepositoryOwnership(supersedesId, dbUser.id)
      version = previous.version + 1
    }

    const slug = `repo-${Date.now()}`

    const repository = await prisma.repositoryPackage.create({
      data: {
        id: randomUUID(),
        accountId: accountProfile.id,
        name: name?.replace(/\.zip$/i, '') || 'Untitled repository',
        slug,
        status: 'uploaded',
        version,
        supersedesId: supersedesId ?? null,
      },
    })

    return NextResponse.json({ repositoryId: repository.id }, { status: 201 })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repositories]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
