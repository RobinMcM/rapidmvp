import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../../lib/auth/supertokens-backend'
import VisionWorkflowForm from '../../../components/vision/VisionWorkflowForm'
import SoftwareProjectAnalysisSection from '../../../components/repository/SoftwareProjectAnalysisSection'

export const runtime = 'nodejs'

export const metadata = {
  title: 'Architecture Session | RapidMVP',
  description: 'Start a new architecture session.',
}

export default async function VisionPage() {
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
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col gap-14">

        {/* Software Project Analysis — optional, runs before blueprint selection */}
        <SoftwareProjectAnalysisSection />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">or answer questions below</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Vision Workflow — step-by-step requirements capture */}
        <div>
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-2">Architecture Session</p>
            <h1 className="text-3xl font-bold text-white mb-2">Define your platform requirements</h1>
            <p className="text-slate-400 text-sm">
              Answer 10 questions to generate a tailored architecture blueprint and recommended platform pattern.
            </p>
          </div>
          <VisionWorkflowForm />
        </div>

      </div>
    </div>
  )
}
