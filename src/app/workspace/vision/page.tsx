import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../../lib/auth/supertokens-backend'
import SoftwareProjectAnalysisSection from '../../../components/repository/SoftwareProjectAnalysisSection'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Analyse a repository | RapidMVP',
  description: 'Upload a repository to generate Azure deployment guidance.',
}

export default async function NewAnalysisPage() {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/workspace/vision')
  }

  return (
    <div className="bg-rm-black min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-10">

        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-2">New analysis</p>
          <h1 className="text-3xl font-bold text-white mb-2">Analyse a repository</h1>
          <p className="text-slate-400 text-sm">
            Upload a repository ZIP to detect its stack, map environment variables and secrets, and generate
            Azure deployment guidance and a deployment readiness report.
          </p>
        </div>

        <SoftwareProjectAnalysisSection />

      </div>
    </div>
  )
}
