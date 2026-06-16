const differentiators = [
  {
    icon: '◈',
    title: 'Architecture before implementation',
    description: 'Every engagement starts with a structured architecture phase. Implementation follows architecture — never the reverse.',
    accent: 'azure',
  },
  {
    icon: '◇',
    title: 'AI-assisted discovery',
    description: 'The AI Architect accelerates requirement discovery and produces faster, more comprehensive platform recommendations.',
    accent: 'azure',
  },
  {
    icon: '◆',
    title: 'Azure-native expertise',
    description: 'Deep knowledge of Azure landing zones, Container Apps, Azure AI and enterprise integration patterns across all workload types.',
    accent: 'azure',
  },
  {
    icon: '◈',
    title: 'Cloudflare edge design',
    description: 'End-to-end Cloudflare architectures: Workers, Zero Trust, CDN, WAF and edge-native application patterns.',
    accent: 'cf-orange',
  },
  {
    icon: '◇',
    title: 'Security-first approach',
    description: 'Every blueprint includes a threat model, compliance mapping and security controls — not as an afterthought, but as a foundation.',
    accent: 'azure',
  },
  {
    icon: '◆',
    title: 'Infrastructure as Code',
    description: 'Architecture recommendations include IaC guidance — Terraform or Bicep structures that enable reproducible, version-controlled infrastructure.',
    accent: 'azure',
  },
  {
    icon: '◈',
    title: 'Collaborative engagement model',
    description: 'We augment your team, not replace it. Architecture decisions are made together with your technical leadership — not handed down from above.',
    accent: 'azure',
  },
  {
    icon: '◇',
    title: 'Platform-centric output',
    description: 'Every engagement produces structured, actionable documentation — not slide decks. Your team gets a blueprint they can implement.',
    accent: 'cf-orange',
  },
]

export default function WhyRapidMVP() {
  return (
    <section className="bg-rm-black py-24 px-6" aria-label="Why RapidMVP">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <p className="label-mono text-azure mb-4">Why RapidMVP</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Architecture expertise, AI-delivered
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            What separates RapidMVP from traditional consultancies and architecture reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {differentiators.map(({ icon, title, description, accent }) => {
            const isOrange = accent === 'cf-orange'
            return (
              <article
                key={title}
                className={`rounded-xl border border-slate-800 bg-rm-dark-2/60 p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 ${
                  isOrange ? 'card-glow-orange hover:border-cf-orange/30' : 'card-glow-azure hover:border-azure/30'
                }`}
              >
                <span className={`text-xl ${isOrange ? 'text-cf-orange' : 'text-azure'}`} aria-hidden>
                  {icon}
                </span>
                <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
              </article>
            )
          })}
        </div>

        {/* Social proof strip */}
        <div className="mt-16 pt-10 border-t border-slate-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { stat: 'Azure', sub: 'Cloud-native platform' },
              { stat: 'Cloudflare', sub: 'Edge infrastructure partner' },
              { stat: 'AI-Native', sub: 'Architecture-first delivery' },
            ].map(({ stat, sub }) => (
              <div key={stat}>
                <p className="text-2xl font-bold text-white mb-1">{stat}</p>
                <p className="text-slate-500 text-sm">{sub}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
