import type { Metadata } from 'next'
import ArchitectureLibrary from '../../components/ArchitectureLibrary'
import RegistrationSection from '../../components/RegistrationSection'

export const metadata: Metadata = {
  title: 'Architecture Library — RapidMVP',
  description:
    'Proven cloud architecture patterns for AI platforms, SaaS, enterprise automation and global content delivery using Azure and Cloudflare.',
}

export default function ArchitectureLibraryPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-rm-black pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-animated opacity-60" aria-hidden />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] glow-azure opacity-25 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="label-mono text-azure mb-4">Architecture Library</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Proven patterns for modern cloud platforms
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Reference architectures drawn from real engagements — each a validated, production-ready
            design pattern for Azure and Cloudflare platforms.
          </p>
        </div>
        <div className="divider-azure mt-16" aria-hidden />
      </div>

      <ArchitectureLibrary />
      <RegistrationSection />
    </>
  )
}
