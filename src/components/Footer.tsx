import Link from 'next/link'

const CONTACT_EMAIL = 'mailto:hello@rapidmvp.io'

const platformLinks = [
  { href: '/#register', label: 'Analyse a repository' },
  { href: '/workspace', label: 'Workspace' },
]

const companyLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/auth',    label: 'Sign in' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms',   label: 'Terms' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-rm-dark/40">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-azure text-white text-xs font-black select-none">
                R
              </span>
              <span className="text-white font-bold text-lg tracking-tight group-hover:text-azure-300 transition-colors">
                RapidMVP
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              AI-Native Cloud Architecture &amp; Product Engineering Platform.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="label-mono text-slate-600 text-[10px]">Powered by</span>
              <span className="text-azure text-xs font-semibold">Azure</span>
              <span className="text-slate-700">·</span>
              <span className="text-cf-orange text-xs font-semibold">Cloudflare</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {platformLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={CONTACT_EMAIL}
                  className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                  hello@rapidmvp.io
                </a>
              </li>
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Get started
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Design your cloud platform architecture with the RapidMVP AI Architect.
            </p>
            <Link
              href="#register"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-azure text-white hover:bg-azure-600 transition-colors"
            >
              Analyse a repository
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} RapidMVP. All rights reserved.
          </p>
          <nav className="flex items-center gap-6" aria-label="Legal links">
            {legalLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-slate-600 hover:text-slate-400 text-xs transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
