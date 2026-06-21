import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../lib/auth/supertokens-backend'
import { requireAccountUser } from '../../lib/server/account-access'
import { prisma } from '../../lib/db'
import RepositoryListView from '../../components/repository/RepositoryListView'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Repositories | RapidMVP',
  description: 'Your uploaded repositories and their cloud installations.',
}

export default async function RepositoriesPage() {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/repositories')
  }

  const { dbUser, accountProfile } = await requireAccountUser()

  const packages = await prisma.repositoryPackage.findMany({
    where: { accountId: accountProfile.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      installations: {
        select: { readinessScore: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  const repositories = packages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    createdAt: p.createdAt,
    readinessScore: p.installations[0]?.readinessScore ?? null,
  }))

  return (
    <RepositoryListView
      email={dbUser.email}
      company={accountProfile.company}
      repositories={repositories}
    />
  )
}
