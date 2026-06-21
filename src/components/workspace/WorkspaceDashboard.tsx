import Link from 'next/link'
import WorkspaceCard from './WorkspaceCard'
import BlueprintStatusCard from './BlueprintStatusCard'

type Blueprint = {
  id: string
  title: string
  slug: string
  status: string
  createdAt: Date
}

type Props = {
  email: string
  company: string | null
  blueprints: Blueprint[]
}

export default function WorkspaceDashboard({ email, company, blueprints }: Props) {
  return (
    <div className="bg-rm-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Welcome panel */}
        <WorkspaceCard className="p-6 flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-1">Workspace</p>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm">
            {company ? `${company} · ` : ''}<span className="font-mono">{email}</span>
          </p>
        </WorkspaceCard>

        {/* Repository analyses */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg">Repository Analyses</h2>
            <Link
              href="/workspace/vision"
              className="px-4 py-2 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors shadow-sm shadow-azure/20"
            >
              + New analysis
            </Link>
          </div>

          {blueprints.length === 0 ? (
            <WorkspaceCard className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-azure/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">No repository analyses yet</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Upload a repository to detect its stack, map its secrets, and generate Azure deployment guidance.
                </p>
              </div>
              <Link
                href="/workspace/vision"
                className="px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors"
              >
                Analyse your first repository
              </Link>
            </WorkspaceCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {blueprints.map((bp) => (
                <BlueprintStatusCard key={bp.id} {...bp} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
