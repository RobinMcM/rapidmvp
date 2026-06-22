import type { ConsistencyReport, ConsistencyFinding, ConsistencyCategory } from './consistency-checker'
import type { AzureAssessment } from './azure-assessor'
import type { StackResult } from './stack-detector'
import type { MigrationPlan } from './migration-mapper'

/**
 * Operational Confidence — an OPERATIONAL READINESS score, not a code-quality or
 * developer score. It answers: "how confidently could another team operate this
 * software on Azure?"
 *
 * It re-aggregates the deterministic signals already produced by the engine
 * (consistency check, Azure assessment, migration plan) into six operational
 * categories, and presents everything in neutral, blame-free language.
 *
 * Language rule (enforced): we present Validated / Partially Validated /
 * Requires Clarification / Not Yet Validated. We never say Failed, Broken,
 * Incorrect, or attribute developer error.
 */

// ── Public types ───────────────────────────────────────────────────────────────

export type ConfidenceStatus =
  | 'validated'
  | 'partially_validated'
  | 'requires_clarification'
  | 'not_yet_validated'

export type ConfidenceCategoryKey =
  | 'repository_structure'
  | 'dependency_validation'
  | 'environment_validation'
  | 'installation_validation'
  | 'build_validation'
  | 'cloud_readiness'

export type ConfidenceCategory = {
  key: ConfidenceCategoryKey
  label: string
  status: ConfidenceStatus
  score: number          // 0–100
  signals: string[]      // neutral, plain-language observations
  nextSteps: string[]    // recommended actions (neutral)
}

export type OperationalConfidence = {
  score: number          // 0–100 overall
  status: ConfidenceStatus
  categories: ConfidenceCategory[]
  whatWeKnow: string[]
  whatWeNeed: string[]
  requiresClarification: string[]
}

// ── Category definitions ─────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<ConfidenceCategoryKey, string> = {
  repository_structure: 'Repository Structure',
  dependency_validation: 'Dependency Validation',
  environment_validation: 'Environment Validation',
  installation_validation: 'Installation Validation',
  build_validation: 'Build Validation',
  cloud_readiness: 'Cloud Readiness',
}

// Relative weight of each category in the overall score (sums to 100).
const CATEGORY_WEIGHT: Record<ConfidenceCategoryKey, number> = {
  cloud_readiness: 30,
  build_validation: 20,
  installation_validation: 15,
  environment_validation: 15,
  dependency_validation: 12,
  repository_structure: 8,
}

// Which consistency categories feed which operational category.
const CONSISTENCY_TO_CATEGORY: Record<ConsistencyCategory, ConfidenceCategoryKey> = {
  orphaned_module: 'repository_structure',
  unused_export: 'repository_structure',
  circular_dependency: 'dependency_validation',
  broken_import: 'dependency_validation',
  missing_dependency: 'dependency_validation',
  unused_dependency: 'dependency_validation',
  missing_env_var: 'environment_validation',
  unreferenced_env_example: 'environment_validation',
  package_manager: 'installation_validation',
  missing_script: 'build_validation',
  stale_config: 'environment_validation',
}

// Neutral, blame-free phrasing for each consistency category.
const NEUTRAL_PHRASE: Record<ConsistencyCategory, string> = {
  broken_import: 'An import path could not be resolved and needs confirmation',
  missing_dependency: 'A referenced package is not yet listed in dependencies',
  unused_dependency: 'A dependency appears unused and can be reviewed',
  orphaned_module: 'A module is not referenced elsewhere and can be reviewed',
  unused_export: 'An export is not referenced elsewhere and can be reviewed',
  circular_dependency: 'A circular import was found and can be reviewed',
  missing_env_var: 'An environment variable is used in code but not documented',
  unreferenced_env_example: 'A documented environment variable is not referenced in code',
  missing_script: 'A build or start command needs confirmation',
  package_manager: 'Package manager configuration needs confirmation',
  stale_config: 'A configuration file needs review before deployment',
}

// ── Scoring helpers ──────────────────────────────────────────────────────────────

const SEVERITY_PENALTY = { critical: 25, warning: 10, info: 3 } as const

function statusFromScore(score: number, hasCritical: boolean, notYetValidated: boolean): ConfidenceStatus {
  if (notYetValidated) return 'not_yet_validated'
  if (hasCritical || score < 60) return 'requires_clarification'
  if (score < 85) return 'partially_validated'
  return 'validated'
}

/** Aggregate a set of consistency findings into a single category. */
function buildConsistencyCategory(
  key: ConfidenceCategoryKey,
  findings: ConsistencyFinding[],
  partial: boolean,
): ConfidenceCategory {
  let score = 100
  let hasCritical = false
  const signals: string[] = []
  const nextSteps: string[] = []
  const seen = new Set<string>()

  for (const f of findings) {
    score -= SEVERITY_PENALTY[f.severity]
    if (f.severity === 'critical') hasCritical = true
    const phrase = NEUTRAL_PHRASE[f.category]
    if (!seen.has(phrase)) {
      seen.add(phrase)
      signals.push(phrase)
      nextSteps.push(`Review: ${phrase.toLowerCase()}.`)
    }
  }

  score = Math.max(0, Math.min(100, score))

  // Absence-based checks are unreliable on a truncated file map.
  const notYetValidated = partial && findings.length === 0 &&
    (key === 'repository_structure' || key === 'dependency_validation')

  if (signals.length === 0 && !notYetValidated) {
    signals.push('No items require attention in this area.')
  }
  if (notYetValidated) {
    signals.push('The repository was large, so this area was only partially analysed.')
  }

  return {
    key,
    label: CATEGORY_LABEL[key],
    status: statusFromScore(score, hasCritical, notYetValidated),
    score,
    signals,
    nextSteps,
  }
}

/** Cloud Readiness blends the Azure assessment with the migration plan. */
function buildCloudReadiness(azure: AzureAssessment, stack: StackResult, plan: MigrationPlan): ConfidenceCategory {
  const signals: string[] = []
  const nextSteps: string[] = []
  const score = azure.azureReadinessScore
  const hasCritical = azure.blockers.length > 0

  if (stack.language !== 'unknown') {
    signals.push(`The application runtime (${stack.language}) was identified.`)
  }
  signals.push(`${azure.services.filter((s) => s.required).length} required Azure service(s) identified.`)

  if (plan.counts.migrate > 0) {
    signals.push(`${plan.counts.migrate} component(s) have a recommended Azure target.`)
  }
  if (plan.counts.remain > 0) {
    signals.push(`${plan.counts.remain} component(s) can remain as they are.`)
  }

  for (const b of azure.blockers) {
    // Reframe assessor blockers in neutral language.
    nextSteps.push(neutralize(b))
  }
  for (const c of plan.groups.clarify) {
    signals.push(`"${c.currentState}" needs confirmation before its Azure target is final.`)
  }

  return {
    key: 'cloud_readiness',
    label: CATEGORY_LABEL.cloud_readiness,
    status: statusFromScore(score, hasCritical, false),
    score: Math.max(0, Math.min(100, score)),
    signals,
    nextSteps,
  }
}

/** Build / installation specifics not fully captured by consistency findings. */
function enrichBuildAndInstall(
  categories: Record<ConfidenceCategoryKey, ConfidenceCategory>,
  stack: StackResult,
) {
  const build = categories.build_validation
  if (stack.startCommand) build.signals.unshift(`A start command was detected: "${stack.startCommand}".`)
  if (stack.buildCommand) build.signals.unshift(`A build command was detected: "${stack.buildCommand}".`)

  const install = categories.installation_validation
  install.signals.unshift(`Package manager: ${stack.packageManager}.`)
}

// Reframe any assessor string into neutral language, stripping discouraged words.
function neutralize(text: string): string {
  return text
    .replace(/\bfail(s|ed|ure)?\b/gi, 'may not complete')
    .replace(/\bbroken\b/gi, 'unresolved')
    .replace(/\bincorrect\b/gi, 'unconfirmed')
    .replace(/\berror(s)?\b/gi, 'item$1')
}

// ── Main aggregator ──────────────────────────────────────────────────────────────

export function assessOperationalConfidence(input: {
  consistency: ConsistencyReport
  azure: AzureAssessment
  stack: StackResult
  migrationPlan: MigrationPlan
}): OperationalConfidence {
  const { consistency, azure, stack, migrationPlan } = input

  // Bucket consistency findings by operational category.
  const buckets: Record<ConfidenceCategoryKey, ConsistencyFinding[]> = {
    repository_structure: [],
    dependency_validation: [],
    environment_validation: [],
    installation_validation: [],
    build_validation: [],
    cloud_readiness: [],
  }
  for (const f of consistency.findings) {
    buckets[CONSISTENCY_TO_CATEGORY[f.category]].push(f)
  }

  const categories: Record<ConfidenceCategoryKey, ConfidenceCategory> = {
    repository_structure: buildConsistencyCategory('repository_structure', buckets.repository_structure, consistency.partial),
    dependency_validation: buildConsistencyCategory('dependency_validation', buckets.dependency_validation, consistency.partial),
    environment_validation: buildConsistencyCategory('environment_validation', buckets.environment_validation, consistency.partial),
    installation_validation: buildConsistencyCategory('installation_validation', buckets.installation_validation, consistency.partial),
    build_validation: buildConsistencyCategory('build_validation', buckets.build_validation, consistency.partial),
    cloud_readiness: buildCloudReadiness(azure, stack, migrationPlan),
  }

  enrichBuildAndInstall(categories, stack)

  const ordered: ConfidenceCategoryKey[] = [
    'repository_structure',
    'dependency_validation',
    'environment_validation',
    'installation_validation',
    'build_validation',
    'cloud_readiness',
  ]
  const list = ordered.map((k) => categories[k])

  // Weighted overall score.
  const score = Math.round(
    list.reduce((sum, c) => sum + c.score * CATEGORY_WEIGHT[c.key], 0) / 100,
  )
  const anyCritical = list.some((c) => c.status === 'requires_clarification')

  const whatWeKnow: string[] = []
  const whatWeNeed: string[] = []
  const requiresClarification: string[] = []

  for (const c of list) {
    if (c.status === 'validated' || c.status === 'partially_validated') {
      whatWeKnow.push(`${c.label}: ${c.signals[0]}`)
    }
    if (c.status === 'requires_clarification' || c.status === 'not_yet_validated') {
      requiresClarification.push(`${c.label} requires confirmation.`)
    }
    for (const step of c.nextSteps) whatWeNeed.push(step)
  }

  return {
    score,
    status: statusFromScore(score, anyCritical, false),
    categories: list,
    whatWeKnow,
    whatWeNeed: [...new Set(whatWeNeed)],
    requiresClarification,
  }
}

// ── Presentation helpers (shared by UI) ──────────────────────────────────────

export const CONFIDENCE_STATUS_LABEL: Record<ConfidenceStatus, string> = {
  validated: 'Validated',
  partially_validated: 'Partially Validated',
  requires_clarification: 'Requires Clarification',
  not_yet_validated: 'Not Yet Validated',
}
