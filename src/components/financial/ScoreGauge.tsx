type Props = { score: number }

function tierLabel(score: number) {
  if (score <= 39) return { label: 'High Financial Risk', colour: 'text-red-400' }
  if (score <= 69) return { label: 'Moderate Financial Risk', colour: 'text-amber-400' }
  return { label: 'Acceptable Financial Posture', colour: 'text-emerald-400' }
}

export default function ScoreGauge({ score }: Props) {
  const { label, colour } = tierLabel(score)

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <span className={`text-7xl font-black tabular-nums ${colour}`}>{score}</span>
      <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">/ 100</span>
      <span className={`text-sm font-semibold ${colour}`}>{label}</span>
      <p className="text-slate-600 text-[10px] font-mono uppercase tracking-wider">Financial resilience score — not a cost estimate</p>
    </div>
  )
}
