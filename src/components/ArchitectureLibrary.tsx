import Link from 'next/link'

const patterns = [
  {
    slug: 'ai-saas-platform',
    category: 'AI Platform',
    title: 'AI SaaS Platform',
    description:
      'Multi-tenant SaaS architecture with embedded Azure OpenAI capabilities, RAG pipelines and enterprise-grade security.',
    stack: ['Azure Container Apps', 'Azure OpenAI', 'PostgreSQL', 'Cloudflare', 'Redis Cache'],
    decisions: ['Event-driven AI pipeline', 'Vector search with AI Search', 'Token-based tenancy isolation'],
    security: 'GDPR-compliant, private endpoints, RBAC',
    deployment: 'Blue-green with feature flags',
    accentColor: 'azure',
  },
  {
    slug: 'multi-tenant-saas-platform',
    category: 'SaaS',
    title: 'Multi-Tenant SaaS Platform',
    description:
      'Scalable multi-tenant architecture with data isolation, usage metering, subscription management and global availability.',
    stack: ['Azure Container Apps', 'Azure SQL', 'Cloudflare Workers', 'Azure Service Bus', 'Stripe'],
    decisions: ['Schema-per-tenant isolation', 'Async billing events', 'Feature flag per tier'],
    security: 'Tenant-scoped auth, audit logging, PCI scope isolation',
    deployment: 'Zero-downtime rolling deploys',
    accentColor: 'azure',
  },
  {
    slug: 'rag-knowledge-platform',
    category: 'AI / Knowledge',
    title: 'RAG Knowledge Platform',
    description:
      'Enterprise knowledge retrieval platform using Retrieval-Augmented Generation, semantic search and Azure AI infrastructure.',
    stack: ['Azure AI Search', 'Azure OpenAI', 'Azure Functions', 'Cloudflare', 'Azure Blob Storage'],
    decisions: ['Hybrid search (vector + keyword)', 'Document chunking strategy', 'Relevance scoring pipeline'],
    security: 'Document-level ACL, MSFT Entra auth',
    deployment: 'Serverless with staged rollout',
    accentColor: 'azure',
  },
  {
    slug: 'global-content-platform',
    category: 'Content & Edge',
    title: 'Global Content Platform',
    description:
      'High-throughput content delivery architecture optimised for sub-100ms global performance using Cloudflare edge infrastructure.',
    stack: ['Cloudflare Workers', 'Cloudflare CDN', 'Azure Functions', 'Azure Blob Storage', 'Azure Front Door'],
    decisions: ['Edge-first rendering', 'Cache-aside with stale-while-revalidate', 'Origin shield topology'],
    security: 'WAF rules, rate limiting, bot management',
    deployment: 'Cloudflare Pages CI/CD integration',
    accentColor: 'cf-orange',
  },
  {
    slug: 'enterprise-automation-platform',
    category: 'Enterprise',
    title: 'Enterprise Automation Platform',
    description:
      'Secure internal workflow automation with Zero Trust access, AI-assisted processing and enterprise integration patterns.',
    stack: ['Azure Container Apps', 'Cloudflare Zero Trust', 'Azure Service Bus', 'Azure AI', 'Azure Key Vault'],
    decisions: ['WASM worker isolation', 'Saga pattern for workflows', 'Secrets rotation automation'],
    security: 'Zero Trust network, device trust, MFA enforced',
    deployment: 'GitOps with policy gates',
    accentColor: 'azure',
  },
]

export default function ArchitectureLibrary() {
  return (
    <section className="bg-rm-dark py-24 px-6" aria-label="Architecture library" id="library">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="label-mono text-azure mb-4">Architecture Library</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Proven architecture patterns
            </h2>
            <p className="text-slate-400 max-w-lg">
              Reference blueprints drawn from real architecture sessions — each representing
              a validated, production-ready design pattern.
            </p>
          </div>
          <Link
            href="/architecture-library"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-colors"
          >
            View all patterns
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patterns.map(({ slug, category, title, description, stack, decisions, security, deployment, accentColor }) => {
            const isOrange = accentColor === 'cf-orange'
            return (
              <Link
                key={slug}
                href={`/blueprints/${slug}`}
                className={`rounded-xl border bg-rm-dark-2/70 overflow-hidden flex flex-col transition-all duration-300 group cursor-pointer select-none ${
                  isOrange
                    ? 'border-slate-800 hover:border-cf-orange/40 card-glow-orange'
                    : 'border-slate-800 hover:border-azure/40 card-glow-azure'
                }`}
              >
                {/* Header bar */}
                <div className={`h-0.5 ${isOrange ? 'bg-gradient-to-r from-cf-600 to-cf-orange' : 'bg-gradient-to-r from-azure-600 to-azure-400'}`} />

                <div className="p-6 flex flex-col gap-4 flex-1">
                  {/* Category */}
                  <span className={`self-start label-mono text-[10px] px-2 py-1 rounded ${
                    isOrange ? 'bg-cf-orange/10 text-cf-300' : 'bg-azure/10 text-azure-300'
                  }`}>
                    {category}
                  </span>

                  {/* Title & description */}
                  <div>
                    <h3 className="text-white font-bold text-base mb-2 group-hover:text-azure-300 transition-colors">
                      {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                  </div>

                  {/* Stack */}
                  <div>
                    <p className="label-mono text-slate-600 text-[10px] mb-2">Stack</p>
                    <div className="flex flex-wrap gap-1">
                      {stack.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800/80 text-slate-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Design decisions */}
                  <div>
                    <p className="label-mono text-slate-600 text-[10px] mb-2">Key Decisions</p>
                    <ul className="space-y-1">
                      {decisions.map((d) => (
                        <li key={d} className="flex items-start gap-1.5 text-xs text-slate-500">
                          <span className={`flex-shrink-0 mt-0.5 ${isOrange ? 'text-cf-orange' : 'text-azure'}`}>›</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Security + Deployment */}
                  <div className="mt-auto pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3">
                    <div>
                      <p className="label-mono text-slate-700 text-[9px] mb-1">Security</p>
                      <p className="text-slate-500 text-[11px]">{security}</p>
                    </div>
                    <div>
                      <p className="label-mono text-slate-700 text-[9px] mb-1">Deployment</p>
                      <p className="text-slate-500 text-[11px]">{deployment}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
