import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import AcceptanceReportView from '../../../../../components/acceptance/AcceptanceReportView'
import GenerateReportButton from '../../../../../components/acceptance/GenerateReportButton'
import type { AcceptanceCategoryResult } from '../../../../../types/acceptance'

export const runtime = 'nodejs'

export default async function AcceptancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  await requireBlueprintOwnership(id, dbUser.id)

  const report = await prisma.acceptanceReport.findUnique({
    where: { clientBlueprintId: id },
  })

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-8 text-center flex flex-col items-center gap-4">
          <h2 className="text-white font-semibold">No Acceptance Report</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Generate an acceptance report to validate your architecture across 15 test categories.
            The report uses your assessment layers and document findings.
          </p>
          <GenerateReportButton blueprintId={id} />
        </div>
      </div>
    )
  }

  const categories = JSON.parse(report.categoriesJson) as AcceptanceCategoryResult[]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Acceptance Report</h2>
        <GenerateReportButton blueprintId={id} />
      </div>
      <AcceptanceReportView
        overallStatus={report.overallStatus}
        categories={categories}
        generatedAt={report.generatedAt}
      />
    </div>
  )
}
