import { describe, it, expect } from 'vitest'
import { assessAzureReadiness } from '../azure-assessor'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { filesFrom, nextjsPrismaRepo, expressApiRepo } from './fixtures'

function assess(files: Map<string, string>) {
  return assessAzureReadiness(detectStack(files), detectEnvVars(files), files)
}

const serviceNames = (a: ReturnType<typeof assess>) => a.services.map((s) => s.name)
const scriptTypes = (a: ReturnType<typeof assess>) => a.buildScripts.map((s) => s.scriptType)

describe('assessAzureReadiness', () => {
  it('always recommends App Service and Application Insights', () => {
    const a = assess(nextjsPrismaRepo())
    expect(serviceNames(a)).toContain('Azure App Service')
    expect(serviceNames(a)).toContain('Application Insights')
  })

  it('recommends PostgreSQL when a database is detected', () => {
    const a = assess(nextjsPrismaRepo())
    expect(serviceNames(a)).toContain('Azure Database for PostgreSQL Flexible Server')
  })

  it('recommends Key Vault and raises a risk when secrets are present', () => {
    const a = assess(nextjsPrismaRepo())
    expect(serviceNames(a)).toContain('Azure Key Vault')
    expect(a.risks.join(' ')).toMatch(/secret/i)
  })

  it('generates a Prisma migration asset when Prisma is detected', () => {
    const a = assess(nextjsPrismaRepo())
    expect(scriptTypes(a)).toContain('DatabaseMigration')
  })

  it('always generates App Service config and GitHub Actions assets', () => {
    const a = assess(nextjsPrismaRepo())
    expect(scriptTypes(a)).toContain('AzureAppServiceDeploy')
    expect(scriptTypes(a)).toContain('GithubActionsDeploy')
  })

  it('blocks when no production start command and no Dockerfile exist', () => {
    const a = assess(expressApiRepo())
    expect(a.blockers.join(' ')).toMatch(/start command/i)
    expect(a.azureReadinessScore).toBeLessThan(100)
  })

  it('raises a critical finding when a .env file is committed', () => {
    const a = assess(filesFrom({ 'package.json': JSON.stringify({ scripts: { start: 'node x' } }), '.env': 'SECRET=abc' }))
    const critical = a.governanceFindings.find((f) => f.severity === 'critical' && /\.env/.test(f.finding))
    expect(critical).toBeTruthy()
  })

  it('marks an undetectable repo as unsupported', () => {
    const a = assess(filesFrom({ 'README.md': '# hi' }))
    expect(a.suitability).toBe('unsupported')
    expect(a.blockers.length).toBeGreaterThan(0)
  })

  it('keeps the readiness score within 0..100', () => {
    const a = assess(filesFrom({ 'README.md': '# nothing useful', '.env': 'X=1' }))
    expect(a.azureReadinessScore).toBeGreaterThanOrEqual(0)
    expect(a.azureReadinessScore).toBeLessThanOrEqual(100)
  })

  // ── Security invariant ──────────────────────────────────────────────────────
  it('references secrets via Key Vault and never embeds a raw secret value', () => {
    const a = assess(filesFrom({
      'package.json': JSON.stringify({ scripts: { build: 'next build', start: 'next start' }, dependencies: { next: '^15' } }),
      '.env': 'SESSION_SECRET=sk_live_REAL_VALUE_DO_NOT_LEAK',
    }))
    const allScripts = a.buildScripts.map((s) => s.content).join('\n')
    expect(allScripts).not.toContain('sk_live_REAL_VALUE_DO_NOT_LEAK')
    expect(allScripts).toMatch(/@Microsoft\.KeyVault/)
  })
})
