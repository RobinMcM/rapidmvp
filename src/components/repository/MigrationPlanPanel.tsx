import type {
  MigrationPlan,
  MigrationMapping,
  MigrationComplexity,
} from '../../lib/repository/migration-mapper'
import { COMPLEXITY_LABEL, CATEGORY_LABEL } from '../../lib/repository/migration-mapper'

const COMPLEXITY_STYLE: Record<MigrationComplexity, string> = {
  none: 'bg-slate-800 text-slate-400',
  low: 'bg-emerald-900/40 text-emerald-300',
  medium: 'bg-amber-900/30 text-amber-300',
  high: 'bg-orange-900/40 text-orange-300',
}

type GroupStyle = { title: string; help: string; accent: string; dot: string }

const GROUPS: { key: keyof MigrationPlan['groups']; style: GroupStyle }[] = [
  {
    key: 'remain',
    style: {
      title: 'What Can Remain',
      help: 'These components can stay as they are — no migration required.',
      accent: 'border-emerald-900/50',
      dot: 'bg-emerald-500',
    },
  },
  {
    key: 'migrate',
    style: {
      title: 'What Should Migrate',
      help: 'These components have a recommended Azure-native target.',
      accent: 'border-azure/30',
      dot: 'bg-azure',
    },
  },
  {
    key: 'clarify',
    style: {
      title: 'Requires Clarification',
      help: 'These components need confirmation before an Azure target is finalised.',
      accent: 'border-slate-700/60',
      dot: 'bg-slate-500',
    },
  },
]

function MappingRow({ m }: { m: MigrationMapping }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {CATEGORY_LABEL[m.category]}
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${COMPLEXITY_STYLE[m.complexity]}`}>
          {COMPLEXITY_LABEL[m.complexity]} complexity
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white font-medium text-sm">{m.currentState}</span>
        <span className="text-slate-600">→</span>
        <span className="text-azure-300 font-medium text-sm">{m.azureState}</span>
      </div>
      <p className="text-slate-400 text-xs mt-1">{m.notes}</p>
      {m.detectedFrom.length > 0 && (
        <p className="text-slate-600 text-[11px] font-mono mt-1 break-all">
          Evidence: {m.detectedFrom.join(', ')}
        </p>
      )}
    </div>
  )
}

export default function MigrationPlanPanel({ plan }: { plan: MigrationPlan | null }) {
  if (!plan) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">Inspect the repository to generate its Azure migration plan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Azure migration plan</p>
        <h3 className="text-white font-semibold text-base">How this repository maps onto Azure</h3>
        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-900/40 text-emerald-300">{plan.counts.remain} can remain</span>
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-azure/20 text-azure-300">{plan.counts.migrate} to migrate</span>
          <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-400">{plan.counts.clarify} to clarify</span>
        </div>
      </div>

      {GROUPS.map(({ key, style }) => {
        const items = plan.groups[key]
        if (items.length === 0) return null
        return (
          <div key={key} className={`rounded-xl bg-rm-dark-2/70 border ${style.accent} overflow-hidden`}>
            <div className="px-5 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className="text-slate-200 font-semibold text-sm">{style.title}</span>
                <span className="text-slate-500 text-xs">({items.length})</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">{style.help}</p>
            </div>
            <div className="divide-y divide-slate-800/50">
              {items.map((m, i) => (
                <MappingRow key={`${m.category}-${m.currentState}-${i}`} m={m} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
