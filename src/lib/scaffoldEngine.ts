import type { ProjectConfig, ScaffoldOutput } from '../types/scaffold'

const pagesByType: Record<string, string[]> = {
  saas: ['Landing', 'Dashboard', 'Settings', 'Billing'],
  content: ['Home', 'Browse', 'Article', 'Profile'],
  marketplace: ['Home', 'Listings', 'Item', 'Checkout', 'Dashboard'],
  tool: ['Home', 'Tool', 'Results'],
}

const aiByType: Record<string, string[]> = {
  saas: ['Generate', 'Summarise'],
  content: ['Summarise', 'Recommend'],
  marketplace: ['Describe', 'Recommend'],
  tool: ['Generate'],
}

export function deriveScaffoldOutput(config: ProjectConfig): ScaffoldOutput {
  return {
    scaffoldType: config.scaffold_type,
    pageSet: pagesByType[config.scaffold_type] ?? ['Home'],
    auth: {
      enabled: config.needs_auth !== 'none',
      recipe: 'emailpassword',
      optional: config.needs_auth === 'optional',
    },
    aiModes: aiByType[config.scaffold_type] ?? ['Generate'],
  }
}
