'use client'

import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { ArchitectureModel, ArchNode } from '../../lib/repository/architecture-model'
import ArchitectureNode from './ArchitectureNode'

type Props = {
  model: ArchitectureModel
  onActivate: (node: ArchNode | null) => void
  activeId: string | null
}

/**
 * Deployment Flow — Repository → Application → Cloud Resources → Users.
 * Cloud resources come from the (provider-agnostic) deployment_target nodes.
 */
export default function DeploymentFlowDiagram({ model, onActivate, activeId }: Props) {
  const targets = model.nodes.filter((n) => n.kind === 'deployment_target')
  const app = model.nodes.find((n) => n.kind === 'application')

  return (
    <section className="rounded-xl bg-rm-dark/40 border border-slate-800 p-5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-4">Deployment flow</p>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-3 items-stretch">
        <Stage label="Repository">
          <StaticCard title="Delivered repository" subtitle="Handover artefact (ZIP)" />
        </Stage>

        <FlowArrow />

        <Stage label="Application">
          {app ? (
            <ArchitectureNode node={app} active={activeId === app.id} onActivate={onActivate} />
          ) : (
            <StaticCard title="Application" subtitle="Requires clarification" />
          )}
        </Stage>
      </div>

      <div className="flex justify-center my-2">
        <FlowArrow vertical />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-stretch">
        <Stage label="Cloud resources">
          {targets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targets.map((node) => (
                <ArchitectureNode key={node.id} node={node} active={activeId === node.id} onActivate={onActivate} compact />
              ))}
            </div>
          ) : (
            <StaticCard title="Cloud resources" subtitle="Run the cloud blueprint to determine resources" />
          )}
        </Stage>

        <Stage label="Users">
          <StaticCard title="Users" subtitle="Access the deployed application" />
        </Stage>
      </div>
    </section>
  )
}

function Stage({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-2 py-0.5 self-start rounded-full bg-slate-900/70 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
        {label}
      </span>
      {children}
    </div>
  )
}

function StaticCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-3 h-full">
      <p className="text-white font-semibold text-sm">{title}</p>
      <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
    </div>
  )
}

function FlowArrow({ vertical }: { vertical?: boolean }) {
  return (
    <div className="flex items-center justify-center text-slate-600" aria-hidden="true">
      <ArrowRight size={18} className={vertical ? 'rotate-90' : ''} />
    </div>
  )
}
