import type { WorkflowPhase } from '../../data/blueprints'

export default function BlueprintWorkflowPreview({ phases }: { phases: WorkflowPhase[] }) {
  return (
    <div className="flex flex-col gap-4">
      {phases.map((phase) => (
        <div key={phase.phase} className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-azure/20 text-azure text-xs font-bold flex items-center justify-center">
              {phase.phase}
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-0.5">Phase {phase.phase}</p>
              <h4 className="text-white font-semibold text-sm">{phase.title}</h4>
            </div>
          </div>
          <p className="text-slate-400 text-sm">{phase.objective}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Deliverables</p>
              <ul className="space-y-1">
                {phase.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-azure flex-shrink-0 mt-0.5">›</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Validation Gates</p>
              <ul className="space-y-1">
                {phase.validationGates.map((g) => (
                  <li key={g} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
