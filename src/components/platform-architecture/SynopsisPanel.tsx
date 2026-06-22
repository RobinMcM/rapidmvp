'use client'

import type { ReactNode } from 'react'
import { CheckCircle2, MousePointerClick } from 'lucide-react'
import { CATEGORY_STYLE, STATUS_STYLE, type DiagramNode } from './platformModel'
import { ICONS } from './icons'

/**
 * The right-hand inspector. Mirrors the mockup: title + status, What it does,
 * Why it matters, Key outputs. Updates on hover or keyboard focus of any node.
 */
export default function SynopsisPanel({ node }: { node: DiagramNode | null }) {
  if (!node) {
    return (
      <div
        id="platform-synopsis"
        className="rounded-2xl bg-rm-dark-2/70 border border-slate-800 p-6 text-sm text-slate-400"
      >
        <span className="inline-flex items-center justify-center rounded-lg bg-slate-900/70 p-2 text-slate-400 mb-3">
          <MousePointerClick size={18} aria-hidden="true" />
        </span>
        <p className="text-slate-300 font-semibold mb-1">Explore the architecture</p>
        <p>Hover over or focus any section to see a brief synopsis of what it does, why it matters, and what it produces.</p>
      </div>
    )
  }

  const cat = CATEGORY_STYLE[node.category]
  const status = STATUS_STYLE[node.status]
  const Icon = ICONS[node.icon]

  return (
    <div
      id="platform-synopsis"
      role="region"
      aria-live="polite"
      className="rounded-2xl bg-rm-dark-2/80 border border-slate-700/70 p-6 flex flex-col gap-5"
    >
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 rounded-lg p-2.5 ${cat.badge}`}>
          <Icon size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-white font-bold text-base leading-tight">
            {node.step ? `${node.step}. ` : ''}{node.title}
          </h3>
          <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${status.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>
        </div>
      </div>

      <Block title="What it does">
        <ul className="flex flex-col gap-2">
          {node.synopsis.whatItDoes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
              <CheckCircle2 size={15} className="text-azure-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Why it matters">
        <p className="text-slate-400 text-sm">{node.synopsis.whyItMatters}</p>
      </Block>

      <Block title="Key outputs">
        <ul className="flex flex-wrap gap-1.5">
          {node.synopsis.keyOutputs.map((out, i) => (
            <li key={i} className="px-2 py-0.5 rounded bg-slate-900/70 border border-slate-700/60 text-slate-300 text-[11px] font-medium">
              {out}
            </li>
          ))}
        </ul>
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">{title}</p>
      {children}
    </div>
  )
}
