import { describe, it, expect } from 'vitest'
import {
  mapService,
  buildMigrationPlan,
  buildOwnershipModel,
  buildAssumptions,
  buildClarifications,
} from '../migration-mapper'
import type { DetectedService } from '../service-detector'
import { detectServices } from '../service-detector'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { assessAzureReadiness } from '../azure-assessor'
import { nextjsPrismaRepo } from './fixtures'

function svc(category: DetectedService['category'], provider: string, confidence: DetectedService['confidence'] = 'detected'): DetectedService {
  return { category, provider, confidence, detectedFrom: [`${provider} evidence`] }
}

describe('mapService', () => {
  it('maps PostgreSQL → Azure PostgreSQL Flexible Server (migrate, low)', () => {
    const m = mapService(svc('database', 'PostgreSQL'))
    expect(m.azureState).toBe('Azure Database for PostgreSQL Flexible Server')
    expect(m.decision).toBe('migrate')
    expect(m.complexity).toBe('low')
  })

  it('maps S3 / Spaces → Azure Blob Storage (migrate, medium)', () => {
    expect(mapService(svc('storage', 'Amazon S3 / S3-compatible')).azureState).toBe('Azure Blob Storage')
    const spaces = mapService(svc('storage', 'DigitalOcean Spaces'))
    expect(spaces.decision).toBe('migrate')
    expect(spaces.complexity).toBe('medium')
  })

  it('keeps Azure Blob Storage as remain (none)', () => {
    const m = mapService(svc('storage', 'Azure Blob Storage'))
    expect(m.decision).toBe('remain')
    expect(m.complexity).toBe('none')
  })

  it('maps any auth provider → Microsoft Entra External ID (migrate, high)', () => {
    const m = mapService(svc('authentication', 'Auth0'))
    expect(m.azureState).toBe('Microsoft Entra External ID')
    expect(m.decision).toBe('migrate')
    expect(m.complexity).toBe('high')
  })

  it('maps email providers → Azure Communication Services Email', () => {
    expect(mapService(svc('email', 'SendGrid')).azureResource).toBe('Azure Communication Services')
  })

  it('keeps Stripe as remain with no Azure resource', () => {
    const m = mapService(svc('external_service', 'Stripe'))
    expect(m.decision).toBe('remain')
    expect(m.azureResource).toBeNull()
  })

  it('keeps AI providers as remain', () => {
    expect(mapService(svc('external_service', 'Openai')).decision).toBe('remain')
    expect(mapService(svc('external_service', 'Anthropic')).decision).toBe('remain')
  })

  it('flags an engine-unknown database as requires_clarification', () => {
    const m = mapService(svc('database', 'Database', 'likely'))
    expect(m.decision).toBe('requires_clarification')
    expect(m.confidence).toBe('requires_clarification')
  })

  it('keeps unmapped external integrations as remain', () => {
    const m = mapService(svc('external_service', 'Segment', 'likely'))
    expect(m.decision).toBe('remain')
  })
})

describe('buildMigrationPlan', () => {
  it('always includes an application hosting row → Azure App Service', () => {
    const files = nextjsPrismaRepo()
    const plan = buildMigrationPlan(detectServices(files, detectEnvVars(files)).services, detectStack(files))
    const hosting = plan.mappings.find((m) => m.category === 'hosting')
    expect(hosting?.azureState).toBe('Azure App Service')
    expect(hosting?.decision).toBe('migrate')
  })

  it('groups mappings into remain / migrate / clarify with matching counts', () => {
    const services = [
      svc('database', 'PostgreSQL'),
      svc('storage', 'Amazon S3 / S3-compatible'),
      svc('external_service', 'Stripe'),
    ]
    const plan = buildMigrationPlan(services, detectStack(nextjsPrismaRepo()))
    expect(plan.counts.remain).toBe(plan.groups.remain.length)
    expect(plan.counts.migrate).toBe(plan.groups.migrate.length)
    expect(plan.groups.remain.some((m) => m.currentState === 'Stripe')).toBe(true)
    expect(plan.groups.migrate.some((m) => m.currentState === 'PostgreSQL')).toBe(true)
  })
})

describe('ownership / assumptions / clarifications', () => {
  it('marks Users as present when auth is detected and lists Stripe as external', () => {
    const files = nextjsPrismaRepo()
    const stack = detectStack(files)
    const envVars = detectEnvVars(files)
    const azure = assessAzureReadiness(stack, envVars, files)
    const services = [svc('authentication', 'Auth0'), svc('external_service', 'Stripe')]
    const plan = buildMigrationPlan(services, stack)
    const ownership = buildOwnershipModel(plan, azure.services)

    expect(ownership.owned.find((o) => o.area === 'Users')?.present).toBe(true)
    expect(ownership.owned.find((o) => o.area === 'Tenant')?.present).toBe(true)
    expect(ownership.external.some((e) => e.provider === 'Stripe')).toBe(true)
  })

  it('derives clarifications from requires_clarification mappings', () => {
    const plan = buildMigrationPlan([svc('database', 'Database', 'likely')], detectStack(nextjsPrismaRepo()))
    expect(buildClarifications(plan).length).toBeGreaterThan(0)
  })

  it('derives assumptions from likely-confidence migrations', () => {
    const plan = buildMigrationPlan([svc('storage', 'DigitalOcean Spaces', 'likely')], detectStack(nextjsPrismaRepo()))
    expect(buildAssumptions(plan).some((a) => a.text.includes('Azure Blob Storage'))).toBe(true)
  })
})
