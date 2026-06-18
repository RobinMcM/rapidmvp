import type { Metadata } from 'next'
import Link from 'next/link'
import BlueprintShowcase   from '../../components/BlueprintShowcase'
import ArchitectureLibrary from '../../components/ArchitectureLibrary'
import RegistrationSection from '../../components/RegistrationSection'

export const metadata: Metadata = {
  title: 'Blueprints — RapidMVP',
  description:
    'Explore RapidMVP architecture blueprints — complete, implementation-ready cloud platform designs using Azure and Cloudflare.',
}

export default function BlueprintsPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-rm-black pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-animated opacity-60" aria-hidden />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-azure opacity-25 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="label-mono text-azure mb-4">Architecture Blueprints</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Platform blueprints for modern cloud engineering
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Select a blueprint to explore the full architecture — services, security model, cost drivers, and delivery workflow.
          </p>
        </div>
        <div className="divider-azure mt-16" aria-hidden />
      </div>

      {/* What you receive in a blueprint */}
      <section className="bg-rm-dark py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Every blueprint contains
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Executive Summary',      href: '/blueprints/ai-saas-platform' },
              { label: 'Azure Architecture',     href: '/blueprints/ai-saas-platform' },
              { label: 'Cloudflare Design',      href: '/blueprints/global-content-platform' },
              { label: 'Security Model',         href: '/blueprints/enterprise-automation-platform' },
              { label: 'DevOps Strategy',        href: '/blueprints/multi-tenant-saas-platform' },
              { label: 'IaC Guidance',           href: '/blueprints/multi-tenant-saas-platform' },
              { label: 'AI Opportunities',       href: '/blueprints/rag-knowledge-platform' },
              { label: 'Scaling Plan',           href: '/blueprints/multi-tenant-saas-platform' },
              { label: 'Cost Analysis',          href: '/blueprints/global-content-platform' },
              { label: 'Risk Assessment',        href: '/blueprints/enterprise-automation-platform' },
              { label: 'Implementation Roadmap', href: '/blueprints/ai-saas-platform' },
              { label: 'Future Roadmap',         href: '/blueprints/ai-saas-platform' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="rounded-lg border border-slate-800 bg-rm-dark-2/60 px-3 py-3 text-center cursor-pointer hover:border-azure/40 hover:bg-rm-dark-2 transition-colors"
              >
                <span className="text-slate-400 text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BlueprintShowcase />
      <ArchitectureLibrary />
      <RegistrationSection />
    </>
  )
}
