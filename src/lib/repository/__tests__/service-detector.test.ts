import { describe, it, expect } from 'vitest'
import { detectServices, type DetectedService } from '../service-detector'
import { detectEnvVars } from '../env-detector'
import { filesFrom, nextjsPrismaRepo } from './fixtures'

function run(files: Map<string, string>): DetectedService[] {
  return detectServices(files, detectEnvVars(files)).services
}

const find = (s: DetectedService[], category: string) => s.filter((x) => x.category === category)

describe('detectServices', () => {
  it('detects PostgreSQL from the Prisma datasource and pg dependency', () => {
    const files = nextjsPrismaRepo()
    files.set('prisma/schema.prisma', 'datasource db { provider = "postgresql" }')
    const db = find(run(files), 'database')
    expect(db).toHaveLength(1)
    expect(db[0].provider).toBe('PostgreSQL')
    expect(db[0].confidence).toBe('detected')
  })

  it('detects SuperTokens authentication from dependencies', () => {
    const files = filesFrom({
      'package.json': JSON.stringify({ dependencies: { 'supertokens-node': '^24.0.0', next: '^16.0.0' } }),
    })
    const auth = find(run(files), 'authentication')
    expect(auth[0]?.provider).toBe('SuperTokens')
    expect(auth[0]?.confidence).toBe('detected')
  })

  it('detects S3 storage from @aws-sdk/client-s3, and Spaces when DO env present', () => {
    const files = filesFrom({
      'package.json': JSON.stringify({ dependencies: { '@aws-sdk/client-s3': '^3.0.0' } }),
      '.env.example': 'DO_SPACES_KEY=\nDO_SPACES_SECRET=',
    })
    const storage = find(run(files), 'storage')
    expect(storage[0]?.provider).toBe('DigitalOcean Spaces')
    expect(storage[0]?.confidence).toBe('detected')
  })

  it('marks storage as likely when only an env-var name signals it', () => {
    const files = filesFrom({
      'package.json': JSON.stringify({ dependencies: {} }),
      '.env.example': 'AWS_S3_BUCKET=',
    })
    const storage = find(run(files), 'storage')
    expect(storage[0]?.confidence).toBe('likely')
  })

  it('detects email and queue providers from dependencies', () => {
    const files = filesFrom({
      'package.json': JSON.stringify({ dependencies: { resend: '^3.0.0', bullmq: '^5.0.0' } }),
    })
    const services = run(files)
    expect(find(services, 'email')[0]?.provider).toBe('Resend')
    expect(find(services, 'queue')[0]?.provider).toContain('BullMQ')
  })

  it('surfaces unknown third-party APIs from *_API_KEY env names as likely', () => {
    const files = filesFrom({
      'package.json': JSON.stringify({ dependencies: {} }),
      '.env.example': 'STRIPE_API_KEY=\nDATABASE_URL=',
    })
    const ext = find(run(files), 'external_service')
    expect(ext.map((e) => e.provider)).toContain('Stripe')
    expect(ext[0].confidence).toBe('likely')
  })

  it('does not invent services for an empty repository', () => {
    const files = filesFrom({ 'package.json': JSON.stringify({ dependencies: {} }) })
    expect(run(files)).toHaveLength(0)
  })

  it('every detected service carries at least one piece of evidence', () => {
    const services = run(nextjsPrismaRepo())
    expect(services.length).toBeGreaterThan(0)
    for (const s of services) {
      expect(s.detectedFrom.length).toBeGreaterThan(0)
    }
  })
})
