import type { LeakageItem, RiskDecision } from '../../lib/financial/resilience-scorer'
import ScoreGauge from './ScoreGauge'
import CostLeakageCard from './CostLeakageCard'
import RiskDecisionTable from './RiskDecisionTable'

type Props = {
  score: number
  leakageItems: LeakageItem[]
  riskDecision: RiskDecision
  aiSummary: string | null
  generatedAt: Date
}

export default function FinancialAssessmentView({ score, leakageItems, riskDecision, aiSummary, generatedAt }: Props) {
  return (
    <div className="flex flex-col gap-8">

      {/* Score gauge */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800">
        <ScoreGauge score={score} />
        <div className="border-t border-slate-800/60 px-5 py-3">
          <p className="text-slate-600 text-[10px] font-mono text-center">
            Generated {new Date(generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — rerun to refresh
          </p>
        </div>
      </div>

      {/* AI summary */}
      {aiSummary && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-3">Financial Risk Summary</p>
          <p className="text-slate-300 text-sm leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Cost leakage */}
      <section>
        <h2 className="text-white font-semibold text-base mb-4">Indicative Cost Leakage Areas</h2>
        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-3">
          Potential cost governance gaps — not guaranteed savings or fixed costs
        </p>
        {leakageItems.length === 0 ? (
          <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-6 text-center text-slate-500 text-sm">
            No cost leakage items detected.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leakageItems.map((item, i) => (
              <CostLeakageCard key={i} {...item} />
            ))}
          </div>
        )}
      </section>

      {/* Risk decision table */}
      <section>
        <h2 className="text-white font-semibold text-base mb-4">Client Risk Decision Framework</h2>
        <RiskDecisionTable currentTier={riskDecision.tier} />
      </section>

    </div>
  )
}
