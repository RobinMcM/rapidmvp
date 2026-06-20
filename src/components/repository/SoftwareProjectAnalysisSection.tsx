'use client'

import { useRef, useState } from 'react'
import StackSummaryCard from './StackSummaryCard'
import EnvVarsTable from './EnvVarsTable'
import AzureServicesPanel from './AzureServicesPanel'
import AdminDocumentPanel from './AdminDocumentPanel'

// ── Local types ───────────────────────────────────────────────────────────────

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

type Phase =
  | 'idle'
  | 'starting'   // creating draft blueprint
  | 'uploading'  // PUT to Spaces
  | 'confirming'
  | 'creating'   // creating RepositoryAssessment record
  | 'ready'      // waiting for user to click Inspect
  | 'inspecting'
  | 'done'
  | 'error'

// ── Component ─────────────────────────────────────────────────────────────────

export default function SoftwareProjectAnalysisSection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [result, setResult] = useState<InspectResult | null>(null)
  const [adminDoc, setAdminDoc] = useState<string | null>(null)

  // ── Upload flow ─────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.zip')) {
      setStatusMsg('Please select a .zip file exported from GitHub.')
      return
    }

    try {
      // 1. Create a draft blueprint to attach uploads to
      setPhase('starting')
      setStatusMsg('Preparing workspace…')
      const startRes = await fetch('/api/v1/repository-assessment/start', { method: 'POST' })
      if (!startRes.ok) throw new Error('Failed to prepare workspace')
      const { blueprintId } = (await startRes.json()) as { blueprintId: string }

      // 2. Get presigned URL via existing document upload system
      setPhase('uploading')
      setStatusMsg('Requesting upload URL…')
      const urlRes = await fetch('/api/v1/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId, fileName: file.name, fileType: 'repository_zip' }),
      })
      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Failed to get upload URL')
      }
      const { documentId, presignedUrl } = (await urlRes.json()) as { documentId: string; presignedUrl: string }

      // 3. PUT ZIP to Spaces
      setStatusMsg(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)…`)
      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/zip' },
      })
      if (!putRes.ok) throw new Error('Upload to storage failed')

      // 4. Confirm upload
      setPhase('confirming')
      setStatusMsg('Confirming upload…')
      const confirmRes = await fetch('/api/v1/documents/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      if (!confirmRes.ok) throw new Error('Failed to confirm upload')

      // 5. Create RepositoryAssessment record
      setPhase('creating')
      setStatusMsg('Creating analysis record…')
      const createRes = await fetch('/api/v1/repository-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId,
          documentUploadId: documentId,
          repositoryName: file.name,
        }),
      })
      if (!createRes.ok) {
        const body = await createRes.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Failed to create analysis record')
      }
      const assessment = (await createRes.json()) as { id: string }

      setAssessmentId(assessment.id)
      setPhase('ready')
      setStatusMsg(`${file.name} uploaded. Click "Inspect Project" to run the analysis.`)
    } catch (err) {
      setPhase('error')
      setStatusMsg(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  // ── Inspect flow ────────────────────────────────────────────────────────────

  async function handleInspect() {
    if (!assessmentId) return
    setPhase('inspecting')
    setStatusMsg('Inspecting project files…')

    try {
      const res = await fetch(`/api/v1/repository-assessment/${assessmentId}/inspect`, {
        method: 'POST',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Inspection failed')
      }
      const data = (await res.json()) as InspectResult
      setResult(data)
      setAdminDoc(data.adminDocumentMarkdown)
      setPhase('done')
      setStatusMsg(null)
    } catch (err) {
      setPhase('error')
      setStatusMsg(err instanceof Error ? err.message : 'Inspection failed')
    }
  }

  function handleReset() {
    setPhase('idle')
    setStatusMsg(null)
    setAssessmentId(null)
    setResult(null)
    setAdminDoc(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const isWorking = ['starting', 'uploading', 'confirming', 'creating', 'inspecting'].includes(phase)

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-1">Optional</p>
          <h2 className="text-white font-semibold text-lg">Software Project Analysis</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Upload an existing GitHub project ZIP to help RapidMVP inspect the current software stack, detect
            environment variables, identify Azure migration opportunities, review deployment readiness and generate
            architecture recommendations before selecting a blueprint.
          </p>
        </div>
        {phase === 'done' && (
          <button
            onClick={handleReset}
            className="flex-shrink-0 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Upload area — shown until done */}
      {phase !== 'done' && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-dashed border-slate-700 p-6 flex flex-col items-center gap-4 text-center">
          <p className="text-slate-500 text-xs font-mono">
            GitHub → Code → Download ZIP &nbsp;·&nbsp; Accepts .zip up to 100 MB
          </p>

          {statusMsg && (
            <p className={`text-xs font-mono ${phase === 'error' ? 'text-red-400' : 'text-azure-300'}`}>
              {statusMsg}
            </p>
          )}

          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={isWorking || phase === 'ready'}
              className="hidden"
              id="vision-repo-zip-input"
            />
            {phase === 'idle' || phase === 'error' ? (
              <label
                htmlFor="vision-repo-zip-input"
                className="px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold cursor-pointer hover:bg-azure-600 transition-colors"
              >
                Upload Git Project .zip File
              </label>
            ) : phase === 'ready' ? (
              <button
                onClick={handleInspect}
                className="px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors"
              >
                Inspect Project
              </button>
            ) : (
              <div className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-400 text-sm font-semibold">
                {statusMsg ?? 'Working…'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'done' && result && (
        <div className="flex flex-col gap-6">
          <StackSummaryCard
            repositoryName={result.detectedStack
              ? `${result.detectedStack} project`
              : 'Analysed project'}
            detectedStack={result.detectedStack}
            runtime={result.runtime}
            packageManager={result.packageManager}
            buildCommand={result.buildCommand}
            startCommand={result.startCommand}
            appType={result.appType}
            azureReadinessScore={result.azureReadinessScore}
            suitability={result.suitability}
          />

          <AzureServicesPanel
            recommendedPath={result.recommendedPath}
            suitability={result.suitability}
            services={result.services}
            blockers={result.blockers}
            risks={result.risks}
          />

          <EnvVarsTable envVars={result.envVariables} />

          {(adminDoc ?? result.adminDocumentMarkdown) && assessmentId && (
            <AdminDocumentPanel
              assessmentId={assessmentId}
              markdown={adminDoc ?? result.adminDocumentMarkdown}
              onRegenerated={(md) => setAdminDoc(md)}
            />
          )}
        </div>
      )}
    </div>
  )
}
