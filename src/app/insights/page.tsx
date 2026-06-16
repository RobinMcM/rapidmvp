import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights — RapidMVP',
  description:
    'Technical insights on Azure, Cloudflare, AI and platform engineering from the RapidMVP architecture team.',
}

const categories = [
  {
    label: 'Azure',
    color: 'azure',
    articles: [
      {
        title: 'Azure Landing Zones: A practical guide for enterprise workloads',
        summary:
          'How to design Azure landing zones that support multi-team, multi-subscription workloads with consistent governance, security and networking.',
        tags: ['Azure', 'Landing Zones', 'Enterprise'],
      },
      {
        title: 'Choosing between Azure Container Apps and AKS',
        summary:
          'When to use managed container infrastructure versus full Kubernetes orchestration — a decision framework based on team size, workload complexity and operational maturity.',
        tags: ['Azure', 'Containers', 'Architecture'],
      },
      {
        title: 'Azure cost optimisation strategies for growing SaaS platforms',
        summary:
          'Practical techniques for reducing Azure spend without compromising reliability — reserved instances, spot workloads, auto-scaling policies and commitment tiers.',
        tags: ['Azure', 'Cost', 'SaaS'],
      },
    ],
  },
  {
    label: 'Cloudflare',
    color: 'cf-orange',
    articles: [
      {
        title: 'Cloudflare Workers: Edge compute patterns for modern applications',
        summary:
          'How to architect edge-native applications using Cloudflare Workers — routing, authentication, A/B testing and API gateway patterns that run at the network edge.',
        tags: ['Cloudflare', 'Workers', 'Edge'],
      },
      {
        title: 'Zero Trust architecture with Cloudflare Access',
        summary:
          'Replacing legacy VPN with Zero Trust network access — identity-aware security policies, device trust and application-level access control using Cloudflare Access.',
        tags: ['Cloudflare', 'Zero Trust', 'Security'],
      },
      {
        title: 'Cloudflare as your global API gateway',
        summary:
          'Using Cloudflare for API rate limiting, authentication offload, DDoS protection and intelligent routing — reducing origin load while improving reliability and security.',
        tags: ['Cloudflare', 'API', 'Architecture'],
      },
    ],
  },
  {
    label: 'AI Engineering',
    color: 'azure',
    articles: [
      {
        title: 'Designing production RAG systems on Azure',
        summary:
          'A complete architecture guide for Retrieval-Augmented Generation in production — vector stores, chunking strategies, hybrid search and latency optimisation using Azure AI Search.',
        tags: ['AI', 'RAG', 'Azure OpenAI'],
      },
      {
        title: 'AI agent architectures: Patterns and anti-patterns',
        summary:
          'How to design reliable AI agent systems — tool use, memory patterns, orchestration frameworks and failure modes that matter in production enterprise environments.',
        tags: ['AI', 'Agents', 'Architecture'],
      },
      {
        title: 'Enterprise AI governance: Security, compliance and data residency',
        summary:
          'What enterprise organisations need to know before deploying Azure OpenAI — data residency guarantees, compliance boundaries, logging requirements and model access controls.',
        tags: ['AI', 'Enterprise', 'Compliance'],
      },
    ],
  },
  {
    label: 'Platform Engineering',
    color: 'azure',
    articles: [
      {
        title: 'Infrastructure as Code at scale: Terraform vs Bicep for Azure',
        summary:
          'A practical comparison of Terraform and Azure Bicep for enterprise infrastructure — module design, state management, testing strategies and team workflow considerations.',
        tags: ['IaC', 'Terraform', 'Bicep'],
      },
      {
        title: 'GitHub Actions for enterprise Azure deployments',
        summary:
          'Designing CI/CD pipelines that are secure, auditable and scalable — environment protection rules, OIDC authentication, approval gates and deployment strategies.',
        tags: ['CI/CD', 'GitHub Actions', 'DevOps'],
      },
      {
        title: 'Platform engineering vs DevOps: What organisations get wrong',
        summary:
          'The distinction between platform engineering and DevOps — why building internal developer platforms accelerates delivery and reduces cognitive load for engineering teams.',
        tags: ['Platform Engineering', 'DevOps', 'Culture'],
      },
    ],
  },
  {
    label: 'Architecture Patterns',
    color: 'cf-orange',
    articles: [
      {
        title: 'Event-driven architecture on Azure: When and how to use it',
        summary:
          'A guide to event-driven patterns — Azure Service Bus, Event Grid and Event Hubs compared, with decision criteria based on throughput, ordering and consumer patterns.',
        tags: ['Architecture', 'Event-Driven', 'Azure'],
      },
      {
        title: 'Multi-region architecture: Active-active vs active-passive',
        summary:
          'When to design for active-active multi-region deployments versus active-passive failover — traffic routing, data replication and consistency trade-offs on Azure.',
        tags: ['Architecture', 'Multi-Region', 'Resilience'],
      },
      {
        title: 'Security architecture patterns for cloud-native platforms',
        summary:
          'A framework for designing security into cloud platforms from the start — network segmentation, identity architecture, secret management and zero-trust principles.',
        tags: ['Security', 'Architecture', 'Zero Trust'],
      },
    ],
  },
]

function CategorySection({
  label,
  color,
  articles,
}: {
  label: string
  color: string
  articles: { title: string; summary: string; tags: string[] }[]
}) {
  const isOrange = color === 'cf-orange'
  return (
    <section aria-label={`${label} insights`}>
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`h-px flex-1 ${isOrange ? 'bg-cf-orange/20' : 'bg-azure/20'}`}
          aria-hidden
        />
        <span className={`label-mono text-sm font-bold ${isOrange ? 'text-cf-orange' : 'text-azure'}`}>
          {label}
        </span>
        <div
          className={`h-px flex-1 ${isOrange ? 'bg-cf-orange/20' : 'bg-azure/20'}`}
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.map(({ title, summary, tags }) => (
          <article
            key={title}
            className={`rounded-xl border border-slate-800 bg-rm-dark-2/60 p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5 ${
              isOrange ? 'card-glow-orange hover:border-cf-orange/30' : 'card-glow-azure hover:border-azure/30'
            }`}
          >
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`label-mono text-[10px] px-2 py-0.5 rounded ${
                    isOrange ? 'bg-cf-orange/10 text-cf-300' : 'bg-azure/10 text-azure-300'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed flex-1">{summary}</p>
            <span
              className={`self-start text-xs font-medium mt-2 ${
                isOrange ? 'text-cf-orange' : 'text-azure'
              }`}
            >
              Coming soon →
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default function InsightsPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-rm-black pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-animated opacity-60" aria-hidden />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-azure opacity-25 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="label-mono text-azure mb-4">Technical Insights</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Architecture insights from the platform team
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Technical deep-dives on Azure, Cloudflare, AI engineering and platform
            architecture — written for engineers and technical leaders.
          </p>
        </div>
        <div className="divider-azure mt-16" aria-hidden />
      </div>

      {/* Content */}
      <div className="bg-rm-dark py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          {categories.map((cat) => (
            <CategorySection key={cat.label} {...cat} />
          ))}
        </div>
      </div>
    </>
  )
}
