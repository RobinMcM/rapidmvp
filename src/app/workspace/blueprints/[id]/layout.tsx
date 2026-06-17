import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import type { ReactNode } from 'react'
import { ensureSuperTokensInit } from '../../../../lib/auth/supertokens-backend'
import { requireWorkspaceUser } from '../../../../lib/server/workspace-access'
import { requireBlueprintOwnership } from '../../../../lib/server/workspace-access'
import BlueprintSubNav from '../../../../components/workspace/BlueprintSubNav'

export const runtime = 'nodejs'

export default async function BlueprintLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/workspace')
  }

  const { id } = await params
  const { dbUser } = await requireWorkspaceUser()
  const blueprint = await requireBlueprintOwnership(id, dbUser.id)

  return (
    <div className="bg-rm-black min-h-screen">
      {/* Blueprint header */}
      <div className="bg-rm-dark border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Architecture Blueprint</p>
          <h1 className="text-white font-bold text-xl">{blueprint.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[11px] text-slate-500">{blueprint.slug}</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">{blueprint.status}</span>
          </div>
        </div>
      </div>

      <BlueprintSubNav blueprintId={id} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
