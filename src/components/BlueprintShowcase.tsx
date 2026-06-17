import Link from 'next/link'

const blueprints = [
  {
    slug: 'ai-saas-platform',
    category: 'AI Platform',
    title: 'AI SaaS Platform',
    description:
      'Multi-tenant SaaS with embedded AI capabilities, enterprise authentication and global edge delivery.',
    services: ['Azure Container Apps', 'Azure OpenAI', 'PostgreSQL Flexible Server', 'Cloudflare', 'Azure AI Search'],
    deliverables: [
      'AI-native architecture blueprint',
      'Multi-tenant data isolation model',
      'GDPR-compliant data flows',
      'Cloudflare edge security layer',
    ],
    accentColor: 'azure',
  },
  {
    slug: 'global-content-platform',
    category: 'Content Platform',
    title: 'Global Content Platform',
    description:
      'High-performance content delivery platform with edge caching, global distribution and intelligent routing.',
    services: ['Cloudflare Workers', 'Cloudflare CDN', 'Azure Functions', 'Azure Blob Storage', 'Azure Front Door'],
    deliverables: [
      'Edge-first architecture design',
      'Cache strategy and invalidation model',
      'Multi-region failover topology',
      'Cost optimisation analysis',
    ],
    accentColor: 'cf-orange',
  },
  {
    slug: 'enterprise-automation-platform',
    category: 'Enterprise',
    title: 'Enterprise Automation Platform',
    description:
      'Secure internal automation platform with Zero Trust access, workflow orchestration and AI-assisted processing.',
    services: ['Azure Container Apps', 'Cloudflare Zero Trust', 'Azure Service Bus', 'Azure AI', 'Azure Key Vault'],
    deliverables: [
      'Zero Trust access architecture',
      'Workflow orchestration design',
      'Security control framework',
      'DevOps and deployment strategy',
    ],
    accentColor: 'azure',
  },
]

export default function BlueprintShowcase() {
  return (
    <section className="bg-rm-black py-24 px-6" aria-label="Blueprint showcase">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <p className="label-mono text-azure mb-4">Example Blueprints</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Architecture patterns proven in production
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Each blueprint is the output of a real architecture session — a complete, documented platform design tailored to specific requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blueprints.map(({ slug, category, title, description, services, deliverables, accentColor }) => {
            const isOrange = accentColor === 'cf-orange'
            return (
              <Link
                key={slug}
                href={`/blueprints/${slug}`}
                className={`rounded-xl border bg-rm-dark-2/70 p-6 flex flex-col gap-5 transition-all duration-300 group ${
                  isOrange
                    ? 'border-slate-800 hover:border-cf-orange/40 card-glow-orange'
                    : 'border-slate-800 hover:border-azure/40 card-glow-azure'
                }`}
              >
                {/* Category tag */}
                <span
                  className={`self-start label-mono text-[10px] px-2 py-1 rounded-md ${
                    isOrange
                      ? 'bg-cf-orange/10 text-cf-300'
                      : 'bg-azure/10 text-azure-300'
                  }`}
                >
                  {category}
                </span>

                {/* Title & description */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-azure-300 transition-colors">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>

                {/* Services */}
                <div>
                  <p className="label-mono text-slate-600 text-[10px] mb-2.5">Technology Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {services.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <p className="label-mono text-slate-600 text-[10px] mb-2.5">Deliverables</p>
                  <ul className="space-y-1.5">
                    {deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className={`mt-0.5 flex-shrink-0 ${isOrange ? 'text-cf-orange' : 'text-azure'}`}>›</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="label-mono text-slate-600 text-[10px]">
                    Documentation generated · Implementation-ready
                  </span>
                  <span className={`text-xs font-medium ${isOrange ? 'text-cf-orange' : 'text-azure'}`}>
                    View →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
