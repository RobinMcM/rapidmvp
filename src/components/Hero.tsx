import Link from 'next/link'

export default function Hero() {
  return (
    <header className="relative overflow-hidden bg-rm-black" aria-label="Hero">

      {/* ── Background layers ── */}
      <div
        className="absolute inset-0 grid-animated opacity-100"
        aria-hidden
      />
      {/* Azure glow — top left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] glow-azure opacity-60 animate-glow-pulse"
        aria-hidden
      />
      {/* CF orange glow — bottom right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] glow-orange opacity-50"
        aria-hidden
      />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-rm-black/20 via-transparent to-rm-black"
        aria-hidden
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-32 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-azure/30 bg-azure/8 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-azure animate-pulse" />
          <span className="label-mono text-azure-300 text-[11px]">
            AI-Native Architecture Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-8 max-w-5xl mx-auto">
          <span className="text-white">AI-Native Cloud</span>
          <br />
          <span className="text-gradient-brand">
            Architecture &amp; Engineering
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          RapidMVP helps organisations design, validate and evolve modern cloud
          platforms using AI-assisted architecture, Azure cloud services and
          Cloudflare edge infrastructure.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="#register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base bg-azure text-white hover:bg-azure-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-azure/25"
          >
            Analyse a repository
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white hover:-translate-y-0.5 transition-all"
          >
            Talk to us
          </Link>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-azure" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-500">Microsoft Azure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cf-orange" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-500">Cloudflare Edge</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-azure" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-500">AI-Native</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-azure" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-500">Enterprise-Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-azure" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-slate-500">Architecture-First</span>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="divider-azure" aria-hidden />
    </header>
  )
}
