import { describe, it, expect } from 'vitest'
import {
  AZURE_SERVICE_CATALOG,
  AZURE_OVERVIEW_FIELDS,
  getAzureServiceProfile,
  hasAzureServiceProfile,
  resolveAzureServiceOverview,
} from '../azure-service-catalog'
import { MIGRATION_REGISTRY } from '../migration-mapper'
import { assessAzureReadiness } from '../azure-assessor'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { nextjsPrismaRepo } from './fixtures'

describe('Azure service catalogue — shared component model', () => {
  it('describes every canonical Azure target in the migration registry', () => {
    const targets = MIGRATION_REGISTRY.map((r) => r.azureResource).filter((r): r is string => r !== null)
    for (const target of targets) {
      expect(hasAzureServiceProfile(target), `missing catalogue profile for "${target}"`).toBe(true)
    }
  })

  it('describes every Azure service the assessor recommends for a real repo', () => {
    const files = nextjsPrismaRepo()
    const stack = detectStack(files)
    const env = detectEnvVars(files)
    const assessment = assessAzureReadiness(stack, env, files)
    for (const svc of assessment.services) {
      expect(hasAzureServiceProfile(svc.name), `missing catalogue profile for "${svc.name}"`).toBe(true)
    }
  })

  it('returns null for unknown or empty resources', () => {
    expect(getAzureServiceProfile(null)).toBeNull()
    expect(getAzureServiceProfile(undefined)).toBeNull()
    expect(getAzureServiceProfile('Totally Made Up Service')).toBeNull()
    expect(resolveAzureServiceOverview(null)).toBeNull()
  })

  it('provides all ten overview fields, non-empty, for every catalogued service', () => {
    for (const [name, profile] of Object.entries(AZURE_SERVICE_CATALOG)) {
      const overview = resolveAzureServiceOverview(name)!
      expect(overview, name).not.toBeNull()
      for (const field of AZURE_OVERVIEW_FIELDS) {
        const value = overview[field.key]
        if (field.kind === 'list') {
          expect(Array.isArray(value), `${name}.${String(field.key)} should be a list`).toBe(true)
        } else {
          expect(typeof value === 'string' && value.length > 0, `${name}.${String(field.key)} should be non-empty text`).toBe(true)
        }
      }
      // resource/kind echo the profile so the UI can pick an icon + tint.
      expect(overview.kind).toBe(profile.kind)
    }
  })

  it('enriches context: names the current technology being replaced', () => {
    const generic = resolveAzureServiceOverview('Azure Database for PostgreSQL Flexible Server')!
    const contextual = resolveAzureServiceOverview('Azure Database for PostgreSQL Flexible Server', {
      replaces: 'PostgreSQL',
    })!
    expect(contextual.replaces).toMatch(/PostgreSQL/)
    expect(contextual.replaces).not.toBe(generic.replaces)
  })

  it('uses migration notes as the migration considerations when provided', () => {
    const o = resolveAzureServiceOverview('Azure Blob Storage', { migrationNotes: 'Custom porting note.' })!
    expect(o.migrationConsiderations).toBe('Custom porting note.')
  })

  it('merges detected secret names without duplicating, and shows names only', () => {
    const o = resolveAzureServiceOverview('Azure Database for PostgreSQL Flexible Server', {
      secrets: ['DATABASE_URL', 'PGPASSWORD'],
    })!
    expect(o.requiredSecrets).toContain('PGPASSWORD')
    // DATABASE_URL is in the base profile — must not appear twice.
    expect(o.requiredSecrets.filter((s) => s === 'DATABASE_URL')).toHaveLength(1)
  })

  it('is deterministic — identical inputs produce identical overviews', () => {
    const a = resolveAzureServiceOverview('Microsoft Entra External ID', { replaces: 'Auth0' })
    const b = resolveAzureServiceOverview('Microsoft Entra External ID', { replaces: 'Auth0' })
    expect(a).toEqual(b)
  })
})
