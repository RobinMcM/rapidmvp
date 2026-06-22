import type { DetectedService, ServiceCategory } from './service-detector'

/**
 * Deterministic Architecture Overview model.
 *
 * Built ONLY from inspection facts (detected stack + detected services + Azure
 * blueprint). It never invents components: anything we cannot evidence is either
 * omitted or rendered with `requires_clarification` confidence so stakeholders
 * see the gap rather than an assumption presented as fact.
 *
 * The shape is intentionally provider-agnostic so AWS/GCP deployment targets and
 * a future Blueprint-vs-Reality diff can reuse it.
 */

export type ArchConfidence = 'detected' | 'likely' | 'requires_clarification'

export type ArchNodeKind =
  | 'user'
  | 'application'
  | 'database'
  | 'authentication'
  | 'storage'
  | 'email'
  | 'queue'
  | 'external_service'
  | 'deployment_target'

export type ArchNode = {
  id: string
  kind: ArchNodeKind
  title: string
  description: string
  purpose: string
  detectedFrom: string[]
  confidence: ArchConfidence
  deploymentRecommendation: string | null
}

export type ArchEdge = {
  from: string
  to: string
  label?: string
  confidence: ArchConfidence
}

export type ArchitectureModel = {
  nodes: ArchNode[]
  edges: ArchEdge[]
  groups: {
    application: string[]
    data: string[]
    external: string[]
    deployment: string[]
  }
  generatedFrom: { stack: boolean; envVars: boolean; azure: boolean }
  hasUnknowns: boolean
}

export type AzureServiceLike = { name: string; tier: string; reason: string; required: boolean }

export type ArchitectureFacts = {
  appType: string | null
  /** detectedStack — framework name when known, else language. */
  detectedStack: string | null
  runtime: string | null
  hasDatabase: boolean
  hasPrisma: boolean
  detectedServices: DetectedService[]
  envVarCount: number
  azureServices: AzureServiceLike[]
}

// ── Copy / labelling ────────────────────────────────────────────────────────────

const FRAMEWORK_LABEL: Record<string, string> = {
  nextjs: 'Next.js Application',
  vite: 'Vite Application',
  react: 'React Application',
  vue: 'Vue Application',
  svelte: 'Svelte Application',
  express: 'Express API',
  fastify: 'Fastify API',
  nestjs: 'NestJS API',
  hono: 'Hono API',
  koa: 'Koa API',
  flask: 'Flask API',
  fastapi: 'FastAPI Service',
  django: 'Django Application',
  starlette: 'Starlette Service',
  gin: 'Gin API',
  echo: 'Echo API',
  fiber: 'Fiber API',
  'spring-boot': 'Spring Boot Application',
  nodejs: 'Node.js Application',
  python: 'Python Application',
  go: 'Go Application',
  java: 'Java Application',
  ruby: 'Ruby Application',
}

const PURPOSE: Record<ArchNodeKind, string> = {
  user: 'People who use the application.',
  application: 'The delivered application that serves users and coordinates its services.',
  database: 'Stores and retrieves application data.',
  authentication: 'Verifies user identity and manages sessions.',
  storage: 'Stores files, uploads, and media.',
  email: 'Sends transactional or notification email.',
  queue: 'Processes background jobs and asynchronous messaging.',
  external_service: 'A third-party service the application integrates with.',
  deployment_target: 'A cloud resource the application is expected to run on.',
}

const CLARIFY_TITLE: Partial<Record<ArchNodeKind, string>> = {
  database: 'Database — requires clarification',
  authentication: 'Authentication — requires clarification',
  storage: 'Storage — requires clarification',
}

const CLARIFY_DESC: Partial<Record<ArchNodeKind, string>> = {
  database: 'No database technology was detected from the repository. Confirm whether the application requires a database and which engine it uses.',
  authentication: 'No authentication provider was detected from the repository. Confirm how users sign in, if at all.',
  storage: 'No file/object storage was detected from the repository. Confirm whether the application stores files and where.',
}

function appTitle(detectedStack: string | null): { title: string; known: boolean } {
  if (!detectedStack || detectedStack === 'unknown') {
    return { title: 'Application — requires clarification', known: false }
  }
  return { title: FRAMEWORK_LABEL[detectedStack] ?? `${detectedStack} Application`, known: true }
}

function serviceTitle(s: DetectedService): string {
  return s.provider
}

function serviceDescription(s: DetectedService): string {
  const base = PURPOSE[categoryToKind(s.category)]
  return `${s.provider} — ${base}`
}

function categoryToKind(c: ServiceCategory): ArchNodeKind {
  return c // ServiceCategory is a subset of ArchNodeKind
}

/** Match an Azure service to the component it supports, for deployment notes. */
function azureNoteFor(kind: ArchNodeKind, azure: AzureServiceLike[]): string | null {
  const find = (re: RegExp) => azure.find((s) => re.test(s.name))
  let svc: AzureServiceLike | undefined
  if (kind === 'application') svc = find(/App Service/i)
  else if (kind === 'database') svc = find(/PostgreSQL|Database/i)
  else if (kind === 'storage') svc = find(/Storage Account/i)
  if (!svc) return null
  return `Recommended ${svc.name} (${svc.tier}).`
}

// ── Builder ──────────────────────────────────────────────────────────────────────

export function buildArchitectureModel(facts: ArchitectureFacts): ArchitectureModel {
  const nodes: ArchNode[] = []
  const edges: ArchEdge[] = []

  const add = (n: ArchNode) => nodes.push(n)
  const edge = (from: string, to: string, label: string, confidence: ArchConfidence) =>
    edges.push({ from, to, label, confidence })

  // 1. Users (the actor — not invented, the standard entry point).
  add({
    id: 'user',
    kind: 'user',
    title: 'Users',
    description: 'People who interact with the application.',
    purpose: PURPOSE.user,
    detectedFrom: ['Standard application entry point'],
    confidence: 'detected',
    deploymentRecommendation: null,
  })

  // 2. Application (centre).
  const { title: appT, known: appKnown } = appTitle(facts.detectedStack)
  const appConfidence: ArchConfidence = appKnown ? 'detected' : 'requires_clarification'
  add({
    id: 'application',
    kind: 'application',
    title: appKnown && facts.appType === 'fullstack' ? `${appT} (frontend + backend)` : appT,
    description: appKnown
      ? `Detected ${facts.detectedStack} application${facts.runtime ? ` running on ${facts.runtime}` : ''}.`
      : 'The application framework or language could not be determined from the repository.',
    purpose: PURPOSE.application,
    detectedFrom: appKnown ? [`Detected stack: ${facts.detectedStack}`] : ['No framework or language detected'],
    confidence: appConfidence,
    deploymentRecommendation: azureNoteFor('application', facts.azureServices),
  })
  edge('user', 'application', 'uses', appConfidence === 'detected' ? 'detected' : 'requires_clarification')

  // 3. Detected services → nodes.
  const byCategory = new Map<ServiceCategory, DetectedService[]>()
  for (const s of facts.detectedServices) {
    const arr = byCategory.get(s.category) ?? []
    arr.push(s)
    byCategory.set(s.category, arr)
  }

  const EDGE_LABEL: Partial<Record<ArchNodeKind, string>> = {
    database: 'reads/writes',
    authentication: 'authenticates',
    storage: 'stores files',
    email: 'sends email',
    queue: 'enqueues jobs',
    external_service: 'calls',
  }

  let idx = 0
  for (const [category, list] of byCategory) {
    const kind = categoryToKind(category)
    for (const s of list) {
      const id = `${category}-${idx++}`
      add({
        id,
        kind,
        title: serviceTitle(s),
        description: serviceDescription(s),
        purpose: PURPOSE[kind],
        detectedFrom: s.detectedFrom,
        confidence: s.confidence,
        deploymentRecommendation: azureNoteFor(kind, facts.azureServices),
      })
      edge('application', id, EDGE_LABEL[kind] ?? 'uses', s.confidence)
    }
  }

  // 3b. Core categories (database, authentication, storage) with no evidence →
  //     explicit requires_clarification placeholder (handover-completeness style).
  const CORE: ArchNodeKind[] = ['database', 'authentication', 'storage']
  for (const kind of CORE) {
    if (byCategory.has(kind as ServiceCategory)) continue

    // Database flag from non-Node detection (e.g. Python requirements) still counts.
    if (kind === 'database' && (facts.hasDatabase || facts.hasPrisma)) {
      const id = 'database-flag'
      add({
        id,
        kind: 'database',
        title: 'Database',
        description: 'A database dependency was detected, but the specific engine could not be identified.',
        purpose: PURPOSE.database,
        detectedFrom: [facts.hasPrisma ? 'Prisma ORM detected' : 'Database dependency detected'],
        confidence: 'likely',
        deploymentRecommendation: azureNoteFor('database', facts.azureServices),
      })
      edge('application', id, 'reads/writes', 'likely')
      continue
    }

    const id = `${kind}-clarify`
    add({
      id,
      kind,
      title: CLARIFY_TITLE[kind] ?? `${kind} — requires clarification`,
      description: CLARIFY_DESC[kind] ?? 'Not enough information was found in the repository.',
      purpose: PURPOSE[kind],
      detectedFrom: [],
      confidence: 'requires_clarification',
      deploymentRecommendation: null,
    })
    edge('application', id, EDGE_LABEL[kind] ?? 'uses', 'requires_clarification')
  }

  // 4. Deployment targets from the Azure blueprint.
  facts.azureServices.forEach((svc, i) => {
    const id = `deploy-${i}`
    add({
      id,
      kind: 'deployment_target',
      title: svc.name,
      description: `${svc.reason}.`,
      purpose: PURPOSE.deployment_target,
      detectedFrom: ['Azure cloud blueprint'],
      confidence: 'detected',
      deploymentRecommendation: `${svc.tier}.`,
    })
    edge('application', id, 'deploys to', 'detected')
  })

  // Groups for the relationship/dependency layouts.
  const idsByKind = (kinds: ArchNodeKind[]) => nodes.filter((n) => kinds.includes(n.kind)).map((n) => n.id)
  const groups = {
    application: idsByKind(['user', 'application']),
    data: idsByKind(['database', 'storage', 'queue']),
    external: idsByKind(['authentication', 'email', 'external_service']),
    deployment: idsByKind(['deployment_target']),
  }

  return {
    nodes,
    edges,
    groups,
    generatedFrom: {
      stack: !!facts.detectedStack,
      envVars: facts.envVarCount > 0,
      azure: facts.azureServices.length > 0,
    },
    hasUnknowns: nodes.some((n) => n.confidence === 'requires_clarification'),
  }
}

// ── Shared presentation helpers (used by UI + tests) ─────────────────────────────

export const CONFIDENCE_LABEL: Record<ArchConfidence, string> = {
  detected: 'Detected',
  likely: 'Likely',
  requires_clarification: 'Requires Clarification',
}

/** One-line, stakeholder-friendly explanation of a node's confidence. */
export function confidenceExplanation(node: ArchNode): string {
  switch (node.confidence) {
    case 'detected':
      return node.detectedFrom.length
        ? `High confidence — detected directly from repository files: ${node.detectedFrom.join(', ')}.`
        : 'High confidence — detected directly from repository files.'
    case 'likely':
      return node.detectedFrom.length
        ? `Strong indicator found, but not confirmed: ${node.detectedFrom.join(', ')}.`
        : 'Strong indicator found, but not confirmed.'
    case 'requires_clarification':
      return 'The repository does not contain enough information to determine this. Confirmation is required.'
  }
}
