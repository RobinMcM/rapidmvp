import type { ConsistencyReport, ConsistencyFinding, ConsistencySeverity } from '../../lib/repository/consistency-checker'

const SEVERITY_ORDER: ConsistencySeverity[] = ['critical', 'warning', 'info']

const SEVERITY_STYLES: Record<ConsistencySeverity, { bg: string; border: string; text: string; dot: string; label: string }> = {
  critical: { bg: 'bg-red-950/30',   border: 'border-red-900/50',   text: 'text-red-300',   dot: 'bg-red-500',   label: 'Critical' },
  warning:  { bg: 'bg-amber-950/20', border: 'border-amber-900/40', text: 'text-amber-300', dot: 'bg-amber-500', label: 'Warning' },
  info:     { bg: 'bg-slate-800/30', border: 'border-slate-700/50', text: 'text-slate-300', dot: 'bg-slate-500', label: 'Info' },
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-white font-bold text-sm w-12 text-right">{score}/100</span>
    </div>
  )
}

function FindingRow({ finding }: { finding: ConsistencyFinding }) {
  const s = SEVERITY_STYLES[finding.severity]
  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <span className={`w-2 h-2 rounded-full ${s.dot} mt-1.5 flex-shrink-0`} />
      <div className="min-w-0">
        <p className="text-white font-medium text-sm">{finding.title}</p>
        <p className="text-slate-400 text-xs mt-0.5">{finding.detail}</p>
        {finding.location && (
          <p className="text-slate-600 text-[11px] font-mono mt-0.5 break-all">{finding.location}</p>
        )}
      </div>
    </div>
  )
}

export default function ConsistencyPanel({ report }: { report: ConsistencyReport | null }) {
  if (!report) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">Inspect the repository to run the consistency check.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Score + summary */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Repository consistency</p>
            <h3 className="text-white font-semibold text-base">Is this repository clean enough to install?</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-900/40 text-red-400">{report.counts.critical} critical</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-900/40 text-amber-400">{report.counts.warning} warning</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400">{report.counts.info} info</span>
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Cleanliness score</p>
          <ScoreBar score={report.score} />
        </div>
        <p className="text-slate-500 text-xs">
          {report.filesAnalysed} source file{report.filesAnalysed === 1 ? '' : 's'} analysed
          {report.partial && ' · partial analysis (large repository — absence-based checks may be incomplete)'}
        </p>
      </div>

      {report.findings.length === 0 ? (
        <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/40 p-6 text-center">
          <p className="text-emerald-300 text-sm font-medium">No consistency issues detected.</p>
        </div>
      ) : (
        SEVERITY_ORDER.map((sev) => {
          const group = report.findings.filter((f) => f.severity === sev)
          if (group.length === 0) return null
          const s = SEVERITY_STYLES[sev]
          return (
            <div key={sev} className={`rounded-xl ${s.bg} border ${s.border} overflow-hidden`}>
              <div className="px-5 py-3 border-b border-slate-800/50 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`font-semibold text-sm ${s.text}`}>{s.label}</span>
                <span className="text-slate-500 text-xs">({group.length})</span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {group.map((f, i) => (
                  <FindingRow key={`${f.category}-${f.location ?? ''}-${i}`} finding={f} />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
