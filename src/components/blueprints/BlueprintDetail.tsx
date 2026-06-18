import Link from 'next/link'
import type { Blueprint } from '../../data/blueprints'
import BlueprintServiceStack from './BlueprintServiceStack'
import BlueprintWorkflowPreview from './BlueprintWorkflowPreview'
import BlueprintArchitectureDiagram from './BlueprintArchitectureDiagram'

export default function BlueprintDetail({ blueprint }: { blueprint: Blueprint }) {
  const isOrange = blueprint.accentColor === 'cf-orange'
  const accentText = isOrange ? 'text-cf-orange' : 'text-azure'
  const accentBorder = isOrange ? 'border-cf-orange/30' : 'border-azure/30'
  const accentBg = isOrange ? 'bg-cf-orange/10' : 'bg-azure/10'

  return (
    <div className="bg-rm-black min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-rm-dark/60">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link
            href="/blueprints"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Blueprints
          </Link>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <span className={`inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded mb-4 ${accentBg} ${accentText}`}>
                {blueprint.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{blueprint.title}</h1>
              <p className="text-slate-400 max-w-2xl leading-relaxed">{blueprint.summary}</p>
            </div>
            <Link
              href="/workspace/vision"
              className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors shadow-sm shadow-azure/20"
            >
              Start Architecture Session
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — detail sections */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Executive Overview */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Executive Overview</h2>
            <div className={`rounded-xl border ${accentBorder} bg-rm-dark-2/70 p-5`}>
              <p className="text-slate-300 text-sm leading-relaxed">{blueprint.summary}</p>
            </div>
          </section>

          {/* Business Use Case */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Business Use Case</h2>
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
              <p className="text-slate-300 text-sm leading-relaxed">{blueprint.businessUseCase}</p>
            </div>
          </section>

          {/* Architecture Diagram */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Architecture Diagram</h2>
            <BlueprintArchitectureDiagram
              azure={blueprint.azure}
              cloudflare={blueprint.cloudflare}
              ai={blueprint.ai}
              dataLayer={blueprint.dataLayer}
            />
          </section>

          {/* Key Decisions */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Key Architecture Decisions</h2>
            <div className={`rounded-xl border ${accentBorder} bg-rm-dark-2/70 p-5`}>
              <ul className="space-y-2.5">
                {blueprint.keyDecisions.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`flex-shrink-0 mt-0.5 ${accentText}`}>›</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Security & Compliance */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Security Model</h2>
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-4">
              <p className="text-slate-300 text-sm leading-relaxed">{blueprint.security}</p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Compliance Alignment</p>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.compliance.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[11px] bg-emerald-900/30 text-emerald-400 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Scaling & Deployment */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Deployment & Scaling</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Deployment Model</p>
                <p className="text-slate-300 text-sm">{blueprint.deployment}</p>
              </div>
              <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Scaling Model</p>
                <p className="text-slate-300 text-sm">{blueprint.scalingModel}</p>
              </div>
            </div>
          </section>

          {/* Cost Drivers */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Cost Drivers</h2>
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
              <p className="text-[11px] text-slate-600 mb-3 font-mono uppercase tracking-wider">Potential cost areas to review — not a fixed budget or estimate</p>
              <ul className="space-y-2">
                {blueprint.costDrivers.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">›</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Common Mistakes */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Common Mistakes</h2>
            <div className="rounded-xl bg-rm-dark-2/70 border border-orange-900/30 p-5">
              <ul className="space-y-3">
                {blueprint.commonMistakes.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-orange-400 flex-shrink-0 mt-0.5">✕</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Architect's Insight */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Architect's Insight</h2>
            <div className={`rounded-xl border-l-4 ${isOrange ? 'border-cf-orange' : 'border-azure'} bg-rm-dark-2/70 border border-slate-800 p-5`}>
              <p className={`font-mono text-[10px] uppercase tracking-wider mb-3 ${accentText}`}>Expert Perspective</p>
              <p className="text-slate-300 text-sm leading-relaxed italic">"{blueprint.architectInsight}"</p>
            </div>
          </section>

          {/* Workflow Preview */}
          {blueprint.workflowPreview.length > 0 && (
            <section>
              <h2 className="text-white font-semibold text-lg mb-4">Delivery Workflow Preview</h2>
              <BlueprintWorkflowPreview phases={blueprint.workflowPreview} />
            </section>
          )}
        </div>

        {/* Right column — service stack + CTA */}
        <div className="flex flex-col gap-6">
          <BlueprintServiceStack
            azure={blueprint.azure}
            cloudflare={blueprint.cloudflare}
            ai={blueprint.ai}
            dataLayer={blueprint.dataLayer}
            devOps={blueprint.devOps}
          />

          {/* CTA */}
          <div className={`rounded-xl border ${accentBorder} ${accentBg} p-5 flex flex-col gap-3`}>
            <h3 className="text-white font-semibold text-sm">Use this blueprint</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Start an architecture session to customise this blueprint for your requirements.
            </p>
            <Link
              href="/workspace/vision"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors"
            >
              Start Architecture Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
