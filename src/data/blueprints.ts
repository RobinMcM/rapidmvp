export type WorkflowPhase = {
  phase: number
  title: string
  objective: string
  deliverables: string[]
  validationGates: string[]
}

export type Blueprint = {
  slug: string
  category: string
  title: string
  description: string
  summary: string
  azure: string[]
  cloudflare: string[]
  ai: string[]
  dataLayer: string[]
  devOps: string[]
  keyDecisions: string[]
  security: string
  compliance: string[]
  deployment: string
  scalingModel: string
  costDrivers: string[]
  riskAreas: string[]
  accentColor: 'azure' | 'cf-orange'
  workflowPreview: WorkflowPhase[]
}

export const BLUEPRINTS: Blueprint[] = [
  {
    slug: 'ai-saas-platform',
    category: 'AI Platform',
    title: 'AI SaaS Platform',
    description:
      'Multi-tenant SaaS with embedded AI capabilities, enterprise authentication and global edge delivery.',
    summary:
      'A production-grade AI SaaS architecture combining Azure Container Apps, Azure OpenAI, and Cloudflare edge. Designed for multi-tenant isolation, RAG pipelines, and enterprise compliance.',
    azure: ['Azure Container Apps', 'Azure OpenAI', 'PostgreSQL Flexible Server', 'Azure AI Search', 'Azure Key Vault', 'Azure Monitor'],
    cloudflare: ['Cloudflare Workers', 'Cloudflare CDN', 'Cloudflare Zero Trust'],
    ai: ['Azure OpenAI (GPT-4)', 'Azure AI Search (vector)', 'Prompt caching layer'],
    dataLayer: ['PostgreSQL Flexible Server', 'Redis Cache', 'Azure Blob Storage'],
    devOps: ['GitHub Actions', 'Azure Container Registry', 'Bicep IaC'],
    keyDecisions: [
      'Event-driven AI pipeline via Service Bus',
      'Vector search with Azure AI Search hybrid mode',
      'Token-based tenant isolation (JWT claims)',
      'Prompt caching to reduce OpenAI spend',
    ],
    security: 'GDPR-compliant, private endpoints, RBAC, Managed Identity, no stored credentials',
    compliance: ['GDPR', 'ISO 27001 aligned', 'SOC 2 Type II ready'],
    deployment: 'Blue-green with feature flags via Cloudflare Workers',
    scalingModel: 'Horizontal pod autoscaling on Container Apps; AI Search replicas on demand',
    costDrivers: ['Azure OpenAI token consumption', 'AI Search index size', 'Container Apps replica count'],
    riskAreas: ['OpenAI rate limits under load', 'Tenant data bleed in shared vector index', 'Token cost overrun without capping'],
    accentColor: 'azure',
    workflowPreview: [
      {
        phase: 1,
        title: 'Foundation & Identity',
        objective: 'Establish tenant isolation and auth layer',
        deliverables: ['Azure AD B2C or Entra tenant config', 'JWT claim structure', 'Private endpoint topology'],
        validationGates: ['Token issued per tenant', 'No cross-tenant data access in DB'],
      },
      {
        phase: 2,
        title: 'AI Pipeline',
        objective: 'Build document ingestion and RAG pipeline',
        deliverables: ['Chunking strategy', 'Embedding pipeline', 'AI Search index schema'],
        validationGates: ['Vector search returns relevant results', 'Latency < 2s P95'],
      },
      {
        phase: 3,
        title: 'Edge & Delivery',
        objective: 'Deploy Cloudflare Workers for edge auth and routing',
        deliverables: ['Worker routes config', 'CDN caching rules', 'Zero Trust policies'],
        validationGates: ['Global P95 < 200ms TTFB', 'Zero Trust policy blocks unauthenticated requests'],
      },
    ],
  },
  {
    slug: 'multi-tenant-saas-platform',
    category: 'SaaS',
    title: 'Multi-Tenant SaaS Platform',
    description:
      'Scalable multi-tenant architecture with data isolation, usage metering, subscription management and global availability.',
    summary:
      'Schema-per-tenant PostgreSQL isolation, async billing via Service Bus, and Cloudflare Workers for global routing. Built for subscription SaaS with usage metering and feature flags per tier.',
    azure: ['Azure Container Apps', 'Azure SQL', 'Azure Service Bus', 'Azure Monitor', 'Azure Key Vault'],
    cloudflare: ['Cloudflare Workers', 'Cloudflare CDN', 'Cloudflare Pages'],
    ai: [],
    dataLayer: ['Azure SQL (schema-per-tenant)', 'Azure Cache for Redis', 'Azure Blob Storage'],
    devOps: ['GitHub Actions', 'Azure Container Registry', 'Terraform IaC'],
    keyDecisions: [
      'Schema-per-tenant isolation in Azure SQL',
      'Async billing events via Service Bus + Stripe webhooks',
      'Feature flag per subscription tier',
      'Zero-downtime rolling deploys',
    ],
    security: 'Tenant-scoped auth, audit logging, PCI scope isolation, Managed Identity',
    compliance: ['PCI DSS scope isolation', 'GDPR', 'SOC 2 Type II ready'],
    deployment: 'Zero-downtime rolling deploys via Container Apps revision management',
    scalingModel: 'Container Apps horizontal scaling; SQL Elastic Pool per tier',
    costDrivers: ['Azure SQL DTUs per tenant', 'Service Bus message volume', 'Container Apps compute'],
    riskAreas: ['Schema migration across N tenants', 'Billing event loss if Service Bus DLQ not monitored', 'Tenant offboarding data deletion'],
    accentColor: 'azure',
    workflowPreview: [
      {
        phase: 1,
        title: 'Tenant Provisioning',
        objective: 'Automate tenant creation with schema isolation',
        deliverables: ['Provisioning API', 'Schema migration pipeline', 'Tenant metadata store'],
        validationGates: ['New tenant schema created in < 5s', 'No cross-schema queries possible'],
      },
      {
        phase: 2,
        title: 'Billing Integration',
        objective: 'Async billing event pipeline with Stripe',
        deliverables: ['Service Bus topic config', 'Stripe webhook handler', 'Usage metering model'],
        validationGates: ['Billing events survive transient failures', 'Stripe and DB stay in sync'],
      },
      {
        phase: 3,
        title: 'Global Routing',
        objective: 'Cloudflare Workers for tenant-aware routing',
        deliverables: ['Worker routes per tenant subdomain', 'CDN caching strategy', 'Rate limiting per tier'],
        validationGates: ['Tenant routing resolves correctly', 'Rate limits enforced at edge'],
      },
    ],
  },
  {
    slug: 'rag-knowledge-platform',
    category: 'AI / Knowledge',
    title: 'RAG Knowledge Platform',
    description:
      'Enterprise knowledge retrieval platform using Retrieval-Augmented Generation, semantic search and Azure AI infrastructure.',
    summary:
      'Hybrid vector + keyword search via Azure AI Search, OpenAI embeddings, and document-level ACL. Built for enterprise knowledge bases with MSFT Entra auth and staged document ingestion pipelines.',
    azure: ['Azure AI Search', 'Azure OpenAI', 'Azure Functions', 'Azure Blob Storage', 'Azure Monitor', 'Azure Key Vault'],
    cloudflare: ['Cloudflare Workers', 'Cloudflare CDN'],
    ai: ['Azure OpenAI (embeddings + completion)', 'Azure AI Search (hybrid mode)', 'Relevance scoring pipeline'],
    dataLayer: ['Azure Blob Storage (document store)', 'Azure AI Search (vector index)', 'Azure Cosmos DB (metadata)'],
    devOps: ['GitHub Actions', 'Azure Functions deployment', 'Bicep IaC'],
    keyDecisions: [
      'Hybrid search: vector + keyword with RRF scoring',
      'Document chunking: paragraph-level with 10% overlap',
      'Document-level ACL enforced at query time',
      'Relevance scoring pipeline with feedback loop',
    ],
    security: 'Document-level ACL, MSFT Entra auth, private endpoints, no public blob access',
    compliance: ['GDPR', 'ISO 27001 aligned'],
    deployment: 'Serverless Azure Functions with staged rollout via deployment slots',
    scalingModel: 'AI Search replicas for query throughput; Functions scale on consumption plan',
    costDrivers: ['OpenAI embedding token cost at ingestion', 'AI Search SU count', 'Azure Functions execution volume'],
    riskAreas: ['Stale embeddings after document updates', 'ACL bypass if query-time enforcement is missed', 'Chunking strategy quality impact on retrieval accuracy'],
    accentColor: 'azure',
    workflowPreview: [
      {
        phase: 1,
        title: 'Document Ingestion',
        objective: 'Build chunking and embedding pipeline',
        deliverables: ['Chunking strategy', 'Embedding pipeline', 'AI Search index schema with ACL field'],
        validationGates: ['Chunks ≤ 512 tokens with overlap', 'ACL field populated per document'],
      },
      {
        phase: 2,
        title: 'Query & Retrieval',
        objective: 'Hybrid search with RRF scoring',
        deliverables: ['Hybrid query logic', 'Relevance scoring config', 'Auth-aware query filter'],
        validationGates: ['Retrieval accuracy > 80% on test set', 'ACL filter applied on every query'],
      },
      {
        phase: 3,
        title: 'RAG Generation',
        objective: 'Grounded completion via retrieved context',
        deliverables: ['Prompt template with citation anchors', 'Context window sizing strategy', 'Hallucination mitigation config'],
        validationGates: ['Generated answers cite source documents', 'No out-of-context completions in test set'],
      },
    ],
  },
  {
    slug: 'global-content-platform',
    category: 'Content & Edge',
    title: 'Global Content Platform',
    description:
      'High-performance content delivery platform with edge caching, global distribution and intelligent routing.',
    summary:
      'Edge-first architecture with Cloudflare Workers, stale-while-revalidate caching, and Azure as the origin. Designed for sub-100ms global TTFB with origin shield topology and automated cache invalidation.',
    azure: ['Azure Blob Storage', 'Azure Functions', 'Azure Front Door', 'Azure CDN', 'Azure Monitor'],
    cloudflare: ['Cloudflare Workers', 'Cloudflare CDN', 'Cloudflare Pages', 'Cloudflare R2'],
    ai: [],
    dataLayer: ['Cloudflare R2 (edge-close storage)', 'Azure Blob Storage (origin)', 'Azure Cache for Redis (invalidation signals)'],
    devOps: ['Cloudflare Pages CI/CD', 'GitHub Actions', 'Wrangler CLI', 'Terraform IaC'],
    keyDecisions: [
      'Edge-first rendering with Cloudflare Workers',
      'Cache-aside with stale-while-revalidate + TTL',
      'Origin shield via Azure Front Door to reduce origin load',
      'Cache invalidation via Redis pub/sub to Workers',
    ],
    security: 'WAF rules, rate limiting, bot management, DDoS protection at Cloudflare edge',
    compliance: ['GDPR (data residency configurable per region)', 'SOC 2 aligned'],
    deployment: 'Cloudflare Pages CI/CD with Wrangler; Workers versioned deploys',
    scalingModel: 'Cloudflare auto-scales at edge; Azure Functions consumption plan for origin compute',
    costDrivers: ['Cloudflare Workers request volume', 'R2 storage and egress', 'Azure Blob Storage egress'],
    riskAreas: ['Cache poisoning if input sanitisation missing in Workers', 'Cache invalidation lag on fast-changing content', 'Origin single point of failure without Front Door'],
    accentColor: 'cf-orange',
    workflowPreview: [
      {
        phase: 1,
        title: 'Edge Configuration',
        objective: 'Deploy Workers routes and caching rules',
        deliverables: ['Workers route config', 'Cache-control strategy', 'Origin shield topology'],
        validationGates: ['Cache HIT rate > 90% on repeat requests', 'Origin requests reduced by > 80%'],
      },
      {
        phase: 2,
        title: 'Cache Invalidation',
        objective: 'Reliable cache purge on content updates',
        deliverables: ['Redis pub/sub invalidation trigger', 'Workers cache tag purge logic', 'Monitoring dashboard'],
        validationGates: ['Content update reflects at edge in < 60s', 'No stale content served after forced invalidation'],
      },
      {
        phase: 3,
        title: 'Global Performance',
        objective: 'Validate sub-100ms TTFB globally',
        deliverables: ['Synthetic monitoring from 5 regions', 'P95 latency report', 'WAF rules baseline'],
        validationGates: ['P95 TTFB < 100ms from all monitored regions', 'WAF blocks test attack patterns'],
      },
    ],
  },
  {
    slug: 'enterprise-automation-platform',
    category: 'Enterprise',
    title: 'Enterprise Automation Platform',
    description:
      'Secure internal automation platform with Zero Trust access, workflow orchestration and AI-assisted processing.',
    summary:
      'Zero Trust network via Cloudflare with Azure Container Apps orchestration, Service Bus saga patterns, and AI-assisted workflow routing. Built for internal enterprise workloads with strict security posture.',
    azure: ['Azure Container Apps', 'Azure Service Bus', 'Azure AI', 'Azure Key Vault', 'Azure Monitor', 'Azure Logic Apps'],
    cloudflare: ['Cloudflare Zero Trust', 'Cloudflare Tunnel', 'Cloudflare Workers'],
    ai: ['Azure AI (classification)', 'Azure OpenAI (workflow routing assistance)'],
    dataLayer: ['Azure SQL', 'Azure Blob Storage', 'Azure Service Bus (workflow state)'],
    devOps: ['GitHub Actions', 'Azure Container Registry', 'GitOps with policy gates', 'Bicep IaC'],
    keyDecisions: [
      'WASM worker isolation for untrusted automation payloads',
      'Saga pattern for long-running workflows via Service Bus',
      'Secrets rotation automation via Key Vault + Container Apps env refresh',
      'Device trust enforcement via Cloudflare WARP',
    ],
    security: 'Zero Trust network, device trust enforcement, MFA enforced, no public endpoints',
    compliance: ['ISO 27001', 'Cyber Essentials Plus aligned', 'GDPR'],
    deployment: 'GitOps with Bicep + policy gates enforced before production promotion',
    scalingModel: 'Container Apps horizontal scaling; Service Bus partitions for throughput',
    costDrivers: ['Container Apps compute for automation workers', 'Service Bus message operations', 'Azure AI classification calls'],
    riskAreas: ['Saga compensating transactions on partial workflow failure', 'WASM sandbox escape risk on untrusted payloads', 'Key Vault throttling under high secrets rotation volume'],
    accentColor: 'azure',
    workflowPreview: [
      {
        phase: 1,
        title: 'Zero Trust Foundation',
        objective: 'Deploy Cloudflare Zero Trust with device trust',
        deliverables: ['Cloudflare Tunnel config', 'Zero Trust access policies', 'WARP device trust enrollment'],
        validationGates: ['No direct internet access to internal services', 'Device posture check enforced on every request'],
      },
      {
        phase: 2,
        title: 'Workflow Orchestration',
        objective: 'Implement saga pattern for long-running workflows',
        deliverables: ['Service Bus topic topology', 'Saga coordinator service', 'Compensating transaction handlers'],
        validationGates: ['Workflow recovers from 3-step partial failure', 'Dead letter queue alerts on saga failure'],
      },
      {
        phase: 3,
        title: 'AI-Assisted Routing',
        objective: 'Route automation tasks using Azure AI classification',
        deliverables: ['Classification model integration', 'Routing decision log', 'Fallback manual queue'],
        validationGates: ['Classification accuracy > 90% on labelled test set', 'Fallback queue triggered on low-confidence prediction'],
      },
    ],
  },
]

export function getBlueprintBySlug(slug: string): Blueprint | undefined {
  return BLUEPRINTS.find((b) => b.slug === slug)
}
