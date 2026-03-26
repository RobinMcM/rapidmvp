'use client'
import { useState } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Session from 'supertokens-auth-react/recipe/session'
import { ensureFrontendSuperTokensInit } from '../lib/auth/supertokens-frontend'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/process', label: 'Process' },
  { to: '/contact', label: 'Contact' },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sessionExists, setSessionExists] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    ensureFrontendSuperTokensInit()
    Session.doesSessionExist()
      .then((exists) => setSessionExists(exists))
      .catch(() => setSessionExists(false))
  }, [pathname])

  const handleSignOut = async () => {
    await Session.signOut()
    setSessionExists(false)
    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 py-4 px-6"
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          RapidMvᵖ.io
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`text-slate-300 hover:text-white transition-colors font-medium ${
                pathname === to ? 'text-white border-b-2 border-[#3b82f6] pb-0.5' : ''
              }`}
            >
              {label}
            </Link>
          ))}
          {sessionExists ? (
            <>
              <Link
                href="/account"
                className={`text-slate-300 hover:text-white transition-colors font-medium ${
                  pathname === '/account' ? 'text-white border-b-2 border-[#3b82f6] pb-0.5' : ''
                }`}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className={`text-slate-300 hover:text-white transition-colors font-medium ${
                pathname === '/auth' ? 'text-white border-b-2 border-[#3b82f6] pb-0.5' : ''
              }`}
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-700/50 flex flex-col gap-2">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                pathname === to ? 'text-white bg-slate-800' : ''
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          {sessionExists ? (
            <>
              <Link
                href="/account"
                className={`block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                  pathname === '/account' ? 'text-white bg-slate-800' : ''
                }`}
                onClick={() => setMobileOpen(false)}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-left block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className={`block py-2 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
                pathname === '/auth' ? 'text-white bg-slate-800' : ''
              }`}
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
