'use client'

import { ArrowRight, ArrowDown } from 'lucide-react'

/** Decorative flow connector between pipeline stages (horizontal on lg+). */
export function StageConnector() {
  return (
    <span className="hidden lg:flex items-center justify-center text-slate-600 px-0.5" aria-hidden="true">
      <ArrowRight size={16} />
    </span>
  )
}

/** Decorative downward connector between stacked layers. */
export function DownConnector() {
  return (
    <div className="flex justify-center text-slate-600 py-1" aria-hidden="true">
      <ArrowDown size={18} />
    </div>
  )
}
