import type { ArchNodeKind } from './architecture-model'

/**
 * The shared Azure Service Component Model.
 *
 * This is the single source of truth for "what is this Azure service and how
 * does it fit into the platform?" — the deterministic catalogue behind the
 * interactive Azure Service Overview.
 *
 * It is consumed by BOTH:
 *   - Migration Planning   (click a recommended Azure target → full overview)
 *   - Architecture Overview (click an Azure-backed component → same overview)
 *
 * Keyed by the canonical Azure resource name produced by:
 *   - migration-mapper.ts  (MigrationMapping.azureResource)
 *   - azure-assessor.ts    (AzureService.name)
 *
 * Like the migration registry, it is fully rule-based — NO AI is ever used. To
 * add a service, add an entry to AZURE_SERVICE_CATALOG. `kind` is reused from
 * the architecture model so the overview shares the exact same icon + tint
 * (visual language) as the Architecture Overview.
 */

// ── Types ────────────────────────────────────────────────────────────────────

/** The static profile of an Azure service — the answer to "what is this?". */
export type AzureServiceProfile = {
  /** Canonical Azure resource name (matches azureResource / AzureService.name). */
  resource: string
  /** Short category label, e.g. "Database", "Identity". */
  category: string
  /** Reused from the architecture model → shared icon + tint. */
  kind: ArchNodeKind
  // 1. Service Purpose
  purpose: string
  // 2. Why It Was Recommended (generic rationale; consumers may contextualise)
  whyRecommended: string
  // 3. What It Replaces (generic; consumers may name the actual current tech)
  replaces: string
  // 4. Azure Architecture Placement
  architecturePlacement: string
  // 5. Configuration Overview
  configuration: string[]
  // 6. Ownership Benefits
  ownershipBenefit: string
  // 7. Migration Considerations
  migrationConsiderations: string
  // 8. Required Secrets (names only — never values)
  requiredSecrets: string[]
  // 9. Typical Cost Drivers
  costDrivers: string[]
  // 10. Related Azure Services
  relatedServices: string[]
}

/**
 * A fully-resolved overview for one service in one context. Identical shape to
 * the profile — fields 2, 3, 7, and 8 may be enriched with the actual detected
 * technology when a consumer supplies context.
 */
export type AzureServiceOverview = AzureServiceProfile

/** Per-consumer context that contextualises an otherwise-generic profile. */
export type AzureServiceContext = {
  /** Why this repo specifically gets the service (overrides the generic rationale). */
  whyRecommended?: string
  /** The actual current technology being replaced, e.g. "PostgreSQL". */
  replaces?: string
  /** Migration notes from the mapping registry (overrides the generic note). */
  migrationNotes?: string
  /** Detected secret variable names for this component (names only). */
  secrets?: string[]
}

// ── Catalogue ──────────────────────────────────────────────────────────────────

export const AZURE_SERVICE_CATALOG: Record<string, AzureServiceProfile> = {
  'Azure App Service': {
    resource: 'Azure App Service',
    category: 'Compute',
    kind: 'application',
    purpose: 'A fully managed platform for hosting web applications and APIs without provisioning or patching servers.',
    whyRecommended: 'The application needs a managed compute tier to run on. App Service is the default Azure host for web apps and APIs.',
    replaces: 'Self-managed servers or VMs and third-party PaaS hosts such as Heroku, Render, or Vercel.',
    architecturePlacement: 'The compute tier — the public entry point that runs the application and connects out to data, identity, storage, and messaging services.',
    configuration: [
      'Linux plan on the B2 / Standard S1 tier or higher',
      'Startup and build commands taken from the detected stack',
      'Application settings injected at runtime',
      'System-assigned managed identity for Key Vault access',
      'Deployment slots for zero-downtime releases',
    ],
    ownershipBenefit: 'You own the runtime, scaling rules, and deployment pipeline inside your own subscription.',
    migrationConsiderations: 'Confirm the production start and build commands. Move secrets to Key Vault and reference them via managed identity rather than plain app settings.',
    requiredSecrets: ['APPLICATIONINSIGHTS_CONNECTION_STRING'],
    costDrivers: ['App Service Plan tier and instance count', 'Always-on and autoscale settings', 'Outbound data transfer'],
    relatedServices: ['Application Insights', 'Azure Key Vault', 'Azure Container Registry'],
  },

  'Application Insights': {
    resource: 'Application Insights',
    category: 'Observability',
    kind: 'deployment_target',
    purpose: 'Application performance monitoring — collects logs, traces, metrics, and request telemetry.',
    whyRecommended: 'A managed application needs first-class observability. Application Insights is the native APM for App Service workloads.',
    replaces: 'Third-party APM and observability tools such as Datadog, New Relic, or Sentry, and ad-hoc logging.',
    architecturePlacement: 'The observability tier — instruments the application and surfaces health, performance, and failures.',
    configuration: [
      'Workspace-based resource on the Standard tier',
      'Connection string set on the App Service',
      'Auto-instrumentation for the detected runtime',
      'Sampling and data-retention rules',
    ],
    ownershipBenefit: 'All telemetry stays in your subscription’s Log Analytics workspace, under your retention policy.',
    migrationConsiderations: 'Add the connection string to App Service settings and verify telemetry flows before cutover.',
    requiredSecrets: ['APPLICATIONINSIGHTS_CONNECTION_STRING'],
    costDrivers: ['Volume of telemetry ingested (GB/month)', 'Data-retention period'],
    relatedServices: ['Azure App Service', 'Log Analytics'],
  },

  'Azure Database for PostgreSQL Flexible Server': {
    resource: 'Azure Database for PostgreSQL Flexible Server',
    category: 'Database',
    kind: 'database',
    purpose: 'A fully managed PostgreSQL database with automated backups, patching, and high availability.',
    whyRecommended: 'The application uses PostgreSQL. The Flexible Server keeps the same engine while Azure manages the infrastructure.',
    replaces: 'Self-hosted PostgreSQL, SQLite files, or third-party managed Postgres such as Supabase, Neon, or Amazon RDS.',
    architecturePlacement: 'The data tier — the system of record the application reads from and writes to over a private connection.',
    configuration: [
      'Burstable B1ms for dev, Standard D2s_v3 for production',
      'TLS-only connections (sslmode=require)',
      'Firewall rules or private networking (VNet integration)',
      'Automated backups with point-in-time restore',
    ],
    ownershipBenefit: 'You own the data, the backups, and the access policy — nothing leaves your subscription.',
    migrationConsiderations: 'Same engine — export and import the schema, then repoint the connection string. Run schema migrations (e.g. Prisma) before first start.',
    requiredSecrets: ['DATABASE_URL'],
    costDrivers: ['Compute tier (vCores)', 'Provisioned storage and IOPS', 'Backup retention', 'High-availability replica'],
    relatedServices: ['Azure Key Vault', 'Azure App Service'],
  },

  'Azure Database for MySQL Flexible Server': {
    resource: 'Azure Database for MySQL Flexible Server',
    category: 'Database',
    kind: 'database',
    purpose: 'A fully managed MySQL database with automated backups, patching, and high availability.',
    whyRecommended: 'The application uses MySQL or MariaDB. The Flexible Server keeps the same engine while Azure manages the infrastructure.',
    replaces: 'Self-hosted MySQL/MariaDB or third-party managed MySQL such as PlanetScale or Amazon RDS.',
    architecturePlacement: 'The data tier — the system of record the application reads from and writes to over a private connection.',
    configuration: [
      'Burstable B1ms for dev, Standard D2ds_v4 for production',
      'TLS-only connections',
      'Firewall rules or private networking (VNet integration)',
      'Automated backups with point-in-time restore',
    ],
    ownershipBenefit: 'You own the data, the backups, and the access policy — nothing leaves your subscription.',
    migrationConsiderations: 'Same engine — export and import the schema, then repoint the connection string.',
    requiredSecrets: ['DATABASE_URL'],
    costDrivers: ['Compute tier (vCores)', 'Provisioned storage and IOPS', 'Backup retention', 'High-availability replica'],
    relatedServices: ['Azure Key Vault', 'Azure App Service'],
  },

  'Azure SQL Database': {
    resource: 'Azure SQL Database',
    category: 'Database',
    kind: 'database',
    purpose: 'A fully managed SQL Server database with automated backups, patching, and built-in intelligence.',
    whyRecommended: 'The application uses SQL Server. Azure SQL Database is the managed, SQL-Server-compatible target.',
    replaces: 'Self-hosted SQL Server or SQL Server on a VM.',
    architecturePlacement: 'The data tier — the system of record the application reads from and writes to over a private connection.',
    configuration: [
      'vCore or DTU purchasing model (General Purpose for most apps)',
      'TLS-only connections',
      'Firewall rules or private endpoint',
      'Automated backups with point-in-time restore',
    ],
    ownershipBenefit: 'You own the data, the backups, and the access policy — nothing leaves your subscription.',
    migrationConsiderations: 'Migrate the schema and repoint the connection string. Use the Data Migration Assistant for compatibility checks.',
    requiredSecrets: ['DATABASE_URL'],
    costDrivers: ['Compute tier (vCores/DTUs)', 'Provisioned storage', 'Backup retention', 'Zone redundancy'],
    relatedServices: ['Azure Key Vault', 'Azure App Service'],
  },

  'Azure Cosmos DB (MongoDB API)': {
    resource: 'Azure Cosmos DB (MongoDB API)',
    category: 'Database',
    kind: 'database',
    purpose: 'A globally distributed, multi-model database that exposes a MongoDB-compatible API.',
    whyRecommended: 'The application uses MongoDB. Cosmos DB’s MongoDB API is the wire-compatible managed target.',
    replaces: 'Self-hosted MongoDB or MongoDB Atlas.',
    architecturePlacement: 'The data tier — a document store the application reads from and writes to using its existing MongoDB driver.',
    configuration: [
      'Provisioned throughput (RU/s) or serverless',
      'MongoDB wire protocol compatibility version',
      'Indexing policy recreated from the source',
      'Private endpoint or IP firewall',
    ],
    ownershipBenefit: 'You own the data, the throughput policy, and the geo-replication strategy in your subscription.',
    migrationConsiderations: 'API-compatible target — confirm the driver version and recreate indexes. Validate throughput (RU/s) under expected load.',
    requiredSecrets: ['MONGODB_URI'],
    costDrivers: ['Provisioned or consumed throughput (RU/s)', 'Stored data volume', 'Geo-replication regions'],
    relatedServices: ['Azure Key Vault', 'Azure App Service'],
  },

  'Azure Cache for Redis': {
    resource: 'Azure Cache for Redis',
    category: 'Cache',
    kind: 'database',
    purpose: 'A fully managed, in-memory Redis cache and data store.',
    whyRecommended: 'The application uses Redis for caching, sessions, or queues. Azure Cache for Redis is the managed equivalent.',
    replaces: 'Self-hosted Redis or third-party hosted Redis such as Upstash or Redis Cloud.',
    architecturePlacement: 'A caching / fast-state tier between the application and its slower backing stores.',
    configuration: [
      'Basic / Standard / Premium tier by availability needs',
      'TLS-only access',
      'Eviction and persistence policy',
      'Private endpoint on Premium',
    ],
    ownershipBenefit: 'You own the cache instance, its data, and its network exposure in your subscription.',
    migrationConsiderations: 'Choose a tier and update the connection string. Confirm whether persistence is required.',
    requiredSecrets: ['REDIS_URL'],
    costDrivers: ['Cache tier and memory size', 'Number of replicas', 'Clustering (Premium)'],
    relatedServices: ['Azure Key Vault', 'Azure Service Bus'],
  },

  'Microsoft Entra External ID': {
    resource: 'Microsoft Entra External ID',
    category: 'Identity',
    kind: 'authentication',
    purpose: 'A customer identity and access management (CIAM) service for sign-up, sign-in, and user management.',
    whyRecommended: 'Owning identity means owning the users. Entra External ID brings the user store and sign-in flows into your tenant.',
    replaces: 'Third-party auth providers such as Auth0, Clerk, SuperTokens, or self-managed NextAuth/Passport.',
    architecturePlacement: 'The identity tier — sits in front of the application, issuing tokens the application validates on every request.',
    configuration: [
      'External tenant with user flows (sign-up / sign-in)',
      'App registration and redirect URIs',
      'Identity providers (email, social, federated)',
      'Token lifetime and claims configuration',
    ],
    ownershipBenefit: 'You own the user directory, the sign-in experience, and the identity data in your tenant.',
    migrationConsiderations: 'Highest-effort migration — the user store and sign-in flows move to Entra. Plan a user-import or just-in-time migration. May remain on the current provider if migration is impractical.',
    requiredSecrets: ['ENTRA_CLIENT_ID', 'ENTRA_CLIENT_SECRET', 'ENTRA_TENANT_ID'],
    costDrivers: ['Monthly active users (MAU)', 'Premium add-ons (e.g. advanced security)'],
    relatedServices: ['Azure Key Vault', 'Azure App Service'],
  },

  'Azure Blob Storage': {
    resource: 'Azure Blob Storage',
    category: 'Storage',
    kind: 'storage',
    purpose: 'Massively scalable object storage for files, uploads, media, and backups.',
    whyRecommended: 'The application stores files or objects. Blob Storage is the Azure-native object store.',
    replaces: 'Amazon S3, Google Cloud Storage, DigitalOcean Spaces, or other object stores.',
    architecturePlacement: 'The object-storage tier — holds binary assets the application uploads and serves, often via signed URLs or a CDN.',
    configuration: [
      'Standard general-purpose v2 storage account',
      'Containers with access tiers (hot / cool / archive)',
      'Shared access signatures (SAS) for time-limited access',
      'CORS rules for browser uploads',
    ],
    ownershipBenefit: 'You own the stored objects, their lifecycle policy, and their access controls in your subscription.',
    migrationConsiderations: 'Swap the storage SDK and copy existing objects (e.g. with azcopy). Presigned-URL generation differs from S3 and needs updating.',
    requiredSecrets: ['AZURE_STORAGE_CONNECTION_STRING'],
    costDrivers: ['Stored data volume by access tier', 'Read/write/list operations', 'Egress data transfer'],
    relatedServices: ['Azure App Service', 'Azure CDN / Front Door'],
  },

  // The assessor recommends the broader "Azure Storage Account"; it backs the
  // same blob-storage capability, so it shares the storage profile.
  'Azure Storage Account': {
    resource: 'Azure Storage Account',
    category: 'Storage',
    kind: 'storage',
    purpose: 'The Azure resource that contains Blob, File, Queue, and Table storage for the application.',
    whyRecommended: 'File or blob storage environment variables were detected — a storage account provides the managed object store.',
    replaces: 'Amazon S3, Google Cloud Storage, DigitalOcean Spaces, or other object stores.',
    architecturePlacement: 'The object-storage tier — holds binary assets the application uploads and serves, often via signed URLs or a CDN.',
    configuration: [
      'Standard general-purpose v2 account (Standard LRS)',
      'Blob containers with access tiers (hot / cool / archive)',
      'Shared access signatures (SAS) for time-limited access',
      'CORS rules for browser uploads',
    ],
    ownershipBenefit: 'You own the stored objects, their lifecycle policy, and their access controls in your subscription.',
    migrationConsiderations: 'Swap the storage SDK and copy existing objects (e.g. with azcopy). Presigned-URL generation differs from S3 and needs updating.',
    requiredSecrets: ['AZURE_STORAGE_CONNECTION_STRING'],
    costDrivers: ['Stored data volume by access tier', 'Read/write/list operations', 'Egress data transfer'],
    relatedServices: ['Azure App Service', 'Azure CDN / Front Door'],
  },

  'Azure Communication Services': {
    resource: 'Azure Communication Services',
    category: 'Email',
    kind: 'email',
    purpose: 'A managed communications platform; its Email channel sends transactional and notification email.',
    whyRecommended: 'The application sends email. Communication Services brings the email channel into your subscription.',
    replaces: 'Third-party email providers such as SendGrid, Resend, Postmark, or Mailgun.',
    architecturePlacement: 'An outbound integration the application calls to deliver transactional email.',
    configuration: [
      'Communication Services resource with an Email subdomain',
      'Verified sender domain (Azure-managed or custom)',
      'Connection string or managed-identity access',
      'Email templates ported from the current provider',
    ],
    ownershipBenefit: 'You own the sending domain, the reputation, and the delivery logs in your subscription.',
    migrationConsiderations: 'Verify the sending domain (SPF/DKIM) and port email templates. Update the send API integration.',
    requiredSecrets: ['ACS_CONNECTION_STRING'],
    costDrivers: ['Number of emails sent', 'Data volume of attachments'],
    relatedServices: ['Azure App Service', 'Azure Key Vault'],
  },

  'Azure Event Hubs': {
    resource: 'Azure Event Hubs',
    category: 'Messaging',
    kind: 'queue',
    purpose: 'A high-throughput event-streaming platform for ingesting and processing event streams.',
    whyRecommended: 'The application uses Kafka-style event streaming. Event Hubs provides a managed, Kafka-compatible endpoint.',
    replaces: 'Self-hosted Apache Kafka or third-party streaming platforms such as Confluent.',
    architecturePlacement: 'The streaming backbone — decouples event producers from consumers between application components.',
    configuration: [
      'Namespace with one or more event hubs',
      'Partition count sized to throughput',
      'Kafka protocol endpoint (if migrating from Kafka)',
      'Consumer groups per downstream consumer',
    ],
    ownershipBenefit: 'You own the streaming infrastructure, retention, and throughput policy in your subscription.',
    migrationConsiderations: 'Streaming semantics differ — assess throughput and partitioning before cutover. The Kafka endpoint eases driver migration.',
    requiredSecrets: ['EVENTHUBS_CONNECTION_STRING'],
    costDrivers: ['Throughput units / processing units', 'Ingress events', 'Capture and retention'],
    relatedServices: ['Azure Service Bus', 'Azure App Service'],
  },

  'Azure Service Bus': {
    resource: 'Azure Service Bus',
    category: 'Messaging',
    kind: 'queue',
    purpose: 'A fully managed enterprise message broker with queues and publish/subscribe topics.',
    whyRecommended: 'The application uses a message queue or background-job system. Service Bus is the managed broker for reliable messaging.',
    replaces: 'Self-hosted RabbitMQ, BullMQ/Redis queues, Amazon SQS, or Google Pub/Sub.',
    architecturePlacement: 'The messaging tier — decouples background work and asynchronous processing from request handling.',
    configuration: [
      'Namespace on the Standard or Premium tier',
      'Queues for point-to-point, topics for pub/sub',
      'Message TTL, dead-letter, and lock duration',
      'Managed-identity access from the application',
    ],
    ownershipBenefit: 'You own the message broker, its delivery guarantees, and its dead-letter handling in your subscription.',
    migrationConsiderations: 'Messaging semantics differ — map existing exchanges/queues/topics onto Service Bus queues and topics.',
    requiredSecrets: ['SERVICEBUS_CONNECTION_STRING'],
    costDrivers: ['Tier (Standard operations vs Premium messaging units)', 'Number of operations', 'Message size'],
    relatedServices: ['Azure Event Hubs', 'Azure Cache for Redis'],
  },

  'Azure Key Vault': {
    resource: 'Azure Key Vault',
    category: 'Security',
    kind: 'authentication',
    purpose: 'A secure, managed store for secrets, keys, and certificates.',
    whyRecommended: 'Secret environment variables were detected. Key Vault keeps them out of plain app settings and out of source control.',
    replaces: 'Secrets stored in .env files, plain App Settings, or other secret managers.',
    architecturePlacement: 'The security tier — the application reads secrets at runtime via managed identity, so no secret is stored in config.',
    configuration: [
      'Standard tier vault',
      'Secrets stored by name (one per credential)',
      'App Service references via @Microsoft.KeyVault(...) syntax',
      'Access granted to the App Service managed identity',
    ],
    ownershipBenefit: 'You own every secret and its access policy and audit log, centralised in your subscription.',
    migrationConsiderations: 'Create one secret per credential and grant the App Service managed identity read access. Never commit values.',
    requiredSecrets: [],
    costDrivers: ['Number of secret operations', 'Premium HSM-backed keys (if used)'],
    relatedServices: ['Azure App Service', 'Microsoft Entra External ID'],
  },

  'Azure Container Registry': {
    resource: 'Azure Container Registry',
    category: 'Compute',
    kind: 'deployment_target',
    purpose: 'A private registry for building, storing, and managing container images.',
    whyRecommended: 'A Dockerfile was detected — the container image must be built and stored somewhere App Service can pull from.',
    replaces: 'Docker Hub or third-party container registries.',
    architecturePlacement: 'Part of the deployment pipeline — App Service pulls the application image from here on deploy.',
    configuration: [
      'Basic tier for a single app',
      'Image built and pushed in CI/CD',
      'Managed-identity pull access from App Service',
      'Optional geo-replication',
    ],
    ownershipBenefit: 'You own the image artefacts and their access control in your subscription.',
    migrationConsiderations: 'Build and push the image in CI/CD, then point App Service at the registry. Grant pull access via managed identity.',
    requiredSecrets: [],
    costDrivers: ['Storage tier', 'Stored image volume', 'Geo-replication regions'],
    relatedServices: ['Azure App Service'],
  },
}

// ── Lookup + resolution ──────────────────────────────────────────────────────

/** Whether the catalogue describes a given Azure resource. */
export function hasAzureServiceProfile(resource: string | null | undefined): boolean {
  return !!resource && resource in AZURE_SERVICE_CATALOG
}

/** The static profile for a canonical Azure resource name, or null. */
export function getAzureServiceProfile(resource: string | null | undefined): AzureServiceProfile | null {
  if (!resource) return null
  return AZURE_SERVICE_CATALOG[resource] ?? null
}

/**
 * Resolve the full overview for a service in a specific context. Fields that
 * benefit from the detected technology (why recommended, what it replaces,
 * migration considerations, required secrets) are enriched when the consumer
 * supplies context; otherwise the generic profile values are used.
 */
export function resolveAzureServiceOverview(
  resource: string | null | undefined,
  ctx: AzureServiceContext = {}
): AzureServiceOverview | null {
  const profile = getAzureServiceProfile(resource)
  if (!profile) return null

  const replaces = ctx.replaces?.trim()
    ? `Your ${ctx.replaces}. ${profile.replaces}`
    : profile.replaces

  const secrets =
    ctx.secrets && ctx.secrets.length > 0
      ? Array.from(new Set([...profile.requiredSecrets, ...ctx.secrets]))
      : profile.requiredSecrets

  return {
    ...profile,
    whyRecommended: ctx.whyRecommended?.trim() || profile.whyRecommended,
    replaces,
    migrationConsiderations: ctx.migrationNotes?.trim() || profile.migrationConsiderations,
    requiredSecrets: secrets,
  }
}

// ── Presentation (shared by UI) ──────────────────────────────────────────────

/** The 10 overview fields, in the exact order they must be presented. */
export const AZURE_OVERVIEW_FIELDS: { key: keyof AzureServiceOverview; label: string; kind: 'text' | 'list' }[] = [
  { key: 'purpose', label: 'Service Purpose', kind: 'text' },
  { key: 'whyRecommended', label: 'Why It Was Recommended', kind: 'text' },
  { key: 'replaces', label: 'What It Replaces', kind: 'text' },
  { key: 'architecturePlacement', label: 'Azure Architecture Placement', kind: 'text' },
  { key: 'configuration', label: 'Configuration Overview', kind: 'list' },
  { key: 'ownershipBenefit', label: 'Ownership Benefits', kind: 'text' },
  { key: 'migrationConsiderations', label: 'Migration Considerations', kind: 'text' },
  { key: 'requiredSecrets', label: 'Required Secrets', kind: 'list' },
  { key: 'costDrivers', label: 'Typical Cost Drivers', kind: 'list' },
  { key: 'relatedServices', label: 'Related Azure Services', kind: 'list' },
]
