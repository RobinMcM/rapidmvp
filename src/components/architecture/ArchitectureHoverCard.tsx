'use client'

import {
  CONFIDENCE_LABEL,
  confidenceExplanation,
  type ArchNode,
} from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE, NODE_ICON } from './archStyles'

/**
 * The inspector panel. Shows the full information model for the active node:
 * Title, Description, Purpose, Deployment Notes, Confidence (+ explanation).
 * Updated on hover or keyboard focus of any node.
 */
export default function ArchitectureHoverCard({ node }: { node: ArchNode | null }) {
  if (!node) {
    return (
      <div
        id="architecture-inspector"
        className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 text-sm text-slate-500"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Component details</p>
        <p>Hover over or focus any component to see how it was detected, what it does, and its deployment notes.</p>
      </div>
    )
  }

  const c = CONFIDENCE_STYLE[node.confidence]
  const Icon = NODE_ICON[node.kind]

  return (
    <div
      id="architecture-inspector"
      role="region"
      aria-live="polite"
      className={`rounded-xl bg-rm-dark-2/70 border ${c.ring} p-5 flex flex-col gap-4`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 rounded-lg bg-slate-900/70 p-2 text-slate-300">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h4 className="text-white font-semibold text-base">{node.title}</h4>
          <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
            {CONFIDENCE_LABEL[node.confidence]}
          </span>
        </div>
      </div>

      {node.description && (
        <Field label="Description" value={node.description} />
      )}
      <Field label="Purpose" value={node.purpose} />
      <Field label="Deployment notes" value={node.deploymentRecommendation ?? 'Not yet determined.'} />

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Confidence</p>
        <p className={`text-sm ${c.text}`}>{confidenceExplanation(node)}</p>
      </div>

      {node.detectedFrom.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Detected from</p>
          <ul className="flex flex-wrap gap-1.5">
            {node.detectedFrom.map((d, i) => (
              <li key={i} className="px-2 py-0.5 rounded bg-slate-900/70 text-slate-400 text-[11px] font-mono">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-slate-300 text-sm">{value}</p>
    </div>
  )
}
