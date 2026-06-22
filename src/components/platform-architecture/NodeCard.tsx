'use client'

import { CATEGORY_STYLE, STATUS_STYLE, type DiagramNode } from './platformModel'
import { ICONS } from './icons'

type Variant = 'stage' | 'compact' | 'data'

type Props = {
  node: DiagramNode
  active: boolean
  onActivate: (node: DiagramNode) => void
  variant?: Variant
}

/**
 * The interactive building block for the whole diagram. Reveals its synopsis on
 * hover AND keyboard focus (focus parity), and exposes its live/planned status.
 */
export default function NodeCard({ node, active, onActivate, variant = 'stage' }: Props) {
  const cat = CATEGORY_STYLE[node.category]
  const status = STATUS_STYLE[node.status]
  const Icon = ICONS[node.icon]
  const planned = node.status === 'planned'

  return (
    <button
      type="button"
      aria-label={`${node.title} — ${status.label}`}
      aria-describedby="platform-synopsis"
      aria-pressed={active}
      onMouseEnter={() => onActivate(node)}
      onFocus={() => onActivate(node)}
      onClick={() => onActivate(node)}
      className={[
        'group relative w-full h-full text-left rounded-xl bg-rm-dark-2/70 transition-all',
        'border',
        active ? 'border-azure shadow-lg shadow-azure/10' : cat.ring,
        planned ? 'border-dashed opacity-90 hover:opacity-100' : '',
        'hover:border-azure focus:outline-none focus-visible:ring-2 focus-visible:ring-azure',
        variant === 'data' ? 'p-3' : 'p-4',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 rounded-lg p-2 ${cat.badge}`}>
          <Icon size={variant === 'data' ? 16 : 18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-white font-semibold text-sm leading-tight">
              {node.step ? <span className="text-slate-500">{node.step}. </span> : null}
              {node.title}
            </p>
            <span
              className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${status.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
              {status.label}
            </span>
          </div>
          {variant !== 'data' && (
            <p className="text-slate-500 text-xs mt-1 leading-snug">{node.tagline}</p>
          )}
          {variant === 'data' && (
            <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{node.tagline}</p>
          )}
        </div>
      </div>
    </button>
  )
}
