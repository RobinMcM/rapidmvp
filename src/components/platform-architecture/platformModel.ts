/**
 * Curated, hand-authored model of RapidMVP's own platform architecture.
 *
 * This is a deliberate, static infographic of the *product itself* (not an
 * inspected repository). Every node is marked `live` (shipped today) or
 * `planned` (designed but not yet built) so the diagram shows the full target
 * architecture without misrepresenting what currently exists.
 *
 * The model is intentionally free of React/lucide imports so it stays pure and
 * node-testable; icons are referenced by name and mapped in `icons.tsx`.
 */

export type ArchStatus = 'live' | 'planned'

export type ArchCategory =
  | 'io'
  | 'analysis'
  | 'static_validation'
  | 'dynamic_validation'
  | 'build_validation'
  | 'cloud_planning'
  | 'reporting'
  | 'infrastructure'
  | 'data'

export type IconName =
  | 'upload'
  | 'search'
  | 'shield-check'
  | 'settings'
  | 'code'
  | 'cloud'
  | 'file-text'
  | 'network'
  | 'inbox'
  | 'box'
  | 'clipboard'
  | 'layers'
  | 'database'

export type Synopsis = {
  whatItDoes: string[]
  whyItMatters: string
  keyOutputs: string[]
}

export type DiagramNode = {
  id: string
  step?: number
  title: string
  tagline: string
  category: ArchCategory
  status: ArchStatus
  icon: IconName
  synopsis: Synopsis
}

// ── The 7-stage pipeline ─────────────────────────────────────────────────────

export const PIPELINE: DiagramNode[] = [
  {
    id: 'upload',
    step: 1,
    title: 'Upload',
    tagline: 'Repository ZIP uploaded',
    category: 'io',
    status: 'live',
    icon: 'upload',
    synopsis: {
      whatItDoes: [
        'Accepts the repository ZIP as the handover artefact',
        'Stores the archive securely in object storage',
        'Records package metadata and links the upload',
      ],
      whyItMatters: 'The ZIP is the single source of truth for everything that follows.',
      keyOutputs: ['Repository Package', 'Stored Archive'],
    },
  },
  {
    id: 'inspect',
    step: 2,
    title: 'Inspect',
    tagline: 'Repository analysis & fact extraction',
    category: 'analysis',
    status: 'live',
    icon: 'search',
    synopsis: {
      whatItDoes: [
        'Detects language, framework, and package manager',
        'Extracts environment variables (names only, never values)',
        'Identifies databases, storage, auth and other services',
      ],
      whyItMatters: 'Establishes the deterministic facts every later step relies on.',
      keyOutputs: ['Detected Stack', 'Env Inventory', 'Detected Services'],
    },
  },
  {
    id: 'consistency',
    step: 3,
    title: 'Consistency Validation',
    tagline: 'Static analysis & consistency checks',
    category: 'static_validation',
    status: 'live',
    icon: 'shield-check',
    synopsis: {
      whatItDoes: [
        'Checks dependencies, imports and configuration alignment',
        'Detects missing scripts, broken imports and circular deps',
        'Validates environment variable consistency',
      ],
      whyItMatters: 'Surfaces issues that would block installation — before any execution.',
      keyOutputs: ['Consistency Score', 'Findings'],
    },
  },
  {
    id: 'installation',
    step: 4,
    title: 'Installation Validation',
    tagline: 'Isolated environment · npm / pnpm / yarn install',
    category: 'dynamic_validation',
    status: 'planned',
    icon: 'settings',
    synopsis: {
      whatItDoes: [
        'Detects the package manager (npm / pnpm / yarn)',
        'Runs install with resource and network limits',
        'Captures warnings and peer-dependency observations',
        'Identifies missing or conflicting dependencies',
        'Redacts sensitive information from logs',
      ],
      whyItMatters: 'Confirms the repository can be installed before attempting builds or deployment.',
      keyOutputs: ['Install Status', 'Warnings', 'Peer Issues', 'Conflicts'],
    },
  },
  {
    id: 'build',
    step: 5,
    title: 'Build Validation',
    tagline: 'Run build process & verify output',
    category: 'build_validation',
    status: 'planned',
    icon: 'code',
    synopsis: {
      whatItDoes: [
        'Runs the detected build command in isolation',
        'Captures compilation observations and missing configuration',
        'Verifies build output is produced',
      ],
      whyItMatters: 'Demonstrates the application can actually be built for deployment.',
      keyOutputs: ['Build Status', 'Compilation Notes'],
    },
  },
  {
    id: 'cloud-blueprint',
    step: 6,
    title: 'Cloud Blueprint',
    tagline: 'Cloud resources & deployment plan',
    category: 'cloud_planning',
    status: 'live',
    icon: 'cloud',
    synopsis: {
      whatItDoes: [
        'Recommends cloud resources for the detected stack',
        'Maps secrets to a secure store (e.g. Key Vault)',
        'Produces ordered provisioning and deployment steps',
      ],
      whyItMatters: 'Turns inspection facts into an actionable, provider-specific deployment plan.',
      keyOutputs: ['Resource Plan', 'Secrets Mapping', 'Readiness Score'],
    },
  },
  {
    id: 'reports',
    step: 7,
    title: 'Reports & Guides',
    tagline: 'Stakeholder report & engineer guide',
    category: 'reporting',
    status: 'live',
    icon: 'file-text',
    synopsis: {
      whatItDoes: [
        'Generates a plain-language stakeholder report',
        'Generates a detailed engineer installation guide',
        'Frames findings as observations, never blame',
      ],
      whyItMatters: 'Gives every audience the confidence to take ownership and operate the software.',
      keyOutputs: ['Stakeholder Report', 'Engineer Guide'],
    },
  },
]

// ── Orchestration layer ──────────────────────────────────────────────────────

export const ORCHESTRATION: DiagramNode = {
  id: 'orchestration',
  title: 'Orchestration & API Layer (Next.js)',
  tagline: 'REST API · Authentication · Authorization · Queue Management · Report Generation',
  category: 'infrastructure',
  status: 'live',
  icon: 'network',
  synopsis: {
    whatItDoes: [
      'Exposes the REST API and authenticates/authorizes requests',
      'Coordinates inspection and report generation',
      'Will enqueue and track validation jobs (queue management is planned)',
    ],
    whyItMatters: 'The control plane that ties the pipeline together — it never executes untrusted code itself.',
    keyOutputs: ['API', 'Auth', 'Job Coordination'],
  },
}

// ── Validation Worker Service (isolated) — planned ───────────────────────────

export const WORKER_SERVICE: DiagramNode = {
  id: 'worker-service',
  title: 'Validation Worker Service (Isolated)',
  tagline: 'Asynchronous job processing · Secure execution · Resource limits · Timeout control',
  category: 'infrastructure',
  status: 'planned',
  icon: 'box',
  synopsis: {
    whatItDoes: [
      'Runs untrusted repository code off the web tier',
      'Processes validation jobs asynchronously',
      'Enforces resource limits and timeouts',
    ],
    whyItMatters: 'Keeps installation/build execution safely isolated from the application and auth tiers.',
    keyOutputs: ['Isolated Execution'],
  },
}

export const WORKER_PARTS: DiagramNode[] = [
  {
    id: 'job-consumer',
    title: 'Job Consumer',
    tagline: 'Pull jobs from queue & prepare environment',
    category: 'infrastructure',
    status: 'planned',
    icon: 'inbox',
    synopsis: {
      whatItDoes: [
        'Pulls queued validation jobs',
        'Fetches the repository archive and extracts it',
        'Prepares a fresh, isolated workspace per job',
      ],
      whyItMatters: 'Each job starts from a clean, controlled environment.',
      keyOutputs: ['Prepared Workspace'],
    },
  },
  {
    id: 'sandbox-executor',
    title: 'Sandbox Executor',
    tagline: 'Isolated container per job · Install / Build / Test',
    category: 'dynamic_validation',
    status: 'planned',
    icon: 'box',
    synopsis: {
      whatItDoes: [
        'Spawns a disposable, locked-down container per job',
        'Runs install and build with dropped privileges',
        'Restricts the network to allowlisted registries',
      ],
      whyItMatters: 'This is where untrusted code runs — contained, then destroyed.',
      keyOutputs: ['Execution Results', 'Captured Logs'],
    },
  },
  {
    id: 'result-collector',
    title: 'Result Collector',
    tagline: 'Capture logs, metrics & store results',
    category: 'reporting',
    status: 'planned',
    icon: 'clipboard',
    synopsis: {
      whatItDoes: [
        'Captures redacted logs, durations and metrics',
        'Maps outcomes to Validated / Partially / Requires Clarification / Not Validated',
        'Writes results back through the control plane',
      ],
      whyItMatters: 'Turns raw execution into safe, structured, blame-free observations.',
      keyOutputs: ['Validation Results', 'Metrics'],
    },
  },
]

export const JOB_QUEUE: DiagramNode = {
  id: 'job-queue',
  title: 'Job Queue',
  tagline: 'Redis / BullMQ · Job tracking & status updates',
  category: 'infrastructure',
  status: 'planned',
  icon: 'layers',
  synopsis: {
    whatItDoes: [
      'Holds validation jobs durably between the API and workers',
      'Tracks job status and provides backpressure',
      'Enables retries and concurrency control',
    ],
    whyItMatters: 'Decouples slow, isolated execution from fast web requests.',
    keyOutputs: ['Queued Jobs', 'Status Updates'],
  },
}

export const REPO_STORAGE: DiagramNode = {
  id: 'repo-storage',
  title: 'Repository Storage',
  tagline: 'ZIP files & extracted artifacts',
  category: 'io',
  status: 'live',
  icon: 'database',
  synopsis: {
    whatItDoes: [
      'Stores uploaded repository archives',
      'Holds extracted artefacts for analysis',
      'Serves read-only copies to inspection and workers',
    ],
    whyItMatters: 'Durable, central storage for the handover artefact.',
    keyOutputs: ['Stored ZIPs', 'Artefacts'],
  },
}

// ── Data layer ───────────────────────────────────────────────────────────────

export const DATA_LAYER: DiagramNode[] = [
  {
    id: 'data-packages',
    title: 'Repository Packages',
    tagline: 'Uploaded repositories & detected facts',
    category: 'data',
    status: 'live',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Persists repository metadata, detected stack and services'],
      whyItMatters: 'The record of what was delivered.',
      keyOutputs: ['Package Records'],
    },
  },
  {
    id: 'data-validation',
    title: 'Validation Results',
    tagline: 'Installation & build observations',
    category: 'data',
    status: 'planned',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Stores install/build outcomes, warnings and redacted log tails'],
      whyItMatters: 'Evidence behind operational confidence.',
      keyOutputs: ['Validation Records'],
    },
  },
  {
    id: 'data-blueprint',
    title: 'Blueprint Data',
    tagline: 'Cloud resources & deployment plans',
    category: 'data',
    status: 'live',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Stores recommended resources, secrets mapping and steps'],
      whyItMatters: 'The deployable plan derived from inspection.',
      keyOutputs: ['Blueprints'],
    },
  },
  {
    id: 'data-reports',
    title: 'Reports',
    tagline: 'Stakeholder & engineer documents',
    category: 'data',
    status: 'live',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Stores generated stakeholder and engineer reports'],
      whyItMatters: 'The shareable handover deliverables.',
      keyOutputs: ['Report Records'],
    },
  },
  {
    id: 'data-audit',
    title: 'Audit Logs',
    tagline: 'Actions & access history',
    category: 'data',
    status: 'planned',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Records pipeline actions and access for traceability'],
      whyItMatters: 'Accountability and security review.',
      keyOutputs: ['Audit Trail'],
    },
  },
  {
    id: 'data-metrics',
    title: 'Metrics & Scores',
    tagline: 'Confidence & operational metrics',
    category: 'data',
    status: 'planned',
    icon: 'database',
    synopsis: {
      whatItDoes: ['Stores operational confidence scores and run metrics'],
      whyItMatters: 'Tracks readiness over time.',
      keyOutputs: ['Scores', 'Metrics'],
    },
  },
]

// ── Category styling (single source of truth) ────────────────────────────────

export type CategoryStyle = {
  label: string
  badge: string // bg + text for the icon tile
  dot: string
  ring: string // border accent
}

export const CATEGORY_STYLE: Record<ArchCategory, CategoryStyle> = {
  io: { label: 'Input / Output', badge: 'bg-azure/15 text-azure-300', dot: 'bg-azure', ring: 'border-azure/40' },
  analysis: { label: 'Analysis', badge: 'bg-emerald-500/15 text-emerald-300', dot: 'bg-emerald-500', ring: 'border-emerald-500/40' },
  static_validation: { label: 'Static Validation', badge: 'bg-amber-500/15 text-amber-300', dot: 'bg-amber-500', ring: 'border-amber-500/40' },
  dynamic_validation: { label: 'Dynamic Validation', badge: 'bg-violet-500/15 text-violet-300', dot: 'bg-violet-500', ring: 'border-violet-500/40' },
  build_validation: { label: 'Build Validation', badge: 'bg-cf-orange/15 text-cf-300', dot: 'bg-cf-orange', ring: 'border-cf-orange/40' },
  cloud_planning: { label: 'Cloud Planning', badge: 'bg-azure/15 text-azure-300', dot: 'bg-azure-400', ring: 'border-azure/40' },
  reporting: { label: 'Reporting', badge: 'bg-teal-500/15 text-teal-300', dot: 'bg-teal-500', ring: 'border-teal-500/40' },
  infrastructure: { label: 'Infrastructure', badge: 'bg-slate-500/15 text-slate-300', dot: 'bg-slate-500', ring: 'border-slate-600/60' },
  data: { label: 'Data', badge: 'bg-slate-500/15 text-slate-300', dot: 'bg-slate-400', ring: 'border-slate-600/60' },
}

// Categories shown in the legend (in order). Infra/data share the neutral key.
export const LEGEND_CATEGORIES: ArchCategory[] = [
  'io',
  'analysis',
  'static_validation',
  'dynamic_validation',
  'build_validation',
  'cloud_planning',
  'reporting',
]

export type StatusStyle = { label: string; badge: string; dot: string }

export const STATUS_STYLE: Record<ArchStatus, StatusStyle> = {
  live: { label: 'Live', badge: 'bg-emerald-900/40 text-emerald-300', dot: 'bg-emerald-500' },
  planned: { label: 'Planned', badge: 'bg-slate-800 text-slate-400', dot: 'bg-slate-500' },
}

/** Every node in one flat list — convenient for lookups and tests. */
export const ALL_NODES: DiagramNode[] = [
  ...PIPELINE,
  ORCHESTRATION,
  WORKER_SERVICE,
  ...WORKER_PARTS,
  JOB_QUEUE,
  REPO_STORAGE,
  ...DATA_LAYER,
]
