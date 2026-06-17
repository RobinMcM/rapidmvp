import type { AcceptanceCategoryStatus } from '../../types/acceptance'

const statusConfig: Record<AcceptanceCategoryStatus, { label: string; colour: string; icon: string }> = {
  pass: { label: 'Pass', colour: 'bg-emerald-900/40 text-emerald-400 border-emerald-900/60', icon: '✓' },
  partial: { label: 'Partial', colour: 'bg-azure/20 text-azure-300 border-azure/40', icon: '◐' },
  fail: { label: 'Fail', colour: 'bg-red-900/40 text-red-400 border-red-900/60', icon: '✕' },
  not_assessed: { label: 'Not Assessed', colour: 'bg-slate-800 text-slate-400 border-slate-700', icon: '○' },
}

type Props = {
  name: string
  status: AcceptanceCategoryStatus
  notes: string
  aiNarrative: string
}

export default function AcceptanceCategoryCard({ name, status, notes, aiNarrative }: Props) {
  const cfg = statusConfig[status]

  return (
    <div className={`rounded-xl bg-rm-dark-2/70 border p-5 flex flex-col gap-3 ${cfg.colour}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-sm flex-1">{name}</h3>
        <span className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${cfg.colour}`}>
          <span>{cfg.icon}</span>
          {cfg.label}
        </span>
      </div>
      {aiNarrative && (
        <p className="text-slate-400 text-xs leading-relaxed">{aiNarrative}</p>
      )}
      <p className="text-slate-600 text-[10px] font-mono">{notes}</p>
    </div>
  )
}
