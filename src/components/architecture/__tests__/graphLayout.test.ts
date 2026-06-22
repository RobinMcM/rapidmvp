import { describe, it, expect } from 'vitest'
import { layoutArchitecture, edgePath, ROW_H } from '../graphLayout'
import { buildArchitectureModel, type ArchitectureFacts } from '../../../lib/repository/architecture-model'
import { detectServices } from '../../../lib/repository/service-detector'
import { detectStack } from '../../../lib/repository/stack-detector'
import { detectEnvVars } from '../../../lib/repository/env-detector'
import { assessAzureReadiness } from '../../../lib/repository/azure-assessor'
import { filesFrom, nextjsPrismaRepo, expressApiRepo } from '../../../lib/repository/__tests__/fixtures'

function modelFrom(files: Map<string, string>) {
  const stack = detectStack(files)
  const envVars = detectEnvVars(files)
  const facts: ArchitectureFacts = {
    appType: stack.appType,
    detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
    runtime: stack.language,
    hasDatabase: stack.hasDatabase,
    hasPrisma: stack.hasPrisma,
    detectedServices: detectServices(files, envVars).services,
    envVarCount: envVars.length,
    azureServices: assessAzureReadiness(stack, envVars, files).services,
  }
  return buildArchitectureModel(facts)
}

describe('layoutArchitecture', () => {
  it('positions every node and reports positive canvas dimensions', () => {
    const layout = layoutArchitecture(modelFrom(nextjsPrismaRepo()))
    expect(layout.nodes.length).toBeGreaterThan(0)
    expect(layout.width).toBeGreaterThan(0)
    expect(layout.height).toBeGreaterThan(0)
    for (const p of layout.nodes) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('every laid-out edge connects two positioned nodes', () => {
    const model = modelFrom(nextjsPrismaRepo())
    const layout = layoutArchitecture(model)
    // Edges in the layout never exceed the model's edges (missing endpoints dropped).
    expect(layout.edges.length).toBeLessThanOrEqual(model.edges.length)
    for (const e of layout.edges) {
      expect(Number.isFinite(e.from.x)).toBe(true)
      expect(Number.isFinite(e.to.y)).toBe(true)
      // child sits below its parent (top-to-bottom layering)
      expect(e.to.y).toBeGreaterThanOrEqual(e.from.y)
    }
  })

  it('is deterministic', () => {
    const m = modelFrom(nextjsPrismaRepo())
    expect(layoutArchitecture(m)).toEqual(layoutArchitecture(m))
  })

  it('compacts empty layers for a sparse repo (no user-less gaps)', () => {
    // expressApiRepo has app + clarification services but no deployment-less gaps
    const layout = layoutArchitecture(modelFrom(expressApiRepo()))
    const ys = [...new Set(layout.nodes.map((n) => n.y))].sort((a, b) => a - b)
    // consecutive occupied rows differ by exactly ROW_H (no empty rows between)
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBe(ROW_H)
    }
  })

  it('produces a valid bezier path string', () => {
    const layout = layoutArchitecture(modelFrom(nextjsPrismaRepo()))
    if (layout.edges.length > 0) {
      const d = edgePath(layout.edges[0])
      expect(d.startsWith('M ')).toBe(true)
      expect(d).toContain(' C ')
    }
  })

  it('handles an empty model without throwing', () => {
    const empty = layoutArchitecture({
      nodes: [],
      edges: [],
      groups: { application: [], data: [], external: [], deployment: [] },
      generatedFrom: { stack: false, envVars: false, azure: false },
      hasUnknowns: false,
    })
    expect(empty.nodes).toHaveLength(0)
    expect(empty.width).toBeGreaterThan(0)
  })
})
