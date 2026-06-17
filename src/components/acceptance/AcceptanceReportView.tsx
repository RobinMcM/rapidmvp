import type { AcceptanceCategoryResult, AcceptanceCategoryStatus } from '../../../types/acceptance'
import AcceptanceCategoryCard from './AcceptanceCategoryCard'

const overallBanner: Record<string, { label: string; colour: string }> = {
  pass: { label: 'Acceptance: Pass', colour: 'bg-emerald-900/40 border-emerald-800/60 text-emerald-300' },
  partial: { label: 'Acceptance: Partial', colour: 'bg-azure/20 border-azure/40 text-azure-300' },
  fail: { label: 'Acceptance: Fail', colour: 'bg-red-900/40 border-red-800/60 text-red-300' },
}

type Props = {
  overallStatus: string
  categories: AcceptanceCategoryResult[]
  generatedAt: Date
}

export default function AcceptanceReportView({ overallStatus, categories, generatedAt }: Props) {
  const banner = overallBanner[overallStatus] ?? overallBanner.partial

  return (
    <div className="flex flex-col gap-6">
      {/* Overall status banner */}
      <div className={`rounded-xl border p-5 flex items-center justify-between ${banner.colour}`}>
        <div>
          <p className="font-bold text-lg">{banner.label}</p>
          <p className="text-sm opacity-70">
            Validation gate review — not a certification or audit
          </p>
        </div>
        <span className="text-xs font-mono opacity-50">
          Generated {new Date(generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* 15 category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <AcceptanceCategoryCard
            key={c.name}
            name={c.name}
            status={c.status as AcceptanceCategoryStatus}
            notes={c.notes}
            aiNarrative={c.aiNarrative}
          />
        ))}
      </div>
    </div>
  )
}
