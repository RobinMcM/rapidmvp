import Link from 'next/link'
import RepositoryCard from './RepositoryCard'

type Repository = {
  id: string
  name: string
  slug: string
  status: string
  createdAt: Date
  readinessScore: number | null
}

type Props = {
  email: string
  company: string | null
  repositories: Repository[]
}

export default function RepositoryListView({ email, company, repositories }: Props) {
  return (
    <div className="bg-rm-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Welcome panel */}
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-6 flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-1">Repositories</p>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm">
            {company ? `${company} · ` : ''}<span className="font-mono">{email}</span>
          </p>
        </div>

        {/* Repository packages */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-lg">Your Repositories</h2>
            <Link
              href="/repositories/new"
              className="px-4 py-2 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors shadow-sm shadow-azure/20"
            >
              + Upload repository
            </Link>
          </div>

          {repositories.length === 0 ? (
            <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-azure/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-azure" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">No repositories yet</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Upload a repository ZIP and RapidMVP will inspect it and turn it into a cloud installation plan.
                </p>
              </div>
              <Link
                href="/repositories/new"
                className="px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors"
              >
                Upload your first repository
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.map((repo) => (
                <RepositoryCard key={repo.id} {...repo} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
