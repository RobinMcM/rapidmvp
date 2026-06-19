import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import RepositoryAssessmentView from '../../../../../components/repository/RepositoryAssessmentView'

export const runtime = 'nodejs'

export default async function RepositoryInstallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const latestAssessment = await prisma.repositoryAssessment.findFirst({
    where: { clientBlueprintId: id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <RepositoryAssessmentView
      blueprintId={id}
      initialAssessment={latestAssessment}
    />
  )
}
