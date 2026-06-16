const deliverables = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Executive Summary',
    description: 'Business-level overview of the recommended architecture, strategic rationale and expected outcomes.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: 'Azure Architecture',
    description: 'Recommended Azure services, resource topology, region selection and integration patterns.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Cloudflare Architecture',
    description: 'Edge network design, CDN strategy, Workers deployment plan and Zero Trust access model.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Security Review',
    description: 'Threat model, compliance mapping, security controls and identity architecture recommendations.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'AI Opportunities',
    description: 'Identified AI integration points, Azure OpenAI use cases and automation opportunities within your platform.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'DevOps Strategy',
    description: 'CI/CD pipeline design, GitHub Actions workflows, environment strategy and deployment automation plan.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Infrastructure as Code',
    description: 'Terraform or Bicep structure recommendations, module design and configuration management approach.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Scaling Strategy',
    description: 'Auto-scaling policies, performance benchmarks, capacity planning and cost optimisation guidance.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Implementation Roadmap',
    description: 'Phased implementation plan with clear milestones, dependency mapping and risk mitigation.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: 'Future Growth Considerations',
    description: 'Multi-region expansion, platform evolution paths and architectural decisions that protect future optionality.',
  },
]

export default function WhatYouReceive() {
  return (
    <section className="bg-rm-dark py-24 px-6" aria-label="What you receive">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <p className="label-mono text-azure mb-4">Architecture Session Output</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What you receive after every session
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Every architecture session with RapidMVP produces a complete, implementation-ready
            platform blueprint. No ambiguity. No hand-waving. Tangible outputs your team can act on.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {deliverables.map(({ icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-800 bg-rm-dark-2/60 p-5 flex flex-col gap-3 card-glow-azure transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-lg bg-azure/10 text-azure flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
            </article>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 rounded-xl border border-azure/20 bg-azure/5 p-8 text-center">
          <p className="text-white font-semibold text-lg mb-2">
            All outputs are delivered as structured documentation
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Exportable as PDF, Markdown and shareable team links — ready for stakeholder review and engineering handoff.
          </p>
          <a
            href="#register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-azure text-white hover:bg-azure-600 hover:-translate-y-0.5 transition-all shadow-md shadow-azure/20"
          >
            Request Your Architecture Blueprint
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}
