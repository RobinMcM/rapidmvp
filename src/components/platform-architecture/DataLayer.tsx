'use client'

import { DATA_LAYER, type DiagramNode } from './platformModel'
import NodeCard from './NodeCard'
import LayerBlock from './LayerBlock'

type Props = {
  onActivate: (node: DiagramNode) => void
  activeId: string | null
}

/** Data Layer — the persistent stores behind the platform. */
export default function DataLayer({ onActivate, activeId }: Props) {
  return (
    <LayerBlock label="Data Layer" sublabel="PostgreSQL · JSONB Storage · Audit Logs · Metrics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DATA_LAYER.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            active={activeId === node.id}
            onActivate={onActivate}
            variant="data"
          />
        ))}
      </div>
    </LayerBlock>
  )
}
