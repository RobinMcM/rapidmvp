'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Session from 'supertokens-auth-react/recipe/session'

export default function SignOutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignOut = async () => {
    setIsSubmitting(true)
    try {
      await Session.signOut()
      router.push('/')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="inline-flex items-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
