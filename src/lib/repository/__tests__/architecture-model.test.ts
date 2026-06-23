import { describe, it, expect } from 'vitest'
import {
  buildArchitectureModel,
  confidenceExplanation,
  CONFIDENCE_LABEL,
  type ArchitectureFacts,
  type ArchNode,
} from '../architecture-model'
import { detectServices } from '../service-detector'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { assessAzureReadiness } from '../azure-assessor'
import { filesFrom, nextjsPrismaRepo, expressApiRepo } from './fixtures'

function factsFrom(files: Map<string, string>): ArchitectureFacts {
  const stack = detectStack(files)
  const envVars = detectEnvVars(files)
  return {
    appType: stack.appType,
    detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
    runtime: stack.language,
    hasDatabase: stack.hasDatabase,
    hasPrisma: stack.hasPrisma,
    detectedServices: detectServices(files, envVars).services,
    envVarCount: envVars.length,
    azureServices: assessAzureReadiness(stack, envVars, files).services,
  }
}

const node = (nodes: ArchNode[], kind: string) => nodes.filter((n) => n.kind === kind)

describe('buildArchitectureModel', () => {
  it('always includes a user and an application node', () => {
    const m = buildArchitectureModel(factsFrom(nextjsPrismaRepo()))
    expect(node(m.nodes, 'user')).toHaveLength(1)
    expect(node(m.nodes, 'application')).toHaveLength(1)
    expect(node(m.nodes, 'application')[0].title).toContain('Next.js')
  })

  it('renders a detected database node for a Prisma + Postgres repo', () => {
    const files = nextjsPrismaRepo()
    files.set('prisma/schema.prisma', 'datasource db { provider = "postgresql" }')
    const m = buildArchitectureModel(factsFrom(files))
    const db = node(m.nodes, 'database')
    expect(db).toHaveLength(1)
    expect(db[0].confidence).toBe('detected')
    expect(db[0].title).toBe('PostgreSQL')
  })

  it('emits requires_clarification core nodes when nothing is detected', () => {
    const m = buildArchitectureModel(factsFrom(expressApiRepo()))
    const auth = node(m.nodes, 'authentication')
    const storage = node(m.nodes, 'storage')
    expect(auth[0].confidence).toBe('requires_clarification')
    expect(storage[0].confidence).toBe('requires_clarification')
    expect(m.hasUnknowns).toBe(true)
  })

  it('marks the application node requires_clarification for an unknown stack', () => {
    const m = buildArchitectureModel(factsFrom(filesFrom({ 'README.md': '# hi' })))
    expect(node(m.nodes, 'application')[0].confidence).toBe('requires_clarification')
  })

  it('creates deployment_target nodes from the Azure blueprint', () => {
    const m = buildArchitectureModel(factsFrom(nextjsPrismaRepo()))
    const targets = node(m.nodes, 'deployment_target')
    expect(targets.length).toBeGreaterThan(0)
    expect(targets.map((t) => t.title)).toContain('Azure App Service')
  })

  it('every edge references existing node ids', () => {
    const m = buildArchitectureModel(factsFrom(nextjsPrismaRepo()))
    const ids = new Set(m.nodes.map((n) => n.id))
    for (const e of m.edges) {
      expect(ids.has(e.from)).toBe(true)
      expect(ids.has(e.to)).toBe(true)
    }
  })

  // The core invariant: a node is never presented as a real component without
  // evidence, UNLESS it is an explicit requires_clarification placeholder or the
  // standard user/application actor.
  it('never invents: every non-clarification component node has evidence', () => {
    const m = buildArchitectureModel(factsFrom(nextjsPrismaRepo()))
    for (const n of m.nodes) {
      if (n.confidence === 'requires_clarification') continue
      expect(n.detectedFrom.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic — identical facts produce identical models', () => {
    const files = nextjsPrismaRepo()
    expect(buildArchitectureModel(factsFrom(files))).toEqual(buildArchitectureModel(factsFrom(files)))
  })
})

describe('confidence presentation helpers', () => {
  const make = (confidence: ArchNode['confidence'], detectedFrom: string[]): ArchNode => ({
    id: 'x', kind: 'database', title: 'X', description: '', purpose: '',
    detectedFrom, confidence, deploymentRecommendation: null, azureResource: null,
  })

  it('labels each confidence level in stakeholder-friendly terms', () => {
    expect(CONFIDENCE_LABEL.detected).toBe('Detected')
    expect(CONFIDENCE_LABEL.likely).toBe('Likely')
    expect(CONFIDENCE_LABEL.requires_clarification).toBe('Requires Clarification')
  })

  it('explains detected nodes by citing their evidence', () => {
    expect(confidenceExplanation(make('detected', ['Prisma schema']))).toMatch(/Prisma schema/)
  })

  it('never presents a requires_clarification node as a fact', () => {
    const text = confidenceExplanation(make('requires_clarification', []))
    expect(text).toMatch(/confirmation is required/i)
    expect(text).not.toMatch(/detected directly/i)
  })
})
