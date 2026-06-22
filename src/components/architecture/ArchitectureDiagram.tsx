'use client'

import { ArrowDown } from 'lucide-react'
import type { ArchitectureModel, ArchNode } from '../../lib/repository/architecture-model'
import ArchitectureNode from './ArchitectureNode'

type Props = {
  model: ArchitectureModel
  onActivate: (node: ArchNode | null) => void
  activeId: string | null
}

/**
 * High-Level Application Diagram + Service Relationship.
 * User → Application → the services it relates to, with each relationship labelled.
 */
export default function ArchitectureDiagram({ model, onActivate, activeId }: Props) {
  const byId = (id: string) => model.nodes.find((n) => n.id === id) ?? null
  const user = model.nodes.find((n) => n.kind === 'user')
  const app = model.nodes.find((n) => n.kind === 'application')

  // Services the application relates to (everything app → X except deployment targets).
  const serviceEdges = model.edges.filter(
    (e) => e.from === 'application' && byId(e.to)?.kind !== 'deployment_target'
  )

  const renderNode = (node: ArchNode | null) =>
    node && (
      <ArchitectureNode node={node} active={activeId === node.id} onActivate={onActivate} />
    )

  return (
    <section className="rounded-xl bg-rm-dark/40 border border-slate-800 p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-4">High-level application</p>

      <div className="flex flex-col items-center gap-2">
        <div className="w-full max-w-xs">{renderNode(user ?? null)}</div>
        <Connector />
        <div className="w-full max-w-xs">{renderNode(app ?? null)}</div>
      </div>

      {serviceEdges.length > 0 && (
        <>
          <div className="flex justify-center my-2">
            <Connector />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceEdges.map((e) => {
              const node = byId(e.to)
              if (!node) return null
              return (
                <div key={e.to} className="flex flex-col gap-1.5">
                  {e.label && (
                    <span className="self-start px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-500 text-[10px] font-mono">
                      {e.label}
                    </span>
                  )}
                  <ArchitectureNode node={node} active={activeId === node.id} onActivate={onActivate} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

function Connector() {
  return (
    <span className="text-slate-600" aria-hidden="true">
      <ArrowDown size={18} />
    </span>
  )
}
