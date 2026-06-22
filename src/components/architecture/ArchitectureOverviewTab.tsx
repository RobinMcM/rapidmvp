'use client'

import { useEffect, useState } from 'react'
import {
  CONFIDENCE_LABEL,
  type ArchConfidence,
  type ArchitectureModel,
  type ArchNode,
} from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE } from './archStyles'
import ArchitectureNode from './ArchitectureNode'
import ArchitectureHoverCard from './ArchitectureHoverCard'
import LayerBlock from '../platform-architecture/LayerBlock'
import { DownConnector } from '../platform-architecture/connectors'

const LEGEND: ArchConfidence[] = ['detected', 'likely', 'requires_clarification']

const LEGEND_HINT: Record<ArchConfidence, string> = {
  detected: 'Direct evidence in the repository',
  likely: 'Strong indicator, not confirmed',
  requires_clarification: 'Not evidenced — needs confirmation',
}

export default function ArchitectureOverviewTab({ model }: { model: ArchitectureModel | null }) {
  const [active, setActive] = useState<ArchNode | null>(null)

  // Escape clears the inspector selection (keyboard dismissal).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!model || model.nodes.length === 0) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">Inspect the repository to generate its architecture overview.</p>
      </div>
    )
  }

  const activeId = active?.id ?? null
  const byId = (id: string) => model.nodes.find((n) => n.id === id) ?? null
  const user = model.nodes.find((n) => n.kind === 'user')
  const app = model.nodes.find((n) => n.kind === 'application')

  // Application → service relationships (everything except deployment targets).
  const serviceEdges = model.edges.filter(
    (e) => e.from === 'application' && byId(e.to)?.kind !== 'deployment_target'
  )
  const deploymentNodes = model.nodes.filter((n) => n.kind === 'deployment_target')

  const sources: string[] = []
  if (model.generatedFrom.stack) sources.push('detected stack')
  if (model.generatedFrom.envVars) sources.push('environment variables')
  if (model.generatedFrom.azure) sources.push('cloud blueprint')

  return (
    <div className="relative">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
        <div className="glow-azure absolute -top-24 -left-24 w-[34rem] h-[34rem]" />
        <div className="glow-orange absolute bottom-0 right-0 w-[26rem] h-[26rem]" />
        <div className="grid-pattern absolute inset-0 opacity-30" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="mb-6">
          <p className="label-mono text-azure-300 mb-1">Architecture overview</p>
          <h3 className="text-white font-bold text-xl">What appears to have been delivered?</h3>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            A visual interpretation built only from detected facts
            {sources.length > 0 && <> ({sources.join(', ')})</>}. Components shown as{' '}
            <span className="text-slate-300">Requires Clarification</span> were not evidenced in the repository and are
            not assumptions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Flow canvas */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Users → Application */}
            <LayerBlock label="Application" sublabel="Who uses it and what runs">
              <div className="flex flex-col items-center gap-1">
                {user && (
                  <div className="w-full max-w-sm">
                    <ArchitectureNode node={user} active={activeId === user.id} onActivate={setActive} />
                  </div>
                )}
                {user && app && <DownConnector />}
                {app && (
                  <div className="w-full max-w-sm">
                    <ArchitectureNode node={app} active={activeId === app.id} onActivate={setActive} />
                  </div>
                )}
              </div>
            </LayerBlock>

            {serviceEdges.length > 0 && (
              <>
                <DownConnector />
                <LayerBlock label="Application services" sublabel="What the application depends on">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceEdges.map((e) => {
                      const node = byId(e.to)
                      if (!node) return null
                      return (
                        <div key={e.to} className="flex flex-col gap-1.5">
                          {e.label && (
                            <span className="self-start px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-500 text-[10px] font-mono">
                              {e.label}
                            </span>
                          )}
                          <ArchitectureNode node={node} active={activeId === node.id} onActivate={setActive} />
                        </div>
                      )
                    })}
                  </div>
                </LayerBlock>
              </>
            )}

            {deploymentNodes.length > 0 && (
              <>
                <DownConnector />
                <LayerBlock label="Cloud deployment targets" sublabel="Where it is expected to run">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {deploymentNodes.map((node) => (
                      <ArchitectureNode
                        key={node.id}
                        node={node}
                        active={activeId === node.id}
                        onActivate={setActive}
                        compact
                      />
                    ))}
                  </div>
                </LayerBlock>
              </>
            )}
          </div>

          {/* Right rail: synopsis + legend (sticky on desktop) */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <ArchitectureHoverCard node={active} />
            <Legend />
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="rounded-2xl bg-rm-dark-2/70 border border-slate-800 p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-3">Confidence key</p>
      <ul className="flex flex-col gap-2.5">
        {LEGEND.map((c) => {
          const s = CONFIDENCE_STYLE[c]
          return (
            <li key={c} className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${s.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
                {CONFIDENCE_LABEL[c]}
              </span>
              <span className="text-slate-500">{LEGEND_HINT[c]}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
