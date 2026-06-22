'use client'

import { CONFIDENCE_LABEL, type ArchNode } from '../../lib/repository/architecture-model'
import { CONFIDENCE_STYLE, NODE_ICON } from './archStyles'

type Props = {
  node: ArchNode
  active: boolean
  onActivate: (node: ArchNode | null) => void
  /** compact removes the description preview (used in dense dependency lists) */
  compact?: boolean
}

/**
 * A single architecture component card. Reveals its detail on hover AND keyboard
 * focus (focus parity is required for accessibility — hover alone is not enough).
 */
export default function ArchitectureNode({ node, active, onActivate, compact }: Props) {
  const c = CONFIDENCE_STYLE[node.confidence]
  const Icon = NODE_ICON[node.kind]

  return (
    <button
      type="button"
      aria-label={`${node.title} — ${CONFIDENCE_LABEL[node.confidence]}`}
      aria-describedby="architecture-inspector"
      aria-pressed={active}
      onMouseEnter={() => onActivate(node)}
      onFocus={() => onActivate(node)}
      onClick={() => onActivate(node)}
      className={`group w-full text-left rounded-xl bg-rm-dark-2/70 border ${
        active ? 'border-azure' : c.ring
      } p-3 transition-colors hover:border-azure focus:outline-none focus-visible:ring-2 focus-visible:ring-azure`}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 rounded-lg bg-slate-900/70 p-2 text-slate-300">
          <Icon size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-semibold text-sm truncate">{node.title}</p>
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
              {CONFIDENCE_LABEL[node.confidence]}
            </span>
          </div>
          {!compact && <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{node.purpose}</p>}
        </div>
      </div>
    </button>
  )
}
