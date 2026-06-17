import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../lib/auth/supertokens-backend'
import { requireWorkspaceUser } from '../../lib/server/workspace-access'
import { prisma } from '../../lib/db'
import WorkspaceDashboard from '../../components/workspace/WorkspaceDashboard'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Workspace | RapidMVP',
  description: 'Your architecture workspace.',
}

export default async function WorkspacePage() {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/workspace')
  }

  const { dbUser, clientProfile } = await requireWorkspaceUser()

  const blueprints = await prisma.clientBlueprint.findMany({
    where: { clientId: clientProfile.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, status: true, createdAt: true },
  })

  return (
    <WorkspaceDashboard
      email={dbUser.email}
      company={clientProfile.company}
      blueprints={blueprints}
    />
  )
}
