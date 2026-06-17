import type { LeakageItem } from '../../../lib/financial/resilience-scorer'

const impactColour: Record<string, string> = {
  low: 'bg-slate-800 text-slate-400',
  medium: 'bg-amber-900/40 text-amber-400',
  high: 'bg-orange-900/40 text-orange-400',
}

const sourceLabel: Record<string, string> = {
  csv: 'Cost Export',
  iac: 'IaC / Architecture',
  advisor: 'Azure Advisor',
  assessment: 'Assessment',
}

export default function CostLeakageCard({ category, description, estimatedImpact, source }: LeakageItem) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white text-sm font-semibold">{category}</h3>
        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] ${impactColour[estimatedImpact] ?? impactColour.low}`}>
          {estimatedImpact}
        </span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
      <p className="text-slate-600 text-[10px] font-mono uppercase tracking-wider">{sourceLabel[source] ?? source}</p>
    </div>
  )
}
