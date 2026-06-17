import CostEstimateCard from './CostEstimateCard'
import RiskRegisterCard from './RiskRegisterCard'

type CostRow = {
  id: string
  category: string
  costLevel: string | null
  costDriver: string | null
  notes: string | null
  optimisation: string | null
}

type RiskRow = {
  id: string
  category: string
  severity: string | null
  likelihood: string | null
  mitigation: string | null
  owner: string | null
}

type Props = { costs: CostRow[]; risks: RiskRow[] }

export default function CostsRisksView({ costs, risks }: Props) {
  return (
    <div className="flex flex-col gap-10">

      {/* Cost drivers */}
      <section>
        <div className="mb-4">
          <h2 className="text-white font-semibold text-lg">Potential Cost Drivers</h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-wider">
            Indicative cost areas to review — not a fixed budget or estimate
          </p>
        </div>
        {costs.length === 0 ? (
          <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-8 text-center text-slate-500 text-sm">
            No cost drivers defined for this blueprint yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {costs.map((c) => <CostEstimateCard key={c.id} {...c} />)}
          </div>
        )}
      </section>

      {/* Risk register */}
      <section>
        <div className="mb-4">
          <h2 className="text-white font-semibold text-lg">Risk Areas to Review</h2>
          <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-wider">
            Architecture risk register — not an exhaustive security audit
          </p>
        </div>
        {risks.length === 0 ? (
          <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-8 text-center text-slate-500 text-sm">
            No risks defined for this blueprint yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {risks.map((r) => <RiskRegisterCard key={r.id} {...r} />)}
          </div>
        )}
      </section>

    </div>
  )
}
