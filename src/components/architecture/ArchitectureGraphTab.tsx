'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CONFIDENCE_LABEL,
  type ArchConfidence,
  type ArchitectureModel,
  type ArchNode,
} from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE } from './archStyles'
import ArchitectureNode from './ArchitectureNode'
import ArchitectureHoverCard from './ArchitectureHoverCard'
import { layoutArchitecture, edgePath, CARD_W, CARD_H } from './graphLayout'

const LEGEND: ArchConfidence[] = ['detected', 'likely', 'requires_clarification']

const EDGE_STROKE: Record<ArchConfidence, string> = {
  detected: 'stroke-emerald-500',
  likely: 'stroke-amber-500',
  requires_clarification: 'stroke-slate-600',
}

export default function ArchitectureGraphTab({ model }: { model: ArchitectureModel | null }) {
  const [active, setActive] = useState<ArchNode | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const layout = useMemo(() => (model ? layoutArchitecture(model) : null), [model])

  if (!model || !layout || layout.nodes.length === 0) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">Inspect the repository to generate its architecture diagram.</p>
      </div>
    )
  }

  const activeId = active?.id ?? null

  return (
    <div className="relative">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
        <div className="glow-azure absolute -top-24 -left-24 w-[34rem] h-[34rem]" />
        <div className="glow-orange absolute bottom-0 right-0 w-[26rem] h-[26rem]" />
        <div className="grid-pattern absolute inset-0 opacity-30" />
      </div>

      <div className="relative">
        <header className="mb-6">
          <p className="label-mono text-azure-300 mb-1">Architecture</p>
          <h3 className="text-white font-bold text-xl">Repository architecture diagram</h3>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            The detected components and how they connect. Hover or focus any box for details. Built only from detected
            facts — dashed items are <span className="text-slate-300">Requires Clarification</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Graph canvas */}
          <div className="rounded-2xl bg-rm-dark/40 border border-slate-800 p-4 overflow-x-auto">
            <div className="relative mx-auto" style={{ width: layout.width, height: layout.height }}>
              {/* Connector lines (decorative) */}
              <svg
                className="absolute inset-0"
                width={layout.width}
                height={layout.height}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="arch-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-600" />
                  </marker>
                </defs>
                {layout.edges.map((e) => (
                  <path
                    key={e.id}
                    d={edgePath(e)}
                    fill="none"
                    strokeWidth={1.5}
                    strokeOpacity={0.55}
                    strokeDasharray={e.confidence === 'requires_clarification' ? '5 5' : undefined}
                    markerEnd="url(#arch-arrow)"
                    className={EDGE_STROKE[e.confidence]}
                  />
                ))}
              </svg>

              {/* Nodes */}
              {layout.nodes.map(({ node, x, y }) => (
                <div key={node.id} className="absolute" style={{ left: x, top: y, width: CARD_W, height: CARD_H }}>
                  <ArchitectureNode node={node} active={activeId === node.id} onActivate={setActive} compact />
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}
