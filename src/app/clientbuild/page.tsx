import type { Metadata } from 'next'
import ScaffoldWizard from '../../components/scaffold/ScaffoldWizard'

export const metadata: Metadata = {
  title: 'Client Build Wizard | RapidMvᵖ.io',
  description: 'Configure your initial scaffold with best-practice defaults.',
}

export default function ClientBuildPage() {
  return <ScaffoldWizard />
}
