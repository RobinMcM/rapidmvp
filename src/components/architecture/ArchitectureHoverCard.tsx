'use client'

import { ArrowRight, CheckCircle2, Cloud, MousePointerClick } from 'lucide-react'
import {
  CONFIDENCE_LABEL,
  confidenceExplanation,
  type ArchNode,
} from '../../lib/repository/architecture-model'
import { hasAzureServiceProfile } from '../../lib/repository/azure-service-catalog'
import { CONFIDENCE_STYLE, KIND_STYLE, NODE_ICON } from './archStyles'

/**
 * The inspector panel. Shows the full information model for the active node:
 * What this is, Purpose, Deployment notes, Evidence, Confidence.
 * Updated on hover or keyboard focus of any node.
 *
 * When the node maps to a known Azure service, it offers a link into the shared
 * Azure Service Overview (azure-service-catalog) — the same overview Migration
 * Planning opens.
 */
export default function ArchitectureHoverCard({
  node,
  onViewService,
}: {
  node: ArchNode | null
  onViewService?: (resource: string) => void
}) {
  if (!node) {
    return (
      <div
        id="architecture-inspector"
        className="rounded-2xl bg-rm-dark-2/70 border border-slate-800 p-6 text-sm text-slate-400"
      >
        <span className="inline-flex items-center justify-center rounded-lg bg-slate-900/70 p-2 text-slate-400 mb-3">
          <MousePointerClick size={18} aria-hidden="true" />
        </span>
        <p className="text-slate-300 font-semibold mb-1">Explore the architecture</p>
        <p>Hover over or focus any component to see what it is, how it was detected, and its deployment notes.</p>
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
      className="rounded-2xl bg-rm-dark-2/80 border border-slate-700/70 p-6 flex flex-col gap-5"
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 rounded-lg p-2.5 ${KIND_STYLE[node.kind]}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-white font-bold text-base leading-tight">{node.title}</h3>
          <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
            {CONFIDENCE_LABEL[node.confidence]}
          </span>
        </div>
      </div>

      {node.description && <Field label="What this is" value={node.description} />}
      <Field label="Purpose" value={node.purpose} />
      <Field label="Deployment notes" value={node.deploymentRecommendation ?? 'Not yet determined.'} />

      {onViewService && hasAzureServiceProfile(node.azureResource) && (
        <button
          type="button"
          onClick={() => onViewService(node.azureResource as string)}
          className="inline-flex items-center justify-between gap-2 rounded-lg border border-azure/30 bg-azure/10 px-3 py-2 text-sm font-medium text-azure-300 transition-colors hover:border-azure hover:bg-azure/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure"
        >
          <span className="inline-flex items-center gap-2">
            <Cloud size={15} aria-hidden="true" />
            View Azure service overview
          </span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      )}

      {node.detectedFrom.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Evidence</p>
          <ul className="flex flex-col gap-2">
            {node.detectedFrom.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                <CheckCircle2 size={15} className="text-azure-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Confidence</p>
        <p className={`text-sm ${c.text}`}>{confidenceExplanation(node)}</p>
      </div>
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
