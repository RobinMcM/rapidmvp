const severityColour: Record<string, string> = {
  info: 'bg-slate-800 text-slate-400',
  warning: 'bg-orange-900/40 text-orange-400',
  critical: 'bg-red-900/40 text-red-400',
}

type Finding = {
  id: string
  category: string
  severity: string
  finding: string
  recommendation: string | null
}

type Props = {
  findings: Finding[]
  aiSummary?: string
}

function groupByCategory(findings: Finding[]) {
  const map = new Map<string, Finding[]>()
  for (const f of findings) {
    const group = map.get(f.category) ?? []
    group.push(f)
    map.set(f.category, group)
  }
  return map
}

export default function ArchitectureSummaryPanel({ findings, aiSummary }: Props) {
  if (findings.length === 0) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-8 text-center">
        <p className="text-slate-500 text-sm">No architecture findings yet. Parse and analyse documents to generate findings.</p>
      </div>
    )
  }

  const grouped = groupByCategory(findings)

  return (
    <div className="flex flex-col gap-6">
      {aiSummary && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-3">Architecture Summary</p>
          <p className="text-slate-300 text-sm leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">{category}</h3>
          <div className="flex flex-col gap-3">
            {items.map((f) => (
              <div key={f.id} className="flex items-start gap-3">
                <span className={`flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] ${severityColour[f.severity] ?? severityColour.info}`}>
                  {f.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm">{f.finding}</p>
                  {f.recommendation && (
                    <p className="text-slate-500 text-xs mt-1">→ {f.recommendation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
