import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import FinancialAssessmentView from '../../../../../components/financial/FinancialAssessmentView'
import RunAssessmentButton from '../../../../../components/financial/RunAssessmentButton'
import type { LeakageItem, RiskDecision } from '../../../../../lib/financial/resilience-scorer'

export const runtime = 'nodejs'

export default async function FinancialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const assessment = await prisma.financialAssessment.findUnique({
    where: { clientBlueprintId: id },
  })

  if (!assessment) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-8 text-center flex flex-col items-center gap-4">
          <h2 className="text-white font-semibold">No Financial Assessment</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Run a financial resilience assessment to generate a 0-100 score, cost leakage analysis,
            and client risk decision framework. Upload cost CSVs and IaC documents first for richer results.
          </p>
          <RunAssessmentButton blueprintId={id} />
        </div>
      </div>
    )
  }

  const leakageItems = JSON.parse(assessment.leakageItemsJson) as LeakageItem[]
  const riskDecision = JSON.parse(assessment.riskDecisionJson) as RiskDecision

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Financial Resilience Assessment</h2>
        <RunAssessmentButton blueprintId={id} />
      </div>
      <FinancialAssessmentView
        score={assessment.score}
        leakageItems={leakageItems}
        riskDecision={riskDecision}
        aiSummary={assessment.aiSummary}
        generatedAt={assessment.generatedAt}
      />
    </div>
  )
}
