const severityColour: Record<string, string> = {
  Critical: 'bg-red-900/40 text-red-400',
  High: 'bg-orange-900/40 text-orange-400',
  Medium: 'bg-yellow-900/40 text-yellow-400',
  Low: 'bg-slate-800 text-slate-400',
}

type Props = {
  category: string
  severity?: string | null
  likelihood?: string | null
  mitigation?: string | null
  owner?: string | null
}

export default function RiskRegisterCard({ category, severity, likelihood, mitigation, owner }: Props) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-sm">{category}</h3>
        {severity && (
          <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] ${severityColour[severity] ?? severityColour.Low}`}>
            {severity}
          </span>
        )}
      </div>
      {likelihood && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-1">Likelihood</p>
          <p className="text-slate-400 text-sm">{likelihood}</p>
        </div>
      )}
      {mitigation && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-1">Mitigation</p>
          <p className="text-slate-400 text-sm">{mitigation}</p>
        </div>
      )}
      {owner && (
        <div className="border-t border-slate-800/60 pt-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-0.5">Owner</p>
          <p className="text-slate-500 text-xs">{owner}</p>
        </div>
      )}
    </div>
  )
}
