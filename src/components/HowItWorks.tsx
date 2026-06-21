const steps = [
  {
    number: '01',
    title: 'Upload the repository ZIP',
    description:
      'Hand over the delivered software as a repository ZIP file. The ZIP is the single source of truth — no access to private systems required.',
  },
  {
    number: '02',
    title: 'Inspect what was delivered',
    description:
      'RapidMVP inspects the contents, detects the application stack, runtime, frameworks, database, storage, authentication and external services.',
  },
  {
    number: '03',
    title: 'Generate the cloud installation blueprint',
    description:
      'Required Azure resources, secrets and configuration are mapped automatically, with a cloud readiness score and any blockers surfaced before deployment.',
  },
  {
    number: '04',
    title: 'Configure secrets & install into Azure',
    description:
      'Infrastructure engineers get a step-by-step install guide — environment variables, Key Vault references and deployment steps to install it into the cloud.',
  },
  {
    number: '05',
    title: 'Produce the stakeholder handover report',
    description:
      'A plain-language handover report tells stakeholders what was delivered, what it does and whether it is ready — closing the gap between teams.',
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
            A structured process that takes you from a delivered repository ZIP to a
            cloud installation plan and a stakeholder-ready handover report.
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
            The repository ZIP is the handover artefact.
          </p>
          <p className="text-slate-400 max-w-lg mx-auto">
            RapidMVP closes the trust and communication gap between stakeholders, development teams
            and infrastructure engineers — everyone works from the same delivered software.
          </p>
        </div>

      </div>
    </section>
  )
}
