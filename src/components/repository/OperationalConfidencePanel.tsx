import type {
  OperationalConfidence,
  ConfidenceCategory,
  ConfidenceStatus,
} from '../../lib/repository/operational-confidence'
import { CONFIDENCE_STATUS_LABEL } from '../../lib/repository/operational-confidence'

const STATUS_STYLE: Record<ConfidenceStatus, { badge: string; dot: string }> = {
  validated: { badge: 'bg-emerald-900/40 text-emerald-300', dot: 'bg-emerald-500' },
  partially_validated: { badge: 'bg-amber-900/30 text-amber-300', dot: 'bg-amber-500' },
  requires_clarification: { badge: 'bg-slate-800 text-slate-300', dot: 'bg-slate-500' },
  not_yet_validated: { badge: 'bg-slate-800 text-slate-400', dot: 'bg-slate-600' },
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-slate-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-white font-bold text-sm w-14 text-right">{score}%</span>
    </div>
  )
}

function CategoryCard({ c }: { c: ConfidenceCategory }) {
  const s = STATUS_STYLE[c.status]
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-slate-200 font-semibold text-sm">{c.label}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.badge}`}>
          {CONFIDENCE_STATUS_LABEL[c.status]}
        </span>
      </div>
      <div className="px-5 py-3 flex flex-col gap-3">
        <ScoreBar score={c.score} />
        <ul className="flex flex-col gap-1.5">
          {c.signals.map((sig, i) => (
            <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
              <span className="text-slate-600 mt-0.5 flex-shrink-0">•</span>
              <span>{sig}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function QuestionList({ title, items, tone }: { title: string; items: string[]; tone: 'know' | 'need' | 'clarify' }) {
  if (items.length === 0) return null
  const toneStyle =
    tone === 'know' ? 'text-emerald-300' : tone === 'need' ? 'text-azure-300' : 'text-slate-300'
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
      <p className={`font-semibold text-sm mb-3 ${toneStyle}`}>{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
            <span className="text-slate-600 mt-0.5 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function OperationalConfidencePanel({ confidence }: { confidence: OperationalConfidence | null }) {
  if (!confidence) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">Inspect the repository to assess operational confidence.</p>
      </div>
    )
  }

  const s = STATUS_STYLE[confidence.status]

  return (
    <div className="flex flex-col gap-6">
      {/* Overall */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Operational confidence</p>
            <h3 className="text-white font-semibold text-base">How confidently could another team operate this on Azure?</h3>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0 ${s.badge}`}>
            {CONFIDENCE_STATUS_LABEL[confidence.status]}
          </span>
        </div>
        <ScoreBar score={confidence.score} />
        <p className="text-slate-500 text-xs">
          An operational readiness assessment — not a code-quality or developer score.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {confidence.categories.map((c) => (
          <CategoryCard key={c.key} c={c} />
        ))}
      </div>

      {/* Know / Need / Clarify */}
      <QuestionList title="What do we know?" items={confidence.whatWeKnow} tone="know" />
      <QuestionList title="What do we need?" items={confidence.whatWeNeed} tone="need" />
      <QuestionList title="What still requires clarification?" items={confidence.requiresClarification} tone="clarify" />
    </div>
  )
}
