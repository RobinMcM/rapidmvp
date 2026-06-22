'use client'

import { useState } from 'react'
import StackSummaryCard from './StackSummaryCard'
import EnvVarsTable from './EnvVarsTable'
import AzureServicesPanel from './AzureServicesPanel'
import HandoverReportPanel from './HandoverReportPanel'
import ConsistencyPanel from './ConsistencyPanel'
import ArchitectureOverviewTab from '../architecture/ArchitectureOverviewTab'
import ArchitectureGraphTab from '../architecture/ArchitectureGraphTab'
import type { ConsistencyReport } from '../../lib/repository/consistency-checker'
import type { ArchitectureModel } from '../../lib/repository/architecture-model'

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

type SecretMapping = { name: string; target: string; reference: string }

export type RepositoryDetail = {
  repositoryId: string
  name: string
  status: string
  detectedStack: string | null
  runtime: string | null
  packageManager: string | null
  buildCommand: string | null
  startCommand: string | null
  appType: string | null
  architecture: ArchitectureModel | null
  envVariables: EnvVariable[]
  consistency: ConsistencyReport | null
  // installation (Azure)
  installationId: string | null
  readinessScore: number | null
  suitability: string
  recommendedPath: string
  services: AzureService[]
  blockers: string[]
  risks: string[]
  installSteps: string[]
  secretsMapping: SecretMapping[]
  // handover report
  stakeholderMarkdown: string | null
  engineerMarkdown: string | null
}

type Tab = 'delivered' | 'consistency' | 'architecture' | 'installation' | 'handover' | 'architecture-graph'

const TABS: { key: Tab; label: string }[] = [
  { key: 'delivered', label: 'Delivered' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'architecture', label: 'Architecture Overview' },
  { key: 'installation', label: 'Cloud Installation' },
  { key: 'handover', label: 'Handover Report' },
  { key: 'architecture-graph', label: 'Architecture' },
]

export default function RepositoryDetailView({ initial }: { initial: RepositoryDetail }) {
  const [detail, setDetail] = useState<RepositoryDetail>(initial)
  const [tab, setTab] = useState<Tab>('delivered')
  const [inspecting, setInspecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isInspected = detail.status === 'inspected'

  async function handleInspect() {
    setInspecting(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/repositories/${detail.repositoryId}/inspect`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Inspection failed')
      }
      const data = (await res.json()) as {
        installationId: string
        readinessScore: number
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
        secretsMapping: SecretMapping[]
        blockers: string[]
        risks: string[]
        installSteps: string[]
        consistency: ConsistencyReport
        architecture: ArchitectureModel | null
      }
      setDetail((d) => ({
        ...d,
        status: 'inspected',
        consistency: data.consistency,
        architecture: data.architecture,
        installationId: data.installationId,
        readinessScore: data.readinessScore,
        detectedStack: data.detectedStack,
        runtime: data.runtime,
        packageManager: data.packageManager,
        buildCommand: data.buildCommand,
        startCommand: data.startCommand,
        appType: data.appType,
        recommendedPath: data.recommendedPath,
        suitability: data.suitability,
        envVariables: data.envVariables,
        services: data.services,
        secretsMapping: data.secretsMapping,
        blockers: data.blockers,
        risks: data.risks,
        installSteps: data.installSteps,
        // a fresh inspection invalidates any previous report
        stakeholderMarkdown: null,
        engineerMarkdown: null,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inspection failed')
    } finally {
      setInspecting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Inspect bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 rounded-lg bg-slate-900/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t.key ? 'bg-azure text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-400 text-sm">{error}</span>}
          <button
            onClick={handleInspect}
            disabled={inspecting}
            className="px-5 py-2 rounded-lg bg-azure text-white font-semibold text-sm hover:bg-azure-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inspecting ? 'Inspecting…' : isInspected ? 'Re-inspect' : 'Inspect repository'}
          </button>
        </div>
      </div>

      {!isInspected && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
          <p className="text-slate-400 text-sm">
            This repository has not been inspected yet. Click <span className="text-azure-300">Inspect repository</span> to
            detect its stack, environment variables, and cloud installation requirements.
          </p>
        </div>
      )}

      {isInspected && tab === 'delivered' && (
        <div className="flex flex-col gap-6">
          <StackSummaryCard
            repositoryName={detail.name}
            detectedStack={detail.detectedStack}
            runtime={detail.runtime}
            packageManager={detail.packageManager}
            buildCommand={detail.buildCommand}
            startCommand={detail.startCommand}
            appType={detail.appType}
            showScore={false}
          />
          <EnvVarsTable envVars={detail.envVariables} />
        </div>
      )}

      {isInspected && tab === 'consistency' && (
        <ConsistencyPanel report={detail.consistency} />
      )}

      {isInspected && tab === 'architecture' && (
        <ArchitectureOverviewTab model={detail.architecture} />
      )}

      {isInspected && tab === 'installation' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Target cloud</p>
              <p className="text-white font-semibold">Microsoft Azure</p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-400">
              AWS &amp; Google Cloud — coming soon
            </span>
          </div>

          {typeof detail.readinessScore === 'number' && (
            <StackSummaryCard
              repositoryName={detail.name}
              detectedStack={detail.detectedStack}
              runtime={detail.runtime}
              packageManager={detail.packageManager}
              buildCommand={detail.buildCommand}
              startCommand={detail.startCommand}
              appType={detail.appType}
              azureReadinessScore={detail.readinessScore}
              suitability={detail.suitability}
            />
          )}

          <AzureServicesPanel
            recommendedPath={detail.recommendedPath}
            suitability={detail.suitability}
            services={detail.services}
            blockers={detail.blockers}
            risks={detail.risks}
          />

          {detail.secretsMapping.length > 0 && (
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800">
                <span className="text-slate-300 font-semibold text-sm">Secrets &amp; Configuration Mapping</span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {detail.secretsMapping.map((s) => (
                  <div key={s.name} className="px-5 py-3">
                    <p className="font-mono text-white text-xs">{s.name}</p>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5 break-all">→ {s.reference}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isInspected && tab === 'handover' && (
        <HandoverReportPanel
          repositoryId={detail.repositoryId}
          installationId={detail.installationId}
          initialStakeholderMarkdown={detail.stakeholderMarkdown}
          initialEngineerMarkdown={detail.engineerMarkdown}
        />
      )}

      {isInspected && tab === 'architecture-graph' && (
        <ArchitectureGraphTab model={detail.architecture} />
      )}
    </div>
  )
}
