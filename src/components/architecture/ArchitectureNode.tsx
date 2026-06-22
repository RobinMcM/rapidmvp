'use client'

import { CONFIDENCE_LABEL, type ArchNode } from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE, KIND_STYLE, NODE_ICON } from './archStyles'

type Props = {
  node: ArchNode
  active: boolean
  onActivate: (node: ArchNode | null) => void
  /** compact removes the tagline preview (used in dense bands) */
  compact?: boolean
}

/**
 * A single architecture component card. Reveals its detail on hover AND keyboard
 * focus (focus parity is required for accessibility — hover alone is not enough).
 */
export default function ArchitectureNode({ node, active, onActivate, compact }: Props) {
  const c = CONFIDENCE_STYLE[node.confidence]
  const Icon = NODE_ICON[node.kind]
  const unknown = node.confidence === 'requires_clarification'

  return (
    <button
      type="button"
      aria-label={`${node.title} — ${CONFIDENCE_LABEL[node.confidence]}`}
      aria-describedby="architecture-inspector"
      aria-pressed={active}
      onMouseEnter={() => onActivate(node)}
      onFocus={() => onActivate(node)}
      onClick={() => onActivate(node)}
      className={[
        'group relative w-full h-full text-left rounded-xl bg-rm-dark-2/70 p-4 transition-all border',
        active ? 'border-azure shadow-lg shadow-azure/10' : c.ring,
        unknown ? 'border-dashed opacity-90 hover:opacity-100' : '',
        'hover:border-azure focus:outline-none focus-visible:ring-2 focus-visible:ring-azure',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 rounded-lg p-2 ${KIND_STYLE[node.kind]}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-semibold text-sm leading-tight">{node.title}</p>
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${c.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
              {CONFIDENCE_LABEL[node.confidence]}
            </span>
          </div>
          {!compact && <p className="text-slate-500 text-xs mt-1 leading-snug line-clamp-2">{node.purpose}</p>}
        </div>
      </div>
    </button>
  )
}
