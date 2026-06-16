const steps = [
  {
    number: '01',
    title: 'Start Architecture Session',
    description:
      'Describe your business goals, current platform and growth ambitions. The AI Architect listens, asks clarifying questions and maps your requirements.',
  },
  {
    number: '02',
    title: 'Collaborative Discovery',
    description:
      'The AI Architect works alongside your team to uncover constraints, compliance requirements, team structure and technical context that shape the right architecture.',
  },
  {
    number: '03',
    title: 'Platform Blueprint Generation',
    description:
      'A tailored architecture recommendation is produced — covering Azure services, Cloudflare design, security model, AI opportunities and deployment topology.',
  },
  {
    number: '04',
    title: 'Review and Refine',
    description:
      'Your technical leads and stakeholders review the blueprint. Questions are answered, trade-offs discussed and the architecture refined until alignment is reached.',
  },
  {
    number: '05',
    title: 'Implementation Planning',
    description:
      'A phased implementation roadmap, Infrastructure as Code guidance and DevOps strategy give your engineering team a clear path from architecture to delivery.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-rm-dark-2/40 py-24 px-6" aria-label="How it works">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="label-mono text-azure mb-4">The Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How RapidMVP works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A structured, collaborative process that takes you from requirements to
            a production-ready architecture blueprint.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div
            className="hidden md:block absolute left-[2.625rem] top-10 bottom-10 w-px bg-gradient-to-b from-azure/40 via-azure/20 to-transparent"
            aria-hidden
          />

          <div className="space-y-8">
            {steps.map(({ number, title, description }, i) => (
              <div key={number} className="flex gap-6 md:gap-8 items-start group">

                {/* Step number circle */}
                <div className="flex-shrink-0 relative">
                  <div className="w-[5.25rem] h-[5.25rem] hidden md:flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full border-2 border-azure/50 bg-rm-dark flex items-center justify-center group-hover:border-azure group-hover:bg-azure/10 transition-all duration-300 z-10 relative">
                      <span className="label-mono text-azure text-[10px] font-bold">{number}</span>
                    </div>
                  </div>
                  {/* Mobile number */}
                  <div className="md:hidden w-9 h-9 mt-1 rounded-full border border-azure/50 bg-rm-dark flex items-center justify-center">
                    <span className="label-mono text-azure text-[10px] font-bold">{number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`pb-4 flex-1 ${i < steps.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-azure-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key differentiator */}
        <div className="mt-14 rounded-xl border border-azure/20 bg-azure/5 px-8 py-7 text-center">
          <p className="text-white font-semibold text-xl mb-2">
            We work with your team, not instead of your team.
          </p>
          <p className="text-slate-400 max-w-lg mx-auto">
            RapidMVP augments your engineers and technical leadership — providing architecture
            expertise and AI-assisted discovery that accelerates alignment, not replaces it.
          </p>
        </div>

      </div>
    </section>
  )
}
