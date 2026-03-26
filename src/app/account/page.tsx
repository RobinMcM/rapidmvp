import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import SignOutButton from '../../components/auth/SignOutButton'
import { ensureSuperTokensInit } from '../../lib/auth/supertokens-backend'

export const metadata = {
  title: 'Your Account | RapidMvᵖ.io',
  description: 'Manage your authenticated RapidMvᵖ session.',
}

export default async function AccountPage() {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error, accessTokenPayload } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/account')
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8 md:p-10">
        <p className="mb-2 text-sm uppercase tracking-wide text-blue-300">Authenticated</p>
        <h1 className="text-3xl font-bold text-white md:text-4xl">Account</h1>
        <p className="mt-4 text-slate-300">
          Signed in as <span className="font-mono text-slate-100">{String(accessTokenPayload?.sub ?? 'unknown')}</span>
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/clientbuild"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Client Build
          </Link>
          <SignOutButton />
        </div>
      </div>
    </section>
  )
}
