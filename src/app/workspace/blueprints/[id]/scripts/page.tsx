import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import BuildScriptsView from '../../../../../components/scripts/BuildScriptsView'

export const runtime = 'nodejs'

export default async function ScriptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const scripts = await prisma.buildScript.findMany({
    where: { clientBlueprintId: id },
    orderBy: { scriptType: 'asc' },
  })

  return <BuildScriptsView scripts={scripts} />
}
