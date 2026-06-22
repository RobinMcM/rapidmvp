import type { DetectedService, ServiceCategory } from './service-detector'
import type { StackResult } from './stack-detector'
import type { AzureService } from './azure-assessor'

/**
 * Deterministic Azure Migration Mapping engine.
 *
 * This is the single source of "detected technology → recommended Azure service"
 * recommendations. It is fully rule-based — NO AI is ever used to decide a
 * mapping. Every recommendation traces back to a registry rule and the evidence
 * the detector recorded.
 *
 * Consumed by:
 *   - architecture-model.ts  (per-node Azure recommendation)
 *   - the Migration Plan UI   (Current → Azure → Complexity → Notes)
 *   - the Azure Blueprint UI   (ownership model)
 *   - operational-confidence.ts (cloud-readiness signals)
 *
 * To extend: add a rule to MIGRATION_REGISTRY. Order matters — the first rule
 * whose `category` and `match` apply to a detected service wins.
 */

// ── Public types ───────────────────────────────────────────────────────────────

export type MigrationComplexity = 'none' | 'low' | 'medium' | 'high'
export type MigrationDecision = 'remain' | 'migrate' | 'requires_clarification'
export type MigrationConfidence = 'detected' | 'likely' | 'requires_clarification'

/** A mappable category — the detected service categories plus application hosting. */
export type MigrationCategory = ServiceCategory | 'hosting'

export type MigrationMapping = {
  category: MigrationCategory
  currentState: string          // detected provider, e.g. "PostgreSQL"
  azureState: string            // recommendation, e.g. "Azure Database for PostgreSQL Flexible Server"
  azureResource: string | null  // canonical Azure service name for downstream consumers (null when remaining)
  complexity: MigrationComplexity
  decision: MigrationDecision
  notes: string
  detectedFrom: string[]
  confidence: MigrationConfidence
}

export type MigrationPlan = {
  mappings: MigrationMapping[]
  groups: {
    remain: MigrationMapping[]
    migrate: MigrationMapping[]
    clarify: MigrationMapping[]
  }
  counts: { remain: number; migrate: number; clarify: number }
}

export type Assumption = { text: string; basis: string }
export type Clarification = { question: string; why: string }

export type OwnershipItem = { area: string; youOwn: string; backedBy: string; present: boolean }
export type OwnershipModel = {
  owned: OwnershipItem[]
  external: { provider: string; reason: string }[]
}

// ── Registry ───────────────────────────────────────────────────────────────────

type RegistryRule = {
  category: MigrationCategory
  /** Tested against the detected provider string. */
  match: RegExp
  azureState: string
  azureResource: string | null
  complexity: MigrationComplexity
  decision: MigrationDecision
  notes: string
}

/**
 * The mapping registry. Extensible and ordered — first applicable rule wins.
 * Recommendations are Azure-native by default; services that should stay
 * external (payments, AI providers, already-Azure) are explicitly `remain`.
 */
export const MIGRATION_REGISTRY: RegistryRule[] = [
  // ── Database ──────────────────────────────────────────────────────────────
  {
    category: 'database', match: /^postgres|^postgresql|cockroach/i,
    azureState: 'Azure Database for PostgreSQL Flexible Server',
    azureResource: 'Azure Database for PostgreSQL Flexible Server',
    complexity: 'low', decision: 'migrate',
    notes: 'Same engine. Move the connection string to Key Vault and configure firewall / private networking.',
  },
  {
    category: 'database', match: /^mysql|mariadb/i,
    azureState: 'Azure Database for MySQL Flexible Server',
    azureResource: 'Azure Database for MySQL Flexible Server',
    complexity: 'low', decision: 'migrate',
    notes: 'Same engine. Export and import the schema, then repoint the connection string.',
  },
  {
    category: 'database', match: /^sqlite/i,
    azureState: 'Azure Database for PostgreSQL Flexible Server',
    azureResource: 'Azure Database for PostgreSQL Flexible Server',
    complexity: 'medium', decision: 'migrate',
    notes: 'File-based database becomes a managed service. Port the schema and load existing data.',
  },
  {
    category: 'database', match: /^mongo/i,
    azureState: 'Azure Cosmos DB (MongoDB API)',
    azureResource: 'Azure Cosmos DB (MongoDB API)',
    complexity: 'medium', decision: 'migrate',
    notes: 'API-compatible target. Confirm the driver version and recreate indexes.',
  },
  {
    category: 'database', match: /^redis/i,
    azureState: 'Azure Cache for Redis',
    azureResource: 'Azure Cache for Redis',
    complexity: 'low', decision: 'migrate',
    notes: 'Managed Redis. Choose a tier and update the connection string.',
  },
  {
    category: 'database', match: /^sql server/i,
    azureState: 'Azure SQL Database',
    azureResource: 'Azure SQL Database',
    complexity: 'low', decision: 'migrate',
    notes: 'Managed SQL Server. Migrate the schema and repoint the connection string.',
  },
  {
    // Generic / engine-unknown database signal — needs confirmation.
    category: 'database', match: /^(sql database|database)$/i,
    azureState: 'Azure Database for PostgreSQL Flexible Server',
    azureResource: 'Azure Database for PostgreSQL Flexible Server',
    complexity: 'medium', decision: 'requires_clarification',
    notes: 'A database is used but the specific engine was not confirmed. Confirm the engine to finalise the target.',
  },

  // ── Authentication ──────────────────────────────────────────────────────────
  {
    category: 'authentication', match: /.*/,
    azureState: 'Microsoft Entra External ID',
    azureResource: 'Microsoft Entra External ID',
    complexity: 'high', decision: 'migrate',
    notes: 'Owning identity means owning the users. The user store and sign-in flows move to Entra External ID. May remain on the current provider if migration is impractical.',
  },

  // ── Storage ─────────────────────────────────────────────────────────────────
  {
    category: 'storage', match: /azure blob/i,
    azureState: 'Azure Blob Storage',
    azureResource: 'Azure Blob Storage',
    complexity: 'none', decision: 'remain',
    notes: 'Already Azure-native. No migration required.',
  },
  {
    category: 'storage', match: /s3|spaces|google cloud storage|object storage/i,
    azureState: 'Azure Blob Storage',
    azureResource: 'Azure Blob Storage',
    complexity: 'medium', decision: 'migrate',
    notes: 'Swap the storage SDK and copy existing objects. Presigned-URL generation differs and needs updating.',
  },

  // ── Email ─────────────────────────────────────────────────────────────────────
  {
    category: 'email', match: /.*/,
    azureState: 'Azure Communication Services Email',
    azureResource: 'Azure Communication Services',
    complexity: 'medium', decision: 'migrate',
    notes: 'Owning the email channel. Verify the sending domain and port email templates.',
  },

  // ── Queue / messaging ────────────────────────────────────────────────────────
  {
    category: 'queue', match: /kafka|event/i,
    azureState: 'Azure Event Hubs',
    azureResource: 'Azure Event Hubs',
    complexity: 'high', decision: 'migrate',
    notes: 'Streaming semantics differ. Assess throughput and partitioning before cutover.',
  },
  {
    category: 'queue', match: /rabbitmq/i,
    azureState: 'Azure Service Bus',
    azureResource: 'Azure Service Bus',
    complexity: 'high', decision: 'migrate',
    notes: 'Messaging semantics differ. Map exchanges/queues onto Service Bus topics and queues.',
  },
  {
    category: 'queue', match: /bullmq|redis|bull/i,
    azureState: 'Azure Service Bus (or Azure Cache for Redis)',
    azureResource: 'Azure Service Bus',
    complexity: 'medium', decision: 'migrate',
    notes: 'Map jobs onto Service Bus queues, or keep the Redis-backed queue on Azure Cache for Redis.',
  },
  {
    category: 'queue', match: /sqs|pub\/sub|pubsub/i,
    azureState: 'Azure Service Bus',
    azureResource: 'Azure Service Bus',
    complexity: 'medium', decision: 'migrate',
    notes: 'Map topics/subscriptions onto Service Bus.',
  },

  // ── External services (payments, AI, analytics, third-party APIs) ─────────────
  {
    category: 'external_service', match: /stripe/i,
    azureState: 'Remain on Stripe',
    azureResource: null,
    complexity: 'none', decision: 'remain',
    notes: 'Payments stay with Stripe by design. No Azure-native replacement is recommended.',
  },
  {
    category: 'external_service', match: /openai|anthropic|claude|gpt|cohere|mistral|gemini/i,
    azureState: 'Remain (Azure OpenAI available if tenant policy requires)',
    azureResource: null,
    complexity: 'low', decision: 'remain',
    notes: 'Keep the current AI provider. Azure OpenAI is an option only if a tenant policy requires it.',
  },
]

// Canonical Azure recommendations for the ownership model and per-node hints.
const ENTRA = 'Microsoft Entra External ID'

// ── Mapping ──────────────────────────────────────────────────────────────────

function ruleFor(service: DetectedService): RegistryRule | null {
  for (const rule of MIGRATION_REGISTRY) {
    if (rule.category === service.category && rule.match.test(service.provider)) return rule
  }
  return null
}

/** Map a single detected service to its Azure migration recommendation. */
export function mapService(service: DetectedService): MigrationMapping {
  const rule = ruleFor(service)

  if (!rule) {
    // Unmapped third-party integration — keep it, but flag for confirmation.
    if (service.category === 'external_service') {
      return {
        category: service.category,
        currentState: service.provider,
        azureState: `Remain on ${service.provider}`,
        azureResource: null,
        complexity: 'none',
        decision: 'remain',
        notes: 'Third-party integration with no Azure-native equivalent required. Keep as an external dependency.',
        detectedFrom: service.detectedFrom,
        confidence: service.confidence,
      }
    }
    return {
      category: service.category,
      currentState: service.provider,
      azureState: 'Requires clarification',
      azureResource: null,
      complexity: 'medium',
      decision: 'requires_clarification',
      notes: 'No mapping rule matched this component. Confirm the technology to recommend an Azure target.',
      detectedFrom: service.detectedFrom,
      confidence: 'requires_clarification',
    }
  }

  const confidence: MigrationConfidence =
    rule.decision === 'requires_clarification' ? 'requires_clarification' : service.confidence

  return {
    category: rule.category,
    currentState: service.provider,
    azureState: rule.azureState,
    azureResource: rule.azureResource,
    complexity: rule.complexity,
    decision: rule.decision,
    notes: rule.notes,
    detectedFrom: service.detectedFrom,
    confidence,
  }
}

/** Application hosting mapping, derived from the detected stack. */
function hostingMapping(stack: StackResult): MigrationMapping {
  const known = stack.language !== 'unknown'
  const current = stack.framework !== 'unknown'
    ? stack.framework
    : known
      ? stack.language
      : 'Application'
  return {
    category: 'hosting',
    currentState: `${current} application`,
    azureState: 'Azure App Service',
    azureResource: 'Azure App Service',
    complexity: known ? 'low' : 'medium',
    decision: known ? 'migrate' : 'requires_clarification',
    notes: known
      ? 'Host the application on Azure App Service using the detected build and start commands.'
      : 'The application runtime was not confirmed. Confirm the language/framework to finalise the hosting target.',
    detectedFrom: [known ? `Detected stack: ${current}` : 'No runtime detected'],
    confidence: known ? 'detected' : 'requires_clarification',
  }
}

/** Build the full migration plan from detected services + stack. */
export function buildMigrationPlan(services: DetectedService[], stack: StackResult): MigrationPlan {
  const mappings: MigrationMapping[] = [hostingMapping(stack), ...services.map(mapService)]

  const groups = {
    remain: mappings.filter((m) => m.decision === 'remain'),
    migrate: mappings.filter((m) => m.decision === 'migrate'),
    clarify: mappings.filter((m) => m.decision === 'requires_clarification'),
  }

  return {
    mappings,
    groups,
    counts: { remain: groups.remain.length, migrate: groups.migrate.length, clarify: groups.clarify.length },
  }
}

// ── Derived artefacts ──────────────────────────────────────────────────────────

/** Assumptions made while mapping — anything inferred from indirect evidence. */
export function buildAssumptions(plan: MigrationPlan): Assumption[] {
  const out: Assumption[] = []
  for (const m of plan.mappings) {
    if (m.decision === 'migrate' && m.confidence === 'likely') {
      out.push({
        text: `${m.currentState} is mapped to ${m.azureState}.`,
        basis: `Indirect evidence: ${m.detectedFrom.join(', ') || 'naming conventions'}.`,
      })
    }
  }
  return out
}

/** Open questions — anything that needs confirmation before a clean cutover. */
export function buildClarifications(plan: MigrationPlan): Clarification[] {
  return plan.groups.clarify.map((m) => ({
    question: `Confirm the technology behind "${m.currentState}".`,
    why: m.notes,
  }))
}

/**
 * The Ownership Model — a core product concept. Each owned area is backed by a
 * concrete Azure service, so "you own it" is demonstrable. Services that remain
 * external (Stripe, AI providers) are listed separately, by design.
 */
export function buildOwnershipModel(plan: MigrationPlan, azureServices: AzureService[]): OwnershipModel {
  const hasCategory = (c: MigrationCategory) => plan.mappings.some((m) => m.category === c)
  const azureHas = (re: RegExp) => azureServices.some((s) => re.test(s.name))

  const owned: OwnershipItem[] = [
    {
      area: 'Tenant',
      youOwn: 'The Azure tenant',
      backedBy: 'Azure subscription + resource group',
      present: true,
    },
    {
      area: 'Users',
      youOwn: 'The users',
      backedBy: ENTRA,
      present: hasCategory('authentication'),
    },
    {
      area: 'Data',
      youOwn: 'The data',
      backedBy: 'Azure Database for PostgreSQL Flexible Server + Azure Blob Storage',
      present: hasCategory('database') || hasCategory('storage'),
    },
    {
      area: 'Monitoring',
      youOwn: 'The monitoring',
      backedBy: 'Application Insights + Log Analytics',
      present: azureHas(/Application Insights/i),
    },
    {
      area: 'Security',
      youOwn: 'The security',
      backedBy: 'Azure Key Vault + Front Door + WAF + Defender for Cloud',
      present: azureHas(/Key Vault/i),
    },
    {
      area: 'Costs',
      youOwn: 'The costs',
      backedBy: 'Azure Cost Management + Budgets',
      present: true,
    },
  ]

  const external = plan.groups.remain
    .filter((m) => m.azureResource === null) // genuinely external (not "already Azure")
    .map((m) => ({ provider: m.currentState, reason: m.notes }))

  return { owned, external }
}

// ── Presentation helpers (shared by UI) ──────────────────────────────────────

export const COMPLEXITY_LABEL: Record<MigrationComplexity, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const DECISION_LABEL: Record<MigrationDecision, string> = {
  remain: 'Can Remain',
  migrate: 'Should Migrate',
  requires_clarification: 'Requires Clarification',
}

export const CATEGORY_LABEL: Record<MigrationCategory, string> = {
  hosting: 'Application Hosting',
  database: 'Database',
  authentication: 'Authentication',
  storage: 'Storage',
  email: 'Email',
  queue: 'Messaging / Queue',
  external_service: 'External Service',
}
