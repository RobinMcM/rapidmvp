import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import BuildAssessmentView from '../../../../../components/assessment/BuildAssessmentView'

export const runtime = 'nodejs'

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const assessments = await prisma.buildAssessment.findMany({
    where: { clientBlueprintId: id },
    orderBy: { layer: 'asc' },
  })

  return <BuildAssessmentView assessments={assessments} />
}
