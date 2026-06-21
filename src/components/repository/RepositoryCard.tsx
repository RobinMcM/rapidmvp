import Link from 'next/link'

type Props = {
  id: string
  name: string
  slug: string
  status: string
  createdAt: Date
  readinessScore: number | null
}

const statusColour: Record<string, string> = {
  uploaded:   'bg-slate-800 text-slate-400',
  inspecting: 'bg-azure/20 text-azure-300',
  inspected:  'bg-emerald-900/40 text-emerald-400',
  failed:     'bg-red-900/40 text-red-400',
}

const statusLabel: Record<string, string> = {
  uploaded:   'Uploaded',
  inspecting: 'Inspecting',
  inspected:  'Inspected',
  failed:     'Failed',
}

export default function RepositoryCard({ id, name, slug, status, createdAt, readinessScore }: Props) {
  return (
    <Link
      href={`/repositories/${id}`}
      className="rounded-xl bg-rm-dark-2/70 border border-slate-800 hover:border-azure/40 hover:card-glow-azure transition-all duration-300 p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusColour[status] ?? statusColour.uploaded}`}>
          {statusLabel[status] ?? status}
        </span>
        <span className="font-mono text-[10px] text-slate-600">
          {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm group-hover:text-azure-300 transition-colors">{name}</h3>
        <p className="text-slate-500 text-[11px] font-mono mt-0.5">{slug}</p>
      </div>
      {typeof readinessScore === 'number' && (
        <p className="text-slate-400 text-xs mt-auto">Cloud Readiness: <span className="text-white font-semibold">{readinessScore}/100</span></p>
      )}
      <span className="text-azure text-xs font-medium mt-auto">Open →</span>
    </Link>
  )
}
