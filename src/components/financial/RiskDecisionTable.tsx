import type { RiskDecision } from '../../../lib/financial/resilience-scorer'

const ALL_TIERS: { tier: RiskDecision['tier']; label: string; range: string; action: string }[] = [
  { tier: 'high', label: 'High Financial Risk', range: '0 – 39', action: 'Escalate to client leadership. Freeze non-critical spend pending remediation.' },
  { tier: 'moderate', label: 'Moderate Financial Risk', range: '40 – 69', action: 'Define remediation roadmap within 90 days. Prioritise tagging and budget alerts.' },
  { tier: 'acceptable', label: 'Acceptable Financial Posture', range: '70 – 100', action: 'Maintain governance cadence. Review quarterly.' },
]

const tierColour: Record<string, string> = {
  high: 'text-red-400',
  moderate: 'text-amber-400',
  acceptable: 'text-emerald-400',
}

export default function RiskDecisionTable({ currentTier }: { currentTier: RiskDecision['tier'] }) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">Score</th>
            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">Risk Tier</th>
            <th className="text-left p-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          {ALL_TIERS.map((t) => {
            const isActive = t.tier === currentTier
            return (
              <tr
                key={t.tier}
                className={`border-b border-slate-800/60 last:border-0 ${isActive ? 'bg-azure/10' : ''}`}
              >
                <td className={`p-3 font-mono text-xs ${isActive ? 'text-white font-bold' : 'text-slate-500'}`}>{t.range}</td>
                <td className={`p-3 font-semibold text-xs ${isActive ? tierColour[t.tier] : 'text-slate-500'}`}>
                  {t.label}
                  {isActive && <span className="ml-2 text-[10px] text-azure font-mono">← current</span>}
                </td>
                <td className={`p-3 text-xs ${isActive ? 'text-slate-300' : 'text-slate-600'}`}>{t.action}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
