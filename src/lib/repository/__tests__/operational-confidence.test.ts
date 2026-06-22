import { describe, it, expect } from 'vitest'
import { assessOperationalConfidence } from '../operational-confidence'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { detectServices } from '../service-detector'
import { checkConsistency } from '../consistency-checker'
import { assessAzureReadiness } from '../azure-assessor'
import { buildMigrationPlan } from '../migration-mapper'
import { nextjsPrismaRepo, expressApiRepo } from './fixtures'

function confidenceFor(files: Map<string, string>) {
  const stack = detectStack(files)
  const envVars = detectEnvVars(files)
  const services = detectServices(files, envVars).services
  const consistency = checkConsistency(files, stack, envVars)
  const azure = assessAzureReadiness(stack, envVars, files)
  const migrationPlan = buildMigrationPlan(services, stack)
  return assessOperationalConfidence({ consistency, azure, stack, migrationPlan })
}

// Words the product must never use in operational findings.
const FORBIDDEN = /\b(failed?|failure|broken|incorrect|developer error|fault|mistake)\b/i

function allStrings(c: ReturnType<typeof confidenceFor>): string[] {
  return [
    ...c.whatWeKnow,
    ...c.whatWeNeed,
    ...c.requiresClarification,
    ...c.categories.flatMap((cat) => [...cat.signals, ...cat.nextSteps]),
  ]
}

describe('assessOperationalConfidence', () => {
  it('produces the six operational categories', () => {
    const c = confidenceFor(nextjsPrismaRepo())
    const keys = c.categories.map((cat) => cat.key)
    expect(keys).toEqual([
      'repository_structure',
      'dependency_validation',
      'environment_validation',
      'installation_validation',
      'build_validation',
      'cloud_readiness',
    ])
  })

  it('returns an overall score between 0 and 100', () => {
    const c = confidenceFor(nextjsPrismaRepo())
    expect(c.score).toBeGreaterThanOrEqual(0)
    expect(c.score).toBeLessThanOrEqual(100)
  })

  it('uses only neutral, blame-free language', () => {
    for (const files of [nextjsPrismaRepo(), expressApiRepo()]) {
      const c = confidenceFor(files)
      for (const s of allStrings(c)) {
        expect(s, `forbidden word in: "${s}"`).not.toMatch(FORBIDDEN)
      }
    }
  })

  it('uses approved status labels only', () => {
    const c = confidenceFor(expressApiRepo())
    const allowed = ['validated', 'partially_validated', 'requires_clarification', 'not_yet_validated']
    expect(allowed).toContain(c.status)
    for (const cat of c.categories) expect(allowed).toContain(cat.status)
  })

  it('flags a repo with no start command as needing clarification in cloud readiness', () => {
    // expressApiRepo has no start script and no Dockerfile → an assessor blocker.
    const c = confidenceFor(expressApiRepo())
    const cloud = c.categories.find((cat) => cat.key === 'cloud_readiness')!
    expect(cloud.nextSteps.length).toBeGreaterThan(0)
  })

  it('answers what-we-know / what-we-need framing', () => {
    const c = confidenceFor(nextjsPrismaRepo())
    expect(Array.isArray(c.whatWeKnow)).toBe(true)
    expect(Array.isArray(c.whatWeNeed)).toBe(true)
    expect(Array.isArray(c.requiresClarification)).toBe(true)
  })
})
