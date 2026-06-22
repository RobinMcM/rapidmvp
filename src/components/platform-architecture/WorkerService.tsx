'use client'

import { JOB_QUEUE, WORKER_PARTS, WORKER_SERVICE, type DiagramNode } from './platformModel'
import NodeCard from './NodeCard'

type Props = {
  onActivate: (node: DiagramNode) => void
  activeId: string | null
}

/** Validation Worker Service (isolated) + the Job Queue beside it. */
export default function WorkerService({ onActivate, activeId }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
      {/* Worker service group */}
      <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/[0.03] p-4 flex flex-col gap-4">
        <NodeCard
          node={WORKER_SERVICE}
          active={activeId === WORKER_SERVICE.id}
          onActivate={onActivate}
          variant="compact"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKER_PARTS.map((part) => (
            <NodeCard
              key={part.id}
              node={part}
              active={activeId === part.id}
              onActivate={onActivate}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Job queue */}
      <NodeCard
        node={JOB_QUEUE}
        active={activeId === JOB_QUEUE.id}
        onActivate={onActivate}
        variant="compact"
      />
    </div>
  )
}
