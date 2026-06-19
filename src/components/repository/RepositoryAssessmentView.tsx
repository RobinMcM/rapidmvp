'use client'

import { useState } from 'react'
import RepositoryUploadPanel from './RepositoryUploadPanel'
import StackSummaryCard from './StackSummaryCard'
import EnvVarsTable from './EnvVarsTable'
import AzureServicesPanel from './AzureServicesPanel'
import AdminDocumentPanel from './AdminDocumentPanel'

type EnvVariable = {
  name: string
  classification: 'required' | 'optional' | 'public' | 'secret' | 'unknown'
  hasValue: boolean
  source: string
}

type AzureService = {
  name: string
  tier: string
  reason: string
  required: boolean
}

type Assessment = {
  id: string
  repositoryName: string
  status: string
  azureReadinessScore: number | null
  detectedStack: string | null
  runtime: string | null
  packageManager: string | null
  buildCommand: string | null
  startCommand: string | null
  appType: string | null
  envVariablesJson: string | null
  azureServicesJson: string | null
  risksJson: string | null
  recommendationsJson: string | null
  adminDocumentMarkdown: string | null
}

type Props = {
  blueprintId: string
  initialAssessment: Assessment | null
}

type InspectResult = {
  id: string
  status: string
  azureReadinessScore: number
  detectedStack: string
  runtime: string
  packageManager: string
  buildCommand: string | null
  startCommand: string | null
  appType: string
  recommendedPath: string
  suitability: string
  envVariables: EnvVariable[]
  services: AzureService[]
  blockers: string[]
  risks: string[]
  installSteps: string[]
  adminDocumentMarkdown: string
}

function parseJson<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

function formatStatus(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    pending:    { label: 'Pending',    color: 'text-slate-500' },
    inspecting: { label: 'Inspecting…', color: 'text-azure-300 animate-pulse' },
    complete:   { label: 'Complete',   color: 'text-emerald-400' },
    failed:     { label: 'Failed',     color: 'text-red-400' },
  }
  return map[status] ?? { label: status, color: 'text-slate-400' }
}

export default function RepositoryAssessmentView({ blueprintId, initialAssessment }: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(initialAssessment)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const [inspectError, setInspectError] = useState<string | null>(null)
  const [adminDoc, setAdminDoc] = useState<string | null>(initialAssessment?.adminDocumentMarkdown ?? null)

  // Parse stored JSON fields
  const envVars   = parseJson<EnvVariable[]>(assessment?.envVariablesJson ?? null, [])
  const services  = parseJson<AzureService[]>(assessment?.azureServicesJson ?? null, [])
  const risks     = parseJson<{ blockers: string[]; risks: string[] }>(assessment?.risksJson ?? null, { blockers: [], risks: [] })
  const recs      = parseJson<{ suitability: string; recommendedPath: string }>(assessment?.recommendationsJson ?? null, { suitability: 'unknown', recommendedPath: '—' })

  function handleAssessmentCreated(id: string) {
    setPendingId(id)
    // Clear any previous results shown
    setAdminDoc(null)
  }

  async function handleInspect() {
    const targetId = pendingId ?? assessment?.id
    if (!targetId) return

    setInspecting(true)
    setInspectError(null)

    try {
      const res = await fetch(`/api/v1/repository-assessment/${targetId}/inspect`, {
        method: 'POST',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Inspection failed')
      }
      const result = (await res.json()) as InspectResult

      // Update local state with full results
      setAssessment({
        id: result.id,
        repositoryName: assessment?.repositoryName ?? '',
        status: result.status,
        azureReadinessScore: result.azureReadinessScore,
        detectedStack: result.detectedStack,
        runtime: result.runtime,
        packageManager: result.packageManager,
        buildCommand: result.buildCommand,
        startCommand: result.startCommand,
        appType: result.appType,
        envVariablesJson: JSON.stringify(result.envVariables),
        azureServicesJson: JSON.stringify(result.services),
        risksJson: JSON.stringify({ blockers: result.blockers, risks: result.risks }),
        recommendationsJson: JSON.stringify({ suitability: result.suitability, recommendedPath: result.recommendedPath }),
        adminDocumentMarkdown: result.adminDocumentMarkdown,
      })
      setAdminDoc(result.adminDocumentMarkdown)
      setPendingId(null)
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Inspection failed')
    } finally {
      setInspecting(false)
    }
  }

  const showResults = assessment?.status === 'complete'
  const activeId = assessment?.id ?? null
  const statusInfo = assessment ? formatStatus(assessment.status) : null

  return (
    <div className="flex flex-col gap-8">
      {/* Upload section */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Repository ZIP Upload</h2>
        <RepositoryUploadPanel blueprintId={blueprintId} onAssessmentCreated={handleAssessmentCreated} />

        {(pendingId || assessment) && (
          <div className="mt-4 flex items-center gap-4">
            {statusInfo && (
              <span className={`text-sm font-mono ${statusInfo.color}`}>
                Status: {statusInfo.label}
              </span>
            )}
            <button
              onClick={handleInspect}
              disabled={inspecting || (!pendingId && assessment?.status === 'complete')}
              className="px-5 py-2 rounded-lg bg-azure text-white font-semibold text-sm hover:bg-azure-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inspecting ? 'Inspecting…' : pendingId ? 'Inspect Repository' : 'Re-inspect'}
            </button>
            {inspectError && (
              <span className="text-red-400 text-sm">{inspectError}</span>
            )}
          </div>
        )}
      </section>

      {/* Results */}
      {showResults && assessment && (
        <>
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Stack Detection</h2>
            <StackSummaryCard
              repositoryName={assessment.repositoryName}
              detectedStack={assessment.detectedStack}
              runtime={assessment.runtime}
              packageManager={assessment.packageManager}
              buildCommand={assessment.buildCommand}
              startCommand={assessment.startCommand}
              appType={assessment.appType}
              azureReadinessScore={assessment.azureReadinessScore ?? 0}
              suitability={recs.suitability}
            />
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Azure Recommendations</h2>
            <AzureServicesPanel
              recommendedPath={recs.recommendedPath}
              suitability={recs.suitability}
              services={services}
              blockers={risks.blockers}
              risks={risks.risks}
            />
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Environment Variables</h2>
            <EnvVarsTable envVars={envVars} />
          </section>

          {(adminDoc ?? assessment.adminDocumentMarkdown) && activeId && (
            <section>
              <h2 className="text-white font-semibold text-lg mb-4">Installation Document</h2>
              <AdminDocumentPanel
                assessmentId={activeId}
                markdown={adminDoc ?? assessment.adminDocumentMarkdown ?? ''}
                onRegenerated={(md) => setAdminDoc(md)}
              />
            </section>
          )}
        </>
      )}

      {!assessment && !pendingId && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
          <p className="text-slate-500 text-sm">Upload a repository ZIP to begin the Azure Installation Readiness Assessment.</p>
        </div>
      )}
    </div>
  )
}
