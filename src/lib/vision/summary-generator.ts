export type VisionFields = {
  businessGoal: string
  targetUsers: string
  currentPlatform: string
  expectedGrowth: string
  integrations: string
  securityRequirements: string
  complianceRequirements: string
  preferredCloud: string
  aiRequirements: string
  teamCapability: string
}

type ScoredBlueprint = { slug: string; score: number }

function score(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  return keywords.reduce((total, kw) => total + (lower.includes(kw) ? 1 : 0), 0)
}

export function generateVisionSummary(fields: VisionFields): { generatedSummary: string; recommendedBlueprint: string } {
  const allText = Object.values(fields).join(' ')

  const scores: ScoredBlueprint[] = [
    {
      slug: 'ai-saas-platform',
      score:
        score(fields.aiRequirements, ['openai', 'gpt', 'llm', 'ai', 'rag', 'vector', 'embedding', 'ml', 'machine learning']) +
        score(fields.businessGoal, ['saas', 'subscription', 'platform', 'ai', 'multi-tenant']) +
        score(fields.preferredCloud, ['azure']) +
        score(allText, ['multi-tenant', 'saas', 'azure openai', 'ai search']),
    },
    {
      slug: 'multi-tenant-saas-platform',
      score:
        score(fields.businessGoal, ['saas', 'subscription', 'billing', 'multi-tenant', 'b2b']) +
        score(fields.integrations, ['stripe', 'billing', 'payment', 'metering']) +
        score(allText, ['tenant isolation', 'schema', 'usage metering', 'subscription management']),
    },
    {
      slug: 'rag-knowledge-platform',
      score:
        score(fields.aiRequirements, ['rag', 'knowledge', 'retrieval', 'document', 'search', 'semantic', 'embedding']) +
        score(fields.businessGoal, ['knowledge', 'document', 'search', 'retrieval']) +
        score(allText, ['knowledge base', 'document search', 'rag', 'azure ai search']),
    },
    {
      slug: 'global-content-platform',
      score:
        score(fields.businessGoal, ['content', 'media', 'publishing', 'delivery', 'cdn', 'edge']) +
        score(fields.preferredCloud, ['cloudflare']) +
        score(allText, ['edge', 'cdn', 'cache', 'global', 'content delivery', 'cloudflare workers']),
    },
    {
      slug: 'enterprise-automation-platform',
      score:
        score(fields.businessGoal, ['automation', 'workflow', 'internal', 'enterprise', 'integration']) +
        score(fields.securityRequirements, ['zero trust', 'device trust', 'vpn', 'internal']) +
        score(allText, ['zero trust', 'automation', 'workflow', 'service bus', 'saga']),
    },
  ]

  const best = scores.reduce((top, s) => (s.score > top.score ? s : top), scores[0])
  const recommended = best.score > 0 ? best.slug : 'ai-saas-platform'

  const blueprintLabels: Record<string, string> = {
    'ai-saas-platform': 'AI SaaS Platform',
    'multi-tenant-saas-platform': 'Multi-Tenant SaaS Platform',
    'rag-knowledge-platform': 'RAG Knowledge Platform',
    'global-content-platform': 'Global Content Platform',
    'enterprise-automation-platform': 'Enterprise Automation Platform',
  }

  const cloudNote = fields.preferredCloud
    ? `Preferred cloud: ${fields.preferredCloud}.`
    : 'Cloud platform to be confirmed.'

  const complianceNote = fields.complianceRequirements
    ? `Compliance requirements: ${fields.complianceRequirements}.`
    : ''

  const growthNote = fields.expectedGrowth
    ? `Expected growth profile: ${fields.expectedGrowth}.`
    : ''

  const generatedSummary = [
    `Business goal: ${fields.businessGoal || 'Not specified'}.`,
    `Target users: ${fields.targetUsers || 'Not specified'}.`,
    cloudNote,
    growthNote,
    complianceNote,
    fields.aiRequirements ? `AI requirements: ${fields.aiRequirements}.` : '',
    fields.integrations ? `Key integrations: ${fields.integrations}.` : '',
    `Recommended starting blueprint: ${blueprintLabels[recommended] ?? recommended}.`,
  ]
    .filter(Boolean)
    .join(' ')

  return { generatedSummary, recommendedBlueprint: recommended }
}
