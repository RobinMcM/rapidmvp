import Link from 'next/link'

type Props = {
  id: string
  title: string
  slug: string
  status: string
  createdAt: Date
}

const statusColour: Record<string, string> = {
  draft: 'bg-slate-800 text-slate-400',
  active: 'bg-azure/20 text-azure-300',
  complete: 'bg-emerald-900/40 text-emerald-400',
}

export default function BlueprintStatusCard({ id, title, slug, status, createdAt }: Props) {
  return (
    <Link
      href={`/workspace/blueprints/${id}/assessment`}
      className="rounded-xl bg-rm-dark-2/70 border border-slate-800 hover:border-azure/40 hover:card-glow-azure transition-all duration-300 p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusColour[status] ?? statusColour.draft}`}>
          {status}
        </span>
        <span className="font-mono text-[10px] text-slate-600">
          {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm group-hover:text-azure-300 transition-colors">{title}</h3>
        <p className="text-slate-500 text-[11px] font-mono mt-0.5">{slug}</p>
      </div>
      <span className="text-azure text-xs font-medium mt-auto">View Blueprint →</span>
    </Link>
  )
}
