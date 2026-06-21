import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../../lib/auth/supertokens-backend'
import RepositoryUploadFlow from '../../../components/repository/RepositoryUploadFlow'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Upload a repository | RapidMVP',
  description: 'Upload a repository ZIP to inspect it and plan its cloud installation.',
}

export default async function NewRepositoryPage() {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/repositories/new')
  }

  return (
    <div className="bg-rm-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-2">New repository</p>
          <h1 className="text-3xl font-bold text-white mb-2">Upload your repository</h1>
          <p className="text-slate-400 text-sm">
            Give RapidMVP the repository ZIP file. We inspect it, identify what it needs, and turn it into a
            cloud installation plan with a stakeholder handover report.
          </p>
        </div>

        <RepositoryUploadFlow />
      </div>
    </div>
  )
}
