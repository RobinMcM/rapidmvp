'use client'

import { useEffect, useState } from 'react'
import {
  CONFIDENCE_LABEL,
  type ArchConfidence,
  type ArchitectureModel,
  type ArchNode,
} from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE } from './archStyles'
import ArchitectureDiagram from './ArchitectureDiagram'
import DependencyGraph from './DependencyGraph'
import DeploymentFlowDiagram from './DeploymentFlowDiagram'
import ArchitectureHoverCard from './ArchitectureHoverCard'

const LEGEND: ArchConfidence[] = ['detected', 'likely', 'requires_clarification']

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
  const sources: string[] = []
  if (model.generatedFrom.stack) sources.push('detected stack')
  if (model.generatedFrom.envVars) sources.push('environment variables')
  if (model.generatedFrom.azure) sources.push('cloud blueprint')

  return (
    <div className="flex flex-col gap-6">
      {/* Header + legend */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Architecture overview</p>
            <h3 className="text-white font-semibold text-base">What appears to have been delivered?</h3>
          </div>
          <Legend />
        </div>
        <p className="text-slate-500 text-xs">
          A visual interpretation built only from detected facts
          {sources.length > 0 && <> ({sources.join(', ')})</>}. Components shown as{' '}
          <span className="text-slate-300">Requires Clarification</span> were not evidenced in the repository and are not
          assumptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Diagrams */}
        <div className="flex flex-col gap-6 min-w-0">
          <ArchitectureDiagram model={model} onActivate={setActive} activeId={activeId} />
          <DependencyGraph model={model} onActivate={setActive} activeId={activeId} />
          <DeploymentFlowDiagram model={model} onActivate={setActive} activeId={activeId} />
        </div>

        {/* Inspector (sticky on desktop) */}
        <div className="lg:sticky lg:top-6">
          <ArchitectureHoverCard node={active} />
        </div>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-3 flex-wrap" aria-label="Confidence legend">
      {LEGEND.map((c) => {
        const s = CONFIDENCE_STYLE[c]
        return (
          <span key={c} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {CONFIDENCE_LABEL[c]}
          </span>
        )
      })}
    </div>
  )
}
