import { describe, it, expect } from 'vitest'
import { detectEnvVars } from '../env-detector'
import { filesFrom } from './fixtures'

function byName(vars: ReturnType<typeof detectEnvVars>, name: string) {
  return vars.find((v) => v.name === name)
}

describe('detectEnvVars', () => {
  it('classifies variables from an example file as required', () => {
    const vars = detectEnvVars(filesFrom({ '.env.example': 'PORT=\nAPP_NAME=' }))
    expect(byName(vars, 'PORT')?.classification).toBe('required')
    expect(byName(vars, 'APP_NAME')?.classification).toBe('required')
  })

  it('classifies secret-pattern names as secret', () => {
    const vars = detectEnvVars(filesFrom({ '.env.example': 'SESSION_SECRET=\nJWT_SIGNING_KEY=\nDB_PASSWORD=\nGITHUB_CLIENT_SECRET=' }))
    expect(byName(vars, 'SESSION_SECRET')?.classification).toBe('secret')
    expect(byName(vars, 'JWT_SIGNING_KEY')?.classification).toBe('secret')
    expect(byName(vars, 'DB_PASSWORD')?.classification).toBe('secret')
    expect(byName(vars, 'GITHUB_CLIENT_SECRET')?.classification).toBe('secret')
  })

  // KNOWN GAP (documented in docs/phase-0-test-strategy.md): SECRET_RE does not match
  // names ending in _SECRET_KEY (e.g. STRIPE_SECRET_KEY), so they fall through to
  // 'required'. Locked here so that hardening the classifier later is a deliberate,
  // visible change rather than a silent one.
  it('KNOWN GAP: *_SECRET_KEY is currently classified required, not secret', () => {
    const vars = detectEnvVars(filesFrom({ '.env.example': 'STRIPE_SECRET_KEY=' }))
    expect(byName(vars, 'STRIPE_SECRET_KEY')?.classification).toBe('required')
  })

  it('classifies public-prefixed names as public', () => {
    const vars = detectEnvVars(filesFrom({ '.env.example': 'NEXT_PUBLIC_APP_URL=\nVITE_API_BASE=' }))
    expect(byName(vars, 'NEXT_PUBLIC_APP_URL')?.classification).toBe('public')
    expect(byName(vars, 'VITE_API_BASE')?.classification).toBe('public')
  })

  it('discovers variables referenced in source files', () => {
    const vars = detectEnvVars(filesFrom({ 'src/app.ts': 'if (process.env.MY_FEATURE_FLAG) {}' }))
    expect(byName(vars, 'MY_FEATURE_FLAG')).toBeTruthy()
  })

  it('ignores internal Node runtime variables', () => {
    const vars = detectEnvVars(filesFrom({ 'src/app.ts': 'process.env.NODE_ENV; process.env.PATH; process.env.HOME' }))
    expect(byName(vars, 'NODE_ENV')).toBeUndefined()
    expect(byName(vars, 'PATH')).toBeUndefined()
  })

  it('discovers variables from a docker-compose environment block', () => {
    const vars = detectEnvVars(filesFrom({
      'docker-compose.yml': 'services:\n  web:\n    environment:\n      - REDIS_URL=redis://x\n      DATABASE_HOST: db',
    }))
    expect(byName(vars, 'REDIS_URL')).toBeTruthy()
    expect(byName(vars, 'DATABASE_HOST')).toBeTruthy()
  })

  it('upgrades classification when a stronger signal appears', () => {
    // Seen first as a plain source reference (unknown), then matched by the secret pattern.
    const vars = detectEnvVars(filesFrom({
      'src/a.ts': 'process.env.SERVICE_API_KEY',
      '.env.example': 'SERVICE_API_KEY=',
    }))
    expect(byName(vars, 'SERVICE_API_KEY')?.classification).toBe('secret')
  })

  // ── Security invariant ──────────────────────────────────────────────────────
  it('NEVER stores or returns actual secret values', () => {
    const vars = detectEnvVars(filesFrom({
      '.env': 'API_SECRET=sk_live_THIS_IS_A_REAL_SECRET\nDATABASE_URL=postgres://user:p4ssw0rd@host/db',
    }))
    const serialised = JSON.stringify(vars)
    expect(serialised).not.toContain('sk_live_THIS_IS_A_REAL_SECRET')
    expect(serialised).not.toContain('p4ssw0rd')

    // Output objects expose only safe metadata keys — never a value field.
    for (const v of vars) {
      expect(Object.keys(v).sort()).toEqual(['classification', 'hasValue', 'name', 'source'])
    }
  })
})
