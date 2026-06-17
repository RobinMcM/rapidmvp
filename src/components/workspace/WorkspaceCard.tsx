import type { ReactNode } from 'react'

export default function WorkspaceCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-rm-dark-2/70 border border-slate-800 ${className}`}>
      {children}
    </div>
  )
}
