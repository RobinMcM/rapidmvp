import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import CostsRisksView from '../../../../../components/risks/CostsRisksView'

export const runtime = 'nodejs'

export default async function CostsRisksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const [costs, risks] = await Promise.all([
    prisma.costEstimate.findMany({
      where: { clientBlueprintId: id },
      orderBy: { category: 'asc' },
    }),
    prisma.riskItem.findMany({
      where: { clientBlueprintId: id },
      orderBy: { category: 'asc' },
    }),
  ])

  return <CostsRisksView costs={costs} risks={risks} />
}
