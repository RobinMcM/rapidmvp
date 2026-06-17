const levelColour: Record<string, string> = {
  Low: 'bg-slate-800 text-slate-400',
  Medium: 'bg-yellow-900/40 text-yellow-400',
  High: 'bg-orange-900/40 text-orange-400',
}

type Props = {
  category: string
  costLevel?: string | null
  costDriver?: string | null
  notes?: string | null
  optimisation?: string | null
}

export default function CostEstimateCard({ category, costLevel, costDriver, notes, optimisation }: Props) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-sm">{category}</h3>
        {costLevel && (
          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] ${levelColour[costLevel] ?? levelColour.Low}`}>
            {costLevel}
          </span>
        )}
      </div>
      {costDriver && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-1">Indicative cost driver</p>
          <p className="text-slate-400 text-sm">{costDriver}</p>
        </div>
      )}
      {notes && <p className="text-slate-500 text-xs leading-relaxed">{notes}</p>}
      {optimisation && (
        <div className="border-t border-slate-800/60 pt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 mb-1">Optimisation hint</p>
          <p className="text-emerald-600 text-xs leading-relaxed">{optimisation}</p>
        </div>
      )}
    </div>
  )
}
