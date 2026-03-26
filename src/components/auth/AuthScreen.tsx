'use client'

import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Session from 'supertokens-auth-react/recipe/session'
import { canHandleRoute, getRoutingComponent } from 'supertokens-auth-react/ui'
import { ensureFrontendSuperTokensInit, preBuiltUiList } from '../../lib/auth/supertokens-frontend'

export default function AuthScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectTo') ?? '/account'
  const [isClientReady, setIsClientReady] = useState(false)

  useEffect(() => {
    ensureFrontendSuperTokensInit()
    setIsClientReady(true)

    Session.doesSessionExist().then((exists) => {
      if (exists) {
        router.replace(redirectTo)
      }
    })
  }, [redirectTo, router])

  if (isClientReady && canHandleRoute(preBuiltUiList)) {
    return (
      <section className="mx-auto flex min-h-[75vh] max-w-6xl items-center px-6 py-16">
        <div className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(59,130,246,0.08)] md:p-10">
          {getRoutingComponent(preBuiltUiList)}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-6 py-16">
      <p className="text-slate-300">Preparing authentication UI...</p>
    </section>
  )
}
