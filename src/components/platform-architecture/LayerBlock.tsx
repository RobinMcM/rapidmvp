'use client'

import type { ReactNode } from 'react'

/** A full-width labelled band wrapping a layer of the architecture. */
export default function LayerBlock({
  label,
  sublabel,
  children,
  className = '',
}: {
  label: string
  sublabel?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl bg-rm-dark/40 border border-slate-800 p-5 ${className}`}>
      <div className="mb-4">
        <p className="text-slate-200 font-semibold text-sm">{label}</p>
        {sublabel && <p className="text-slate-500 text-xs mt-0.5">{sublabel}</p>}
      </div>
      {children}
    </section>
  )
}
