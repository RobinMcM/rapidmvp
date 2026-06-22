import type { Metadata } from 'next'
import PlatformArchitecture from '../../components/platform-architecture/PlatformArchitecture'

export const metadata: Metadata = {
  title: 'Architecture Overview — RapidMVP',
  description:
    "How RapidMVP takes a delivered repository from upload to operational confidence: inspection, consistency, installation and build validation, cloud blueprint, and handover reports.",
}

export default function ArchitecturePage() {
  return (
    <div className="bg-rm-black min-h-screen">
      <PlatformArchitecture />
    </div>
  )
}
