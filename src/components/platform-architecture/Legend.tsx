'use client'

import { CATEGORY_STYLE, STATUS_STYLE, LEGEND_CATEGORIES } from './platformModel'

/** Compact key: component categories + the live/planned distinction. */
export default function Legend() {
  return (
    <div className="rounded-2xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-3">Key</p>
        <ul className="flex flex-col gap-2">
          {LEGEND_CATEGORIES.map((c) => {
            const s = CATEGORY_STYLE[c]
            return (
              <li key={c} className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} aria-hidden="true" />
                <span className="text-slate-300">{s.label}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="pt-3 border-t border-slate-800/70">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-3">Status</p>
        <ul className="flex flex-col gap-2">
          {(['live', 'planned'] as const).map((st) => {
            const s = STATUS_STYLE[st]
            return (
              <li key={st} className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${s.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
                  {s.label}
                </span>
                <span className="text-slate-500">
                  {st === 'live' ? 'Shipped today' : 'Designed, not yet built'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
