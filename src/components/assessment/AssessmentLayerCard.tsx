const statusConfig: Record<string, { label: string; colour: string }> = {
  planned: { label: 'Planned', colour: 'bg-slate-800 text-slate-400' },
  in_progress: { label: 'In Progress', colour: 'bg-azure/20 text-azure-300' },
  blocked: { label: 'Blocked', colour: 'bg-cf-orange/20 text-cf-300' },
  validated: { label: 'Validated', colour: 'bg-emerald-900/40 text-emerald-400' },
  production_ready: { label: 'Production Ready', colour: 'bg-green-900/40 text-green-400' },
  live: { label: 'Live', colour: 'bg-green-400/20 text-green-300 font-bold' },
}

type Task = { title: string; done: boolean }
type ValidationCriteria = { text: string; passed: boolean }

type Props = {
  layer: string
  status: string
  description?: string | null
  tasks?: Task[]
  validationCriteria?: ValidationCriteria[]
  evidenceNotes?: string | null
}

export default function AssessmentLayerCard({ layer, status, description, tasks, validationCriteria, evidenceNotes }: Props) {
  const cfg = statusConfig[status] ?? statusConfig.planned

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-white font-semibold text-sm">{layer}</h3>
        <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] ${cfg.colour}`}>{cfg.label}</span>
      </div>

      {description && (
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      )}

      {tasks && tasks.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Tasks</p>
          <ul className="space-y-1.5">
            {tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className={`flex-shrink-0 mt-0.5 ${t.done ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {t.done ? '✓' : '○'}
                </span>
                <span className={t.done ? 'line-through text-slate-600' : ''}>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationCriteria && validationCriteria.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Validation Gates</p>
          <ul className="space-y-1.5">
            {validationCriteria.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className={`flex-shrink-0 mt-0.5 ${v.passed ? 'text-emerald-500' : 'text-slate-600'}`}>
                  {v.passed ? '✓' : '○'}
                </span>
                {v.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evidenceNotes && (
        <div className="border-t border-slate-800/60 pt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-1">Evidence Notes</p>
          <p className="text-slate-500 text-xs leading-relaxed">{evidenceNotes}</p>
        </div>
      )}
    </div>
  )
}
