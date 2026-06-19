type Props = {
  repositoryName: string
  detectedStack: string | null
  runtime: string | null
  packageManager: string | null
  buildCommand: string | null
  startCommand: string | null
  appType: string | null
  azureReadinessScore: number
  suitability: string
}

const SUITABILITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  suitable:             { bg: 'bg-emerald-900/40', text: 'text-emerald-400', label: 'Suitable' },
  suitable_with_changes:{ bg: 'bg-amber-900/40',   text: 'text-amber-400',   label: 'Suitable with changes' },
  requires_containers:  { bg: 'bg-blue-900/40',    text: 'text-blue-400',    label: 'Requires containers' },
  unsupported:          { bg: 'bg-red-900/40',      text: 'text-red-400',     label: 'Runtime not detected' },
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

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className="text-slate-200 text-sm text-right font-mono">{value ?? '—'}</span>
    </div>
  )
}

export default function StackSummaryCard(props: Props) {
  const suit = SUITABILITY_STYLES[props.suitability] ?? SUITABILITY_STYLES.unsupported

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Repository</p>
          <h3 className="text-white font-semibold text-base">{props.repositoryName}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0 ${suit.bg} ${suit.text}`}>
          {suit.label}
        </span>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-2">Azure Readiness Score</p>
        <ScoreBar score={props.azureReadinessScore} />
      </div>

      <div className="flex flex-col">
        <Row label="Stack"           value={props.detectedStack} />
        <Row label="Runtime"         value={props.runtime} />
        <Row label="Package Manager" value={props.packageManager} />
        <Row label="App Type"        value={props.appType} />
        <Row label="Build Command"   value={props.buildCommand} />
        <Row label="Start Command"   value={props.startCommand} />
      </div>
    </div>
  )
}
