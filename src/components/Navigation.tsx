'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Session from 'supertokens-auth-react/recipe/session'
import { ensureFrontendSuperTokensInit } from '../lib/auth/supertokens-frontend'

const navItems = [
  { to: '/',                   label: 'Home' },
  { to: '/architecture-library', label: 'Architecture Library' },
  { to: '/blueprints',         label: 'Blueprints' },
  { to: '/insights',           label: 'Insights' },
  { to: '/contact',            label: 'Contact' },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [sessionExists, setSessionExists] = useState<boolean | null>(null)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    ensureFrontendSuperTokensInit()
    Session.doesSessionExist()
      .then((exists) => setSessionExists(exists))
      .catch(() => setSessionExists(false))
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await Session.signOut()
    setSessionExists(false)
    setMobileOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-rm-black/95 backdrop-blur-md border-b border-slate-800/80 shadow-xl shadow-black/20'
          : 'bg-rm-black/80 backdrop-blur-sm border-b border-slate-800/40'
      }`}
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="RapidMVP home"
        >
          {/* Azure square logo mark */}
          <span className="flex items-center justify-center w-7 h-7 rounded-md bg-azure text-white text-xs font-black tracking-tight select-none">
            R
          </span>
          <span className="text-white font-bold text-lg tracking-tight group-hover:text-azure-300 transition-colors">
            RapidMVP
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'text-white bg-slate-800/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {sessionExists ? (
            <>
              <Link
                href="/account"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/account'
                    ? 'text-white bg-slate-800/70'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="#register"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-azure text-white hover:bg-azure-600 hover:-translate-y-px transition-all shadow-sm shadow-azure/20"
          >
            Start Session
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-azure/50"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
        <div className="md:hidden border-t border-slate-800/60 px-4 pb-4 pt-3 flex flex-col gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'text-white bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 pt-3 border-t border-slate-800/60 flex flex-col gap-2">
            {sessionExists ? (
              <>
                <Link
                  href="/account"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
            <Link
              href="#register"
              className="mt-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-azure text-white text-center hover:bg-azure-600 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Start Architecture Session
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
