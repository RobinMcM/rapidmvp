'use client'

import { useState } from 'react'
import StackSummaryCard from './StackSummaryCard'
import EnvVarsTable from './EnvVarsTable'
import AzureServicesPanel from './AzureServicesPanel'
import HandoverReportPanel from './HandoverReportPanel'
import MigrationPlanPanel from './MigrationPlanPanel'
import OwnershipModelPanel from './OwnershipModelPanel'
import OperationalConfidencePanel from './OperationalConfidencePanel'
import ArchitectureOverviewTab from '../architecture/ArchitectureOverviewTab'
import ArchitectureGraphTab from '../architecture/ArchitectureGraphTab'
import type { ConsistencyReport } from '../../lib/repository/consistency-checker'
import type { ArchitectureModel } from '../../lib/repository/architecture-model'
import type { MigrationPlan, Assumption, Clarification } from '../../lib/repository/migration-mapper'
import type { OperationalConfidence } from '../../lib/repository/operational-confidence'

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
  // Azure migration planning
  migrationPlan: MigrationPlan | null
  operational: OperationalConfidence | null
  assumptions: Assumption[]
  clarifications: Clarification[]
  // handover report
  stakeholderMarkdown: string | null
  engineerMarkdown: string | null
}

type Tab = 'delivered' | 'migration' | 'installation' | 'confidence' | 'architecture' | 'architecture-graph' | 'handover'

const TABS: { key: Tab; label: string }[] = [
  { key: 'delivered', label: 'Delivered' },
  { key: 'migration', label: 'Migration Plan' },
  { key: 'installation', label: 'Azure Blueprint' },
  { key: 'confidence', label: 'Operational Confidence' },
  { key: 'architecture', label: 'Architecture Overview' },
  { key: 'architecture-graph', label: 'Architecture' },
  { key: 'handover', label: 'Handover Report' },
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
        migrationPlan: MigrationPlan | null
        operational: OperationalConfidence | null
        assumptions: Assumption[]
        clarifications: Clarification[]
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
        migrationPlan: data.migrationPlan,
        operational: data.operational,
        assumptions: data.assumptions,
        clarifications: data.clarifications,
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
        <div className="flex gap-1 rounded-lg bg-slate-900/60 p-1 flex-wrap">
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
            detect its stack, map it onto Azure, and assess deployment readiness.
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

      {isInspected && tab === 'migration' && (
        <MigrationPlanPanel plan={detail.migrationPlan} />
      )}

      {isInspected && tab === 'confidence' && (
        <OperationalConfidencePanel confidence={detail.operational} />
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
              Azure-native deployment blueprint
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

          {/* Ownership model — a core product concept */}
          <OwnershipModelPanel plan={detail.migrationPlan} services={detail.services} />

          {/* Deployment sequence + dependencies */}
          {detail.installSteps.length > 0 && (
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800">
                <span className="text-slate-300 font-semibold text-sm">Deployment Sequence</span>
              </div>
              <ol className="divide-y divide-slate-800/50">
                {detail.installSteps.map((step, i) => (
                  <li key={i} className="px-5 py-3 flex items-start gap-3">
                    <span className="font-mono text-[11px] text-azure-300 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Environment variable matrix */}
          {detail.envVariables.length > 0 && (
            <EnvVarsTable envVars={detail.envVariables} />
          )}

          {/* Required secrets → Key Vault */}
          {detail.secretsMapping.length > 0 && (
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800">
                <span className="text-slate-300 font-semibold text-sm">Required Secrets → Azure Key Vault</span>
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

          {/* Assumptions + clarifications */}
          {(detail.assumptions.length > 0 || detail.clarifications.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detail.assumptions.length > 0 && (
                <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
                  <p className="text-slate-300 font-semibold text-sm mb-3">Assumptions</p>
                  <ul className="flex flex-col gap-2">
                    {detail.assumptions.map((a, i) => (
                      <li key={i} className="text-slate-400 text-xs">
                        <span className="text-slate-300">{a.text}</span>
                        <span className="block text-slate-600 mt-0.5">{a.basis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.clarifications.length > 0 && (
                <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
                  <p className="text-slate-300 font-semibold text-sm mb-3">Requires Clarification</p>
                  <ul className="flex flex-col gap-2">
                    {detail.clarifications.map((c, i) => (
                      <li key={i} className="text-slate-400 text-xs">
                        <span className="text-slate-300">{c.question}</span>
                        <span className="block text-slate-600 mt-0.5">{c.why}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
