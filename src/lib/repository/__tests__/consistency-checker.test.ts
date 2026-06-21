import { describe, it, expect } from 'vitest'
import { checkConsistency, type ConsistencyReport, type ConsistencyCategory } from '../consistency-checker'
import { detectStack } from '../stack-detector'
import { detectEnvVars } from '../env-detector'
import { filesFrom } from './fixtures'

function run(record: Record<string, string>): ConsistencyReport {
  const files = filesFrom(record)
  return checkConsistency(files, detectStack(files), detectEnvVars(files))
}

const has = (r: ConsistencyReport, cat: ConsistencyCategory) => r.findings.some((f) => f.category === cat)
const sev = (r: ConsistencyReport, cat: ConsistencyCategory) => r.findings.find((f) => f.category === cat)?.severity

describe('checkConsistency', () => {
  it('reports a clean repository with no critical or warning findings', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { build: 'tsc', start: 'node dist' }, dependencies: {} }),
      'package-lock.json': '{}',
      '.env.example': 'FOO=',
      'index.ts': "import { util } from './util'\nconst x = process.env.FOO\nutil()\n",
      'util.ts': 'export function util() { return 1 }',
    })
    expect(r.counts.critical).toBe(0)
    expect(r.counts.warning).toBe(0)
    expect(r.score).toBeGreaterThanOrEqual(95)
  })

  it('flags a broken relative import as critical', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { start: 'node x' } }),
      'package-lock.json': '{}',
      'index.ts': "import './missing'\n",
    })
    expect(has(r, 'broken_import')).toBe(true)
    expect(sev(r, 'broken_import')).toBe('critical')
  })

  it('does not flag relative imports that resolve via index files', () => {
    const r = run({
      'index.ts': "import { thing } from './lib'\nthing()",
      'lib/index.ts': 'export function thing() {}',
    })
    expect(has(r, 'broken_import')).toBe(false)
  })

  it('does not flag tsconfig path aliases as broken or missing', () => {
    const r = run({
      'tsconfig.json': JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] } } }),
      'package.json': JSON.stringify({ name: 'demo', dependencies: {} }),
      'package-lock.json': '{}',
      'src/index.ts': "import { helper } from '@/helper'\nhelper()",
      'src/helper.ts': 'export function helper() {}',
    })
    expect(has(r, 'broken_import')).toBe(false)
    expect(has(r, 'missing_dependency')).toBe(false)
  })

  it('flags an imported package missing from dependencies as critical', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', dependencies: {} }),
      'package-lock.json': '{}',
      'index.ts': "import lp from 'left-pad'\nlp()",
    })
    expect(has(r, 'missing_dependency')).toBe(true)
    expect(sev(r, 'missing_dependency')).toBe('critical')
  })

  it('ignores node builtins for missing dependency', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', dependencies: {} }),
      'package-lock.json': '{}',
      'index.ts': "import { readFile } from 'node:fs/promises'\nimport path from 'path'\nreadFile; path",
    })
    expect(has(r, 'missing_dependency')).toBe(false)
  })

  it('flags a declared-but-unimported production dependency as info', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', dependencies: { lodash: '^4.0.0' }, scripts: {} }),
      'package-lock.json': '{}',
      'index.ts': 'export const x = 1',
    })
    expect(has(r, 'unused_dependency')).toBe(true)
    expect(sev(r, 'unused_dependency')).toBe('info')
  })

  it('detects a circular dependency as a warning', () => {
    const r = run({
      'a.ts': "import './b'\nexport const a = 1",
      'b.ts': "import './a'\nexport const b = 1",
    })
    expect(has(r, 'circular_dependency')).toBe(true)
    expect(sev(r, 'circular_dependency')).toBe('warning')
  })

  it('flags env vars used in code but missing from .env.example', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', dependencies: {} }),
      'package-lock.json': '{}',
      '.env.example': 'BAR=',
      'index.ts': 'const v = process.env.FOO',
    })
    expect(has(r, 'missing_env_var')).toBe(true)
    expect(has(r, 'unreferenced_env_example')).toBe(true) // BAR unused
  })

  it('flags a missing start script for a deployable app as critical', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'api', scripts: { build: 'tsc' }, dependencies: { express: '^4.0.0' } }),
      'package-lock.json': '{}',
    })
    expect(has(r, 'missing_script')).toBe(true)
    expect(sev(r, 'missing_script')).toBe('critical')
  })

  it('flags multiple lockfiles as a package manager warning', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { start: 'x' }, dependencies: {} }),
      'package-lock.json': '{}',
      'yarn.lock': '',
    })
    expect(has(r, 'package_manager')).toBe(true)
    expect(sev(r, 'package_manager')).toBe('warning')
  })

  it('flags a committed .env file as stale config', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { start: 'x' }, dependencies: {} }),
      'package-lock.json': '{}',
      '.env': 'SECRET=abc',
    })
    expect(has(r, 'stale_config')).toBe(true)
  })

  it('flags an orphaned module as info', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { start: 'x' }, dependencies: {} }),
      'package-lock.json': '{}',
      'index.ts': "import './used'\n",
      'used.ts': 'export const u = 1',
      'orphan.ts': 'const secret = 1',
    })
    expect(has(r, 'orphaned_module')).toBe(true)
    expect(r.findings.find((f) => f.category === 'orphaned_module')?.location).toBe('orphan.ts')
  })

  it('flags a Dockerfile package manager mismatch', () => {
    const r = run({
      'package.json': JSON.stringify({ name: 'demo', scripts: { start: 'x' }, dependencies: {} }),
      'package-lock.json': '{}',
      'Dockerfile': 'FROM node:20\nRUN yarn install\nCMD ["node", "x"]',
    })
    expect(r.findings.some((f) => f.category === 'stale_config' && /Dockerfile/i.test(f.title))).toBe(true)
  })
})
