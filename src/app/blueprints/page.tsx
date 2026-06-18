import type { Metadata } from 'next'
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

      <BlueprintShowcase />
      <ArchitectureLibrary />
      <RegistrationSection />
    </>
  )
}
