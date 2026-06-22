'use client'

import { Fragment, useEffect, useState } from 'react'
import { ORCHESTRATION, PIPELINE, REPO_STORAGE, type DiagramNode } from './platformModel'
import NodeCard from './NodeCard'
import SynopsisPanel from './SynopsisPanel'
import Legend from './Legend'
import LayerBlock from './LayerBlock'
import WorkerService from './WorkerService'
import DataLayer from './DataLayer'
import { StageConnector, DownConnector } from './connectors'

/**
 * RapidMVP's platform architecture, as an interactive infographic.
 * Hover or keyboard-focus any node to populate the synopsis panel.
 */
export default function PlatformArchitecture() {
  const [active, setActive] = useState<DiagramNode | null>(null)
  const activeId = active?.id ?? null

  // Escape clears the current selection.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="glow-azure absolute -top-32 -left-32 w-[40rem] h-[40rem]" />
        <div className="glow-orange absolute bottom-0 right-0 w-[32rem] h-[32rem]" />
        <div className="grid-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-8">
          <p className="label-mono text-azure-300 mb-2">Architecture Overview</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Operational Confidence &amp; Deployment Validation
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            How RapidMVP takes a delivered repository from upload to operational confidence. Hover over any
            section to see a brief synopsis. <span className="text-slate-300">Live</span> components ship today;{' '}
            <span className="text-slate-300">Planned</span> components are designed but not yet built.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Diagram */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Pipeline */}
            <LayerBlock
              label="Validation Pipeline"
              sublabel="From repository to operational confidence"
            >
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">
                {PIPELINE.map((node, i) => (
                  <Fragment key={node.id}>
                    <div className="lg:flex-1 lg:min-w-0">
                      <NodeCard node={node} active={activeId === node.id} onActivate={setActive} />
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <>
                        <StageConnector />
                        <div className="lg:hidden">
                          <DownConnector />
                        </div>
                      </>
                    )}
                  </Fragment>
                ))}
              </div>
            </LayerBlock>

            <DownConnector />

            {/* Orchestration + repository storage */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-stretch">
              <NodeCard
                node={REPO_STORAGE}
                active={activeId === REPO_STORAGE.id}
                onActivate={setActive}
                variant="compact"
              />
              <NodeCard
                node={ORCHESTRATION}
                active={activeId === ORCHESTRATION.id}
                onActivate={setActive}
                variant="compact"
              />
            </div>

            <DownConnector />

            {/* Worker service + job queue */}
            <WorkerService onActivate={setActive} activeId={activeId} />

            <DownConnector />

            {/* Data layer */}
            <DataLayer onActivate={setActive} activeId={activeId} />
          </div>

          {/* Right rail: synopsis + legend (sticky on desktop) */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <SynopsisPanel node={active} />
            <Legend />
          </div>
        </div>
      </div>
    </div>
  )
}
