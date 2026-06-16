const pillars = [
  {
    accent: 'azure',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'AI Engineering',
    headline: 'Intelligence built in, not bolted on.',
    description:
      'We design intelligent systems that learn, adapt and scale with your organisation — from AI-powered workflows to autonomous decision engines using Azure OpenAI and edge inference.',
    tags: ['Azure OpenAI', 'RAG Systems', 'AI Agents', 'LLM Integration'],
  },
  {
    accent: 'azure',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    label: 'Azure Architecture',
    headline: 'Enterprise platforms that scale without limits.',
    description:
      'Proven Azure landing zones, multi-region deployments and enterprise-grade security models. We translate your growth ambitions into scalable, cost-effective cloud infrastructure.',
    tags: ['Azure Container Apps', 'Landing Zones', 'Azure Functions', 'IaC'],
  },
  {
    accent: 'cf-orange',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    label: 'Cloudflare Edge',
    headline: 'Global performance and security at the edge.',
    description:
      'Your users are everywhere — your platform should be too. We architect Cloudflare edge networks that deliver sub-100ms response times, enterprise security and zero-trust access globally.',
    tags: ['Cloudflare Workers', 'Zero Trust', 'CDN', 'Edge Security'],
  },
  {
    accent: 'azure',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    label: 'Platform Engineering',
    headline: 'Operational excellence from day one.',
    description:
      'Modern DevOps, CI/CD automation and infrastructure as code practices that reduce toil, increase deployment confidence and give your engineering teams the platform they deserve.',
    tags: ['GitHub Actions', 'Terraform', 'Bicep', 'Observability'],
  },
]

export default function TechnologyPillars() {
  return (
    <section className="bg-rm-dark/50 py-24 px-6" aria-label="Technology pillars">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="label-mono text-azure mb-4">Platform Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Four pillars of modern cloud engineering
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every RapidMVP architecture session draws on expertise across AI, cloud, edge and platform engineering to produce a holistic solution.
          </p>
        </div>

        {/* Pillar grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map(({ accent, icon, label, headline, description, tags }) => {
            const isOrange = accent === 'cf-orange'
            return (
              <article
                key={label}
                className={`relative group rounded-xl border bg-rm-dark-2/60 p-6 flex flex-col gap-4 transition-all duration-300 ${
                  isOrange
                    ? 'border-slate-800 hover:border-cf-orange/40 card-glow-orange'
                    : 'border-slate-800 hover:border-azure/40 card-glow-azure'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    isOrange
                      ? 'bg-cf-orange/10 text-cf-orange'
                      : 'bg-azure/10 text-azure'
                  }`}
                >
                  {icon}
                </div>

                {/* Label */}
                <p className={`label-mono text-[10px] ${isOrange ? 'text-cf-300' : 'text-azure-300'}`}>
                  {label}
                </p>

                {/* Headline */}
                <h3 className="text-white font-semibold text-base leading-snug">
                  {headline}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed flex-1">
                  {description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
