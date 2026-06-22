'use client'

import type { ArchitectureModel, ArchNode, ArchNodeKind } from '../../lib/repository/architecture-model'
import ArchitectureNode from './ArchitectureNode'

type Props = {
  model: ArchitectureModel
  onActivate: (node: ArchNode | null) => void
  activeId: string | null
}

const GROUPS: { title: string; kinds: ArchNodeKind[] }[] = [
  { title: 'Data dependencies', kinds: ['database', 'storage'] },
  { title: 'Identity & external services', kinds: ['authentication', 'external_service'] },
  { title: 'Messaging & background work', kinds: ['email', 'queue'] },
]

/**
 * Operational Dependencies — the services the application depends on to run,
 * grouped by concern. Absent groups are hidden; core gaps already surface as
 * requires_clarification nodes in the data/identity groups.
 */
export default function DependencyGraph({ model, onActivate, activeId }: Props) {
  const groups = GROUPS.map((g) => ({
    ...g,
    nodes: model.nodes.filter((n) => g.kinds.includes(n.kind)),
  })).filter((g) => g.nodes.length > 0)

  if (groups.length === 0) {
    return (
      <section className="rounded-xl bg-rm-dark/40 border border-slate-800 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Operational dependencies</p>
        <p className="text-slate-500 text-sm">No operational dependencies were detected.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl bg-rm-dark/40 border border-slate-800 p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-4">Operational dependencies</p>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-slate-400 text-xs font-semibold mb-2">{g.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.nodes.map((node) => (
                <ArchitectureNode
                  key={node.id}
                  node={node}
                  active={activeId === node.id}
                  onActivate={onActivate}
                  compact
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
