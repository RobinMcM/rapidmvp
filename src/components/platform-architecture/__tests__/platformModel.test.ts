import { describe, it, expect } from 'vitest'
import {
  ALL_NODES,
  PIPELINE,
  CATEGORY_STYLE,
  STATUS_STYLE,
  LEGEND_CATEGORIES,
  type ArchCategory,
  type ArchStatus,
} from '../platformModel'

describe('platform architecture model', () => {
  it('has the 7 pipeline stages numbered 1..7 in order', () => {
    expect(PIPELINE).toHaveLength(7)
    expect(PIPELINE.map((n) => n.step)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('uses unique node ids', () => {
    const ids = ALL_NODES.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every node has complete, non-empty synopsis content', () => {
    for (const n of ALL_NODES) {
      expect(n.title.length, n.id).toBeGreaterThan(0)
      expect(n.tagline.length, n.id).toBeGreaterThan(0)
      expect(n.synopsis.whatItDoes.length, n.id).toBeGreaterThan(0)
      expect(n.synopsis.whatItDoes.every((s) => s.trim().length > 0), n.id).toBe(true)
      expect(n.synopsis.whyItMatters.trim().length, n.id).toBeGreaterThan(0)
      expect(n.synopsis.keyOutputs.length, n.id).toBeGreaterThan(0)
    }
  })

  it('every node has a valid status and a style for it', () => {
    const statuses: ArchStatus[] = ['live', 'planned']
    for (const n of ALL_NODES) {
      expect(statuses).toContain(n.status)
      expect(STATUS_STYLE[n.status]).toBeDefined()
    }
  })

  it('every node category has a defined style', () => {
    for (const n of ALL_NODES) {
      expect(CATEGORY_STYLE[n.category], `${n.id} → ${n.category}`).toBeDefined()
    }
  })

  it('legend categories all have styles', () => {
    for (const c of LEGEND_CATEGORIES) {
      expect(CATEGORY_STYLE[c as ArchCategory]).toBeDefined()
    }
  })

  it('marks installation and build validation as planned (honest fidelity)', () => {
    const byId = Object.fromEntries(ALL_NODES.map((n) => [n.id, n]))
    expect(byId['installation'].status).toBe('planned')
    expect(byId['build'].status).toBe('planned')
    expect(byId['worker-service'].status).toBe('planned')
    expect(byId['job-queue'].status).toBe('planned')
    // And the shipped stages are live.
    expect(byId['upload'].status).toBe('live')
    expect(byId['inspect'].status).toBe('live')
    expect(byId['consistency'].status).toBe('live')
    expect(byId['cloud-blueprint'].status).toBe('live')
    expect(byId['reports'].status).toBe('live')
  })
})
