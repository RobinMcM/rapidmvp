import type { EnvVariable } from './env-detector'
import { findAppRoot } from './stack-detector'

/**
 * Lightweight, deterministic detection of the *services* a repository depends on
 * (database, authentication, storage, email, queue, external APIs).
 *
 * This is intentionally evidence-based: every detected service records exactly
 * where it was found and a confidence level. It NEVER infers a service without
 * a concrete signal — the Architecture Overview must never invent components.
 */

export type ServiceCategory =
  | 'database'
  | 'authentication'
  | 'storage'
  | 'email'
  | 'queue'
  | 'external_service'

export type DetectionConfidence = 'detected' | 'likely'

export type DetectedService = {
  category: ServiceCategory
  provider: string // human-readable, e.g. "PostgreSQL", "SuperTokens", "Amazon S3"
  detectedFrom: string[] // evidence, e.g. ["@prisma/client dependency", "DATABASE_URL"]
  confidence: DetectionConfidence
}

export type DetectedServices = {
  services: DetectedService[]
}

// Shared with azure-assessor so the env-name signals stay in one place.
export const STORAGE_ENV_PATTERNS: RegExp[] = [
  /BLOB/i,
  /STORAGE/i,
  /S3_BUCKET/i,
  /AWS_S3/i,
  /DO_SPACES/i,
  /CDN_URL/i,
  /AZURE_STORAGE/i,
]

// ── package.json access (app-root aware, mirrors stack-detector) ───────────────

function parsePkg(files: Map<string, string>): Record<string, unknown> | null {
  const root = findAppRoot(files)
  const raw = files.get(root + 'package.json') ?? (root !== '' ? files.get('package.json') : undefined)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function depsOf(pkg: Record<string, unknown> | null): Record<string, string> {
  if (!pkg) return {}
  return {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  }
}

const envNames = (envVars: EnvVariable[]) => envVars.map((v) => v.name)
const anyEnv = (names: string[], ...patterns: RegExp[]) =>
  names.filter((n) => patterns.some((p) => p.test(n)))

function titleCase(token: string): string {
  return token
    .toLowerCase()
    .split(/[_-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// A small accumulator that dedupes by category+provider and merges evidence,
// upgrading 'likely' → 'detected' if any signal is strong.
class ServiceBag {
  private map = new Map<string, DetectedService>()

  add(category: ServiceCategory, provider: string, confidence: DetectionConfidence, evidence: string) {
    const key = `${category}:${provider}`
    const existing = this.map.get(key)
    if (existing) {
      if (!existing.detectedFrom.includes(evidence)) existing.detectedFrom.push(evidence)
      if (confidence === 'detected') existing.confidence = 'detected'
    } else {
      this.map.set(key, { category, provider, confidence, detectedFrom: [evidence] })
    }
  }

  values(): DetectedService[] {
    return [...this.map.values()]
  }
}

// ── Detection ──────────────────────────────────────────────────────────────────

export function detectServices(files: Map<string, string>, envVars: EnvVariable[]): DetectedServices {
  const pkg = parsePkg(files)
  const deps = depsOf(pkg)
  const has = (name: string) => name in deps
  const names = envNames(envVars)
  const bag = new ServiceBag()

  // ── Database ────────────────────────────────────────────────────────────────
  // Prefer a concrete engine. Prisma's datasource provider refines the engine.
  const prismaSchema = [...files.entries()].find(([k]) => k.endsWith('prisma/schema.prisma'))?.[1] ?? ''
  const prismaProvider = /provider\s*=\s*"(\w+)"/.exec(prismaSchema)?.[1]?.toLowerCase()
  const PRISMA_DB: Record<string, string> = {
    postgresql: 'PostgreSQL',
    postgres: 'PostgreSQL',
    mysql: 'MySQL',
    sqlite: 'SQLite',
    sqlserver: 'SQL Server',
    mongodb: 'MongoDB',
    cockroachdb: 'CockroachDB',
  }

  if (has('pg')) bag.add('database', 'PostgreSQL', 'detected', 'pg dependency')
  if (has('mysql2') || has('mysql')) bag.add('database', 'MySQL', 'detected', 'mysql dependency')
  if (has('mongoose') || has('mongodb')) bag.add('database', 'MongoDB', 'detected', has('mongoose') ? 'mongoose dependency' : 'mongodb dependency')
  if (has('better-sqlite3') || has('sqlite3')) bag.add('database', 'SQLite', 'detected', 'sqlite dependency')
  if (has('redis') || has('ioredis')) bag.add('database', 'Redis', 'detected', has('ioredis') ? 'ioredis dependency' : 'redis dependency')

  if (prismaProvider && PRISMA_DB[prismaProvider]) {
    bag.add('database', PRISMA_DB[prismaProvider], 'detected', 'Prisma schema datasource')
  } else if (has('@prisma/client') || has('prisma')) {
    // Prisma present but engine not yet determined.
    if (bag.values().every((s) => s.category !== 'database')) {
      bag.add('database', 'SQL database', 'detected', 'Prisma ORM dependency')
    }
  }

  if (has('sequelize') || has('typeorm') || has('drizzle-orm')) {
    if (bag.values().every((s) => s.category !== 'database')) {
      const orm = has('drizzle-orm') ? 'Drizzle ORM' : has('typeorm') ? 'TypeORM' : 'Sequelize'
      bag.add('database', 'SQL database', 'likely', `${orm} dependency`)
    }
  }

  // Env-only database signal (e.g. non-Node stack or driver not in deps).
  if (bag.values().every((s) => s.category !== 'database')) {
    const dbEnv = anyEnv(names, /^DATABASE_URL$/, /^DB_URL$/, /^POSTGRES_URL$/, /^MYSQL_URL$/, /^MONGODB_URI$/, /^DATABASE_HOST$/, /^DB_HOST$/, /^PGHOST$/, /^PGDATABASE$/)
    if (dbEnv.length > 0) bag.add('database', 'Database', 'likely', dbEnv[0])
  }

  // ── Authentication ────────────────────────────────────────────────────────────
  if (has('supertokens-node') || has('supertokens-auth-react') || has('supertokens-web-js')) {
    bag.add('authentication', 'SuperTokens', 'detected', 'supertokens dependency')
  }
  if (has('next-auth') || has('@auth/core')) bag.add('authentication', 'Auth.js (NextAuth)', 'detected', has('next-auth') ? 'next-auth dependency' : '@auth/core dependency')
  if (Object.keys(deps).some((d) => d.startsWith('@auth0/'))) bag.add('authentication', 'Auth0', 'detected', '@auth0 dependency')
  if (Object.keys(deps).some((d) => d.startsWith('@clerk/'))) bag.add('authentication', 'Clerk', 'detected', '@clerk dependency')
  if (has('firebase-admin')) bag.add('authentication', 'Firebase', 'likely', 'firebase-admin dependency')
  if (has('passport')) bag.add('authentication', 'Passport', 'detected', 'passport dependency')

  // Provider-specific env markers (catch auth even when deps are absent).
  // dep-based adds above already mark these 'detected' and the bag merges evidence,
  // so an env-only match safely contributes 'likely'.
  const stEnv = anyEnv(names, /^SUPERTOKENS_/)
  if (stEnv.length) bag.add('authentication', 'SuperTokens', 'likely', stEnv[0])
  const naEnv = anyEnv(names, /^NEXTAUTH_/, /^AUTH_SECRET$/)
  if (naEnv.length) bag.add('authentication', 'Auth.js (NextAuth)', 'likely', naEnv[0])
  const a0Env = anyEnv(names, /^AUTH0_/)
  if (a0Env.length) bag.add('authentication', 'Auth0', 'likely', a0Env[0])
  const clkEnv = anyEnv(names, /^CLERK_/)
  if (clkEnv.length) bag.add('authentication', 'Clerk', 'likely', clkEnv[0])

  // ── Storage ─────────────────────────────────────────────────────────────────
  if (has('@aws-sdk/client-s3') || has('aws-sdk')) {
    const isSpaces = anyEnv(names, /DO_SPACES/i).length > 0
    bag.add('storage', isSpaces ? 'DigitalOcean Spaces' : 'Amazon S3 / S3-compatible', 'detected', has('@aws-sdk/client-s3') ? '@aws-sdk/client-s3 dependency' : 'aws-sdk dependency')
  }
  if (has('@azure/storage-blob')) bag.add('storage', 'Azure Blob Storage', 'detected', '@azure/storage-blob dependency')
  if (has('@google-cloud/storage')) bag.add('storage', 'Google Cloud Storage', 'detected', '@google-cloud/storage dependency')

  if (bag.values().every((s) => s.category !== 'storage')) {
    const storageEnv = anyEnv(names, ...STORAGE_ENV_PATTERNS)
    if (storageEnv.length > 0) {
      const provider = /DO_SPACES/i.test(storageEnv[0]) ? 'DigitalOcean Spaces'
        : /AZURE_STORAGE/i.test(storageEnv[0]) ? 'Azure Blob Storage'
        : /S3/i.test(storageEnv[0]) ? 'Amazon S3 / S3-compatible'
        : 'Object storage'
      bag.add('storage', provider, 'likely', storageEnv[0])
    }
  }

  // ── Email ─────────────────────────────────────────────────────────────────────
  if (has('@sendgrid/mail')) bag.add('email', 'SendGrid', 'detected', '@sendgrid/mail dependency')
  if (has('resend')) bag.add('email', 'Resend', 'detected', 'resend dependency')
  if (has('postmark')) bag.add('email', 'Postmark', 'detected', 'postmark dependency')
  if (has('nodemailer')) bag.add('email', 'SMTP (Nodemailer)', 'detected', 'nodemailer dependency')
  if (has('mailgun-js') || has('mailgun.js')) bag.add('email', 'Mailgun', 'detected', 'mailgun dependency')
  if (bag.values().every((s) => s.category !== 'email')) {
    if (anyEnv(names, /^SENDGRID_/).length) bag.add('email', 'SendGrid', 'likely', anyEnv(names, /^SENDGRID_/)[0])
    else if (anyEnv(names, /^RESEND_/).length) bag.add('email', 'Resend', 'likely', anyEnv(names, /^RESEND_/)[0])
    else if (anyEnv(names, /^POSTMARK_/).length) bag.add('email', 'Postmark', 'likely', anyEnv(names, /^POSTMARK_/)[0])
    else if (anyEnv(names, /^MAILGUN_/).length) bag.add('email', 'Mailgun', 'likely', anyEnv(names, /^MAILGUN_/)[0])
    else if (anyEnv(names, /^SMTP_/).length) bag.add('email', 'SMTP', 'likely', anyEnv(names, /^SMTP_/)[0])
  }

  // ── Queue / messaging ──────────────────────────────────────────────────────────
  if (has('bullmq') || has('bull')) bag.add('queue', 'Redis-backed queue (BullMQ)', 'detected', has('bullmq') ? 'bullmq dependency' : 'bull dependency')
  if (has('amqplib')) bag.add('queue', 'RabbitMQ', 'detected', 'amqplib dependency')
  if (has('kafkajs')) bag.add('queue', 'Apache Kafka', 'detected', 'kafkajs dependency')
  if (has('@google-cloud/pubsub')) bag.add('queue', 'Google Cloud Pub/Sub', 'detected', '@google-cloud/pubsub dependency')
  if (has('@aws-sdk/client-sqs')) bag.add('queue', 'Amazon SQS', 'detected', '@aws-sdk/client-sqs dependency')

  // ── External API hints (env vars naming a third-party service) ─────────────────
  const COVERED = /^(NEXT_PUBLIC_|VITE_|DATABASE_|DB_|POSTGRES_|MYSQL_|MONGODB_|PG|SUPERTOKENS_|NEXTAUTH_|AUTH_|AUTH0_|CLERK_|SENDGRID_|RESEND_|POSTMARK_|MAILGUN_|SMTP_|AWS_|AZURE_|DO_SPACES|GOOGLE_)/i
  const externalSeen = new Set<string>()
  for (const name of names) {
    const m = /^(.+?)_(API_KEY|API_URL|API_SECRET|API_TOKEN)$/i.exec(name)
    if (!m) continue
    if (COVERED.test(name)) continue
    const provider = titleCase(m[1])
    if (!provider || externalSeen.has(provider)) continue
    externalSeen.add(provider)
    bag.add('external_service', provider, 'likely', name)
    if (externalSeen.size >= 6) break
  }

  return { services: bag.values() }
}
