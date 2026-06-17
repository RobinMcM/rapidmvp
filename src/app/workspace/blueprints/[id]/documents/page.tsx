import { requireWorkspaceUser, requireBlueprintOwnership } from '../../../../../lib/server/workspace-access'
import { prisma } from '../../../../../lib/db'
import { generateArchitectureSummary } from '../../../../../lib/ai/analysis-client'
import DocumentUploadPanel from '../../../../../components/documents/DocumentUploadPanel'
import ArchitectureSummaryPanel from '../../../../../components/documents/ArchitectureSummaryPanel'

export const runtime = 'nodejs'

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  const blueprint = await requireBlueprintOwnership(id, dbUser.id)

  const [documents, architectureFindings] = await Promise.all([
    prisma.documentUpload.findMany({
      where: { clientBlueprintId: id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { findings: true } } },
    }),
    prisma.architectureFinding.findMany({
      where: { clientBlueprintId: id },
      orderBy: { category: 'asc' },
    }),
  ])

  let aiSummary: string | undefined
  if (architectureFindings.length > 0) {
    aiSummary = await generateArchitectureSummary(architectureFindings, blueprint.slug)
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Document Uploads</h2>
        <DocumentUploadPanel blueprintId={id} initialDocuments={documents} />
      </section>

      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Architecture Findings</h2>
        <ArchitectureSummaryPanel findings={architectureFindings} aiSummary={aiSummary} />
      </section>
    </div>
  )
}
