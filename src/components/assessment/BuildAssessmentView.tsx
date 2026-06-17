import AssessmentLayerCard from './AssessmentLayerCard'

type AssessmentRow = {
  id: string
  layer: string
  status: string
  description: string | null
  tasksJson: string | null
  validationJson: string | null
  evidenceNotes: string | null
}

const STATUS_ORDER = ['live', 'production_ready', 'validated', 'in_progress', 'blocked', 'planned']

function statusRank(status: string) {
  const idx = STATUS_ORDER.indexOf(status)
  return idx === -1 ? 99 : idx
}

function progressPercent(rows: AssessmentRow[]) {
  if (!rows.length) return 0
  const done = rows.filter((r) => ['validated', 'production_ready', 'live'].includes(r.status)).length
  return Math.round((done / rows.length) * 100)
}

export default function BuildAssessmentView({ assessments }: { assessments: AssessmentRow[] }) {
  const sorted = [...assessments].sort((a, b) => statusRank(a.status) - statusRank(b.status))
  const pct = progressPercent(assessments)

  return (
    <div className="flex flex-col gap-6">
      {/* Progress overview */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Assessment Progress</p>
          <span className="text-white font-bold text-lg">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-azure-600 to-azure-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {(['live', 'production_ready', 'validated', 'in_progress', 'blocked', 'planned'] as const).map((s) => {
            const count = assessments.filter((a) => a.status === s).length
            if (!count) return null
            return (
              <span key={s} className="text-[11px] text-slate-500">
                {count} {s.replace('_', ' ')}
              </span>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
          <p className="text-slate-500 text-sm">No assessment layers defined yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((a) => {
            const tasks = a.tasksJson ? JSON.parse(a.tasksJson) : undefined
            const validationCriteria = a.validationJson ? JSON.parse(a.validationJson) : undefined
            return (
              <AssessmentLayerCard
                key={a.id}
                layer={a.layer}
                status={a.status}
                description={a.description}
                tasks={tasks}
                validationCriteria={validationCriteria}
                evidenceNotes={a.evidenceNotes}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
