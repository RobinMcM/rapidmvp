import type { StackResult } from './stack-detector'
import { findAppRoot } from './stack-detector'
import type { EnvVariable } from './env-detector'

// ── Public types ─────────────────────────────────────────────────────────────

export type ConsistencySeverity = 'critical' | 'warning' | 'info'

export type ConsistencyCategory =
  | 'broken_import'
  | 'missing_dependency'
  | 'unused_dependency'
  | 'orphaned_module'
  | 'unused_export'
  | 'circular_dependency'
  | 'missing_env_var'
  | 'unreferenced_env_example'
  | 'missing_script'
  | 'package_manager'
  | 'stale_config'

export type ConsistencyFinding = {
  category: ConsistencyCategory
  severity: ConsistencySeverity
  title: string
  detail: string
  location?: string
}

export type ConsistencyReport = {
  findings: ConsistencyFinding[]
  counts: { critical: number; warning: number; info: number }
  score: number // 0–100 cleanliness
  filesAnalysed: number
  partial: boolean // file map was truncated, so absence-based checks are approximate
}

// ── Constants ────────────────────────────────────────────────────────────────

const JS_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
const JS_EXT_SET = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'])
const MAX_FILES_HINT = 400 // mirror of zip-reader's MAX_SOURCE_FILES budget

// Skip resolving relative imports that target non-JS assets we never load.
const NON_JS_IMPORT_EXT = /\.(css|scss|sass|less|json|svg|png|jpe?g|gif|webp|md|graphql|gql|wasm|txt|yml|yaml|html)$/i

const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain', 'events', 'fs', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process',
  'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys',
  'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib',
])

// Production deps that are commonly used indirectly (config, CLI, peer runtime),
// so we never flag them as "unused".
const INDIRECT_DEPS = new Set([
  'typescript', 'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'less',
  'eslint', 'prettier', 'dotenv', 'dotenv-cli', 'ts-node', 'tsx', 'nodemon',
  'concurrently', 'rimraf', 'cross-env', 'npm-run-all', 'husky', 'lint-staged',
  'prisma', '@prisma/client', 'sharp', 'pino-pretty', 'source-map-support',
])

// Files that are entrypoints by convention — never "orphaned".
function isEntrypoint(path: string): boolean {
  const f = path.split('/').pop() ?? ''
  if (/^(index|main|server|app|middleware|instrumentation|layout|page|route|loading|error|not-found|template|default|head|sitemap|robots|opengraph-image|icon|manifest)\.[cm]?[jt]sx?$/.test(f)) return true
  if (/\.config\.[cm]?[jt]s$/.test(f)) return true
  if (/\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(f)) return true
  if (/\.d\.ts$/.test(f)) return true
  // Next.js app/ and pages/ routing dirs are convention-driven entrypoints
  if (/(^|\/)app\//.test(path) || /(^|\/)pages\//.test(path)) return true
  return false
}

// ── Small helpers ────────────────────────────────────────────────────────────

function parseJsonSafe(text: string): Record<string, unknown> | null {
  try { return JSON.parse(text) as Record<string, unknown> } catch { return null }
}

function dirname(p: string): string {
  const i = p.lastIndexOf('/')
  return i === -1 ? '' : p.slice(0, i)
}

function normalizePath(p: string): string {
  const out: string[] = []
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return out.join('/')
}

function packageName(spec: string): string {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/')
  return spec.split('/')[0]
}

function isBuiltin(spec: string): boolean {
  if (spec.startsWith('node:')) return true
  return NODE_BUILTINS.has(spec.split('/')[0])
}

const SOURCE_FILE = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase()
  return !!ext && JS_EXT_SET.has(ext)
}

// Extract every import/require/dynamic-import specifier from a source file.
function extractSpecifiers(src: string): string[] {
  const specs: string[] = []
  const re = /(?:import|export)\s+(?:[^'"();]*?\sfrom\s+)?['"]([^'"]+)['"]/g
  const reqRe = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g
  const dynRe = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g
  for (const m of src.matchAll(re)) specs.push(m[1])
  for (const m of src.matchAll(reqRe)) specs.push(m[1])
  for (const m of src.matchAll(dynRe)) specs.push(m[1])
  return specs
}

// Extract named imported identifiers (original export names) from a source file.
function extractNamedImports(src: string): Set<string> {
  const names = new Set<string>()
  const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
  const reExport = /export\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g
  for (const m of [...src.matchAll(re), ...src.matchAll(reExport)]) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim().replace(/^type\s+/, '')
      if (name) names.add(name)
    }
  }
  return names
}

// Extract named exports declared in a file.
function extractNamedExports(src: string): string[] {
  const names: string[] = []
  const declRe = /export\s+(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g
  for (const m of src.matchAll(declRe)) names.push(m[1])
  const listRe = /export\s+\{([^}]+)\}(?!\s+from)/g
  for (const m of src.matchAll(listRe)) {
    for (const part of m[1].split(',')) {
      const aliased = part.trim().split(/\s+as\s+/)
      const exported = (aliased[1] ?? aliased[0]).trim().replace(/^type\s+/, '')
      if (exported && exported !== 'default') names.push(exported)
    }
  }
  return names
}

// ── tsconfig path aliases ────────────────────────────────────────────────────

type AliasRule = { prefix: string; targets: string[] }

function loadAliases(files: Map<string, string>): { rules: AliasRule[]; baseUrl: string } {
  const rules: AliasRule[] = []
  let baseUrl = ''
  const raw = files.get('tsconfig.json') ?? files.get('jsconfig.json')
  if (raw) {
    // Tolerate comments / trailing commas
    const cleaned = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/,(\s*[}\]])/g, '$1')
    const cfg = parseJsonSafe(cleaned)
    const co = (cfg?.compilerOptions as Record<string, unknown>) ?? {}
    if (typeof co.baseUrl === 'string') baseUrl = normalizePath(co.baseUrl.replace(/^\.\//, ''))
    const paths = (co.paths as Record<string, string[]>) ?? {}
    for (const [key, vals] of Object.entries(paths)) {
      const prefix = key.replace(/\*$/, '')
      const targets = (vals ?? []).map((v) => normalizePath((baseUrl ? baseUrl + '/' : '') + v.replace(/^\.\//, '').replace(/\*$/, '')))
      rules.push({ prefix, targets })
    }
  }
  // Common conventions even without tsconfig paths (empty npm scope ⇒ not a package)
  if (!rules.some((r) => r.prefix === '@/')) rules.push({ prefix: '@/', targets: [baseUrl || '', 'src', '.'].filter((v, i, a) => a.indexOf(v) === i) })
  if (!rules.some((r) => r.prefix === '~/')) rules.push({ prefix: '~/', targets: [baseUrl || '', 'src', '.'].filter((v, i, a) => a.indexOf(v) === i) })
  return { rules, baseUrl }
}

function matchAlias(spec: string, rules: AliasRule[]): string[] | null {
  for (const rule of rules) {
    if (rule.prefix && spec.startsWith(rule.prefix)) {
      const rest = spec.slice(rule.prefix.length)
      return rule.targets.map((t) => normalizePath((t ? t + '/' : '') + rest))
    }
  }
  return null
}

function resolveCandidate(base: string, fileSet: Set<string>): string | null {
  const candidates = [base, ...JS_EXTS.map((e) => base + e), ...JS_EXTS.map((e) => base + '/index' + e)]
  for (const c of candidates) if (fileSet.has(normalizePath(c))) return normalizePath(c)
  return null
}

// ── Main check ───────────────────────────────────────────────────────────────

export function checkConsistency(
  files: Map<string, string>,
  stack: StackResult,
  _envVars: EnvVariable[]
): ConsistencyReport {
  const findings: ConsistencyFinding[] = []
  const fileSet = new Set(files.keys())
  const partial = files.size >= MAX_FILES_HINT

  const sourceFiles = [...files.keys()].filter((p) => SOURCE_FILE(p) && (files.get(p)?.length ?? 0) > 0)
  const { rules: aliasRules } = loadAliases(files)

  const appRoot = findAppRoot(files)
  const pkg = parseJsonSafe(files.get(appRoot + 'package.json') ?? '')
  const deps: Record<string, string> = {
    ...((pkg?.dependencies as Record<string, string>) ?? {}),
    ...((pkg?.devDependencies as Record<string, string>) ?? {}),
    ...((pkg?.peerDependencies as Record<string, string>) ?? {}),
    ...((pkg?.optionalDependencies as Record<string, string>) ?? {}),
  }
  const prodDeps: Record<string, string> = (pkg?.dependencies as Record<string, string>) ?? {}

  // ── Build the internal import graph + collect package/named usage ──────────
  const graph = new Map<string, Set<string>>() // file → internal targets
  const importedInternal = new Set<string>() // files imported by some other file
  const usedPackages = new Set<string>()
  const namedImportsAll = new Set<string>()

  for (const file of sourceFiles) {
    const src = files.get(file) ?? ''
    graph.set(file, new Set())
    for (const name of extractNamedImports(src)) namedImportsAll.add(name)

    for (const spec of extractSpecifiers(src)) {
      if (isBuiltin(spec)) continue

      if (spec.startsWith('.')) {
        // Relative import
        if (NON_JS_IMPORT_EXT.test(spec)) continue
        const resolved = resolveCandidate(normalizePath((dirname(file) ? dirname(file) + '/' : '') + spec), fileSet)
        if (resolved) {
          graph.get(file)!.add(resolved)
          importedInternal.add(resolved)
        } else {
          findings.push({
            category: 'broken_import',
            severity: partial ? 'warning' : 'critical',
            title: 'Broken relative import',
            detail: `'${spec}' does not resolve to a file in the repository${partial ? ' (analysis was partial — verify manually)' : ''}.`,
            location: file,
          })
        }
        continue
      }

      const aliasTargets = matchAlias(spec, aliasRules)
      if (aliasTargets) {
        let resolved: string | null = null
        for (const t of aliasTargets) {
          resolved = resolveCandidate(t, fileSet)
          if (resolved) break
        }
        if (resolved) {
          graph.get(file)!.add(resolved)
          importedInternal.add(resolved)
        }
        // Unresolved aliases are not flagged: alias roots are often outside the
        // scanned file set and would produce false positives.
        continue
      }

      // Bare package import
      if (NON_JS_IMPORT_EXT.test(spec)) continue
      const name = packageName(spec)
      usedPackages.add(name)
      if (stack.language === 'nodejs' && pkg && !(name in deps) && !name.startsWith('@types/')) {
        findings.push({
          category: 'missing_dependency',
          severity: 'critical',
          title: 'Missing dependency',
          detail: `'${name}' is imported but is not declared in package.json dependencies.`,
          location: file,
        })
      }
    }
  }

  // ── Unused dependencies (prod only, conservative, info) ────────────────────
  if (pkg && !partial) {
    for (const name of Object.keys(prodDeps)) {
      if (INDIRECT_DEPS.has(name)) continue
      if (name.startsWith('@types/')) continue
      if (usedPackages.has(name)) continue
      // referenced by name in any config/source text (covers plugins, etc.),
      // but ignore the manifest/lockfiles where the name always appears.
      let referenced = false
      for (const [fname, src] of files) {
        const base = fname.split('/').pop() ?? ''
        if (base === 'package.json' || base === 'yarn.lock' || base === 'package-lock.json' || base === 'pnpm-lock.yaml') continue
        if (src && src.includes(name)) { referenced = true; break }
      }
      if (referenced) continue
      findings.push({
        category: 'unused_dependency',
        severity: 'info',
        title: 'Possibly unused dependency',
        detail: `'${name}' is listed in dependencies but no import or reference was found.`,
        location: 'package.json',
      })
    }
  }

  // ── Orphaned modules (info) ────────────────────────────────────────────────
  if (!partial) {
    for (const file of sourceFiles) {
      if (importedInternal.has(file)) continue
      if (isEntrypoint(file)) continue
      findings.push({
        category: 'orphaned_module',
        severity: 'info',
        title: 'Orphaned module',
        detail: 'This source file is not imported by any other module and is not a recognised entrypoint.',
        location: file,
      })
    }
  }

  // ── Unused exports (info, heavily guarded) ─────────────────────────────────
  if (!partial) {
    let reported = 0
    for (const file of sourceFiles) {
      if (reported >= 25) break
      if (isEntrypoint(file)) continue
      const exports = extractNamedExports(files.get(file) ?? '')
      for (const name of exports) {
        if (reported >= 25) break
        if (!namedImportsAll.has(name)) {
          findings.push({
            category: 'unused_export',
            severity: 'info',
            title: 'Unused export',
            detail: `Exported '${name}' is never imported by name elsewhere in the repository.`,
            location: file,
          })
          reported++
        }
      }
    }
  }

  // ── Circular dependencies (warning) ────────────────────────────────────────
  findings.push(...detectCycles(graph))

  // ── Environment variable consistency ───────────────────────────────────────
  findings.push(...checkEnv(files))

  // ── Scripts ────────────────────────────────────────────────────────────────
  if (pkg) {
    const scripts = (pkg.scripts as Record<string, string>) ?? {}
    const deployable = stack.appType === 'api' || stack.appType === 'fullstack' || stack.appType === 'web'
    if (!scripts.start && !stack.hasDockerfile && deployable) {
      findings.push({
        category: 'missing_script',
        severity: 'critical',
        title: 'Missing start script',
        detail: 'package.json has no "start" script and no Dockerfile — Azure App Service needs a start command.',
        location: 'package.json',
      })
    }
    if (!scripts.build && stack.language === 'nodejs' && stack.framework !== 'unknown' && stack.framework !== 'express' && stack.framework !== 'fastify') {
      findings.push({
        category: 'missing_script',
        severity: 'warning',
        title: 'Missing build script',
        detail: `No "build" script found for a ${stack.framework} project — confirm how production assets are produced.`,
        location: 'package.json',
      })
    }
  }

  // ── Package manager consistency ────────────────────────────────────────────
  findings.push(...checkPackageManager(files, pkg))

  // ── Stale Docker / config files ────────────────────────────────────────────
  findings.push(...checkStaleConfig(files, stack))

  // ── Tally + score ──────────────────────────────────────────────────────────
  const counts = { critical: 0, warning: 0, info: 0 }
  for (const f of findings) counts[f.severity]++
  const score = Math.max(0, Math.min(100, 100 - counts.critical * 15 - counts.warning * 5 - counts.info * 1))

  return { findings, counts, score, filesAnalysed: sourceFiles.length, partial }
}

// ── Cycle detection (Tarjan-lite DFS) ────────────────────────────────────────

function detectCycles(graph: Map<string, Set<string>>): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = []
  const seenCycles = new Set<string>()
  const state = new Map<string, number>() // 0=unvisited,1=in-stack,2=done
  const stack: string[] = []

  function dfs(node: string) {
    state.set(node, 1)
    stack.push(node)
    for (const next of graph.get(node) ?? []) {
      const s = state.get(next) ?? 0
      if (s === 0) {
        dfs(next)
      } else if (s === 1) {
        // Found a cycle: slice the stack from `next` to current
        const idx = stack.indexOf(next)
        if (idx !== -1) {
          const cycle = stack.slice(idx)
          const key = [...cycle].sort().join('|')
          if (!seenCycles.has(key) && seenCycles.size < 15) {
            seenCycles.add(key)
            findings.push({
              category: 'circular_dependency',
              severity: 'warning',
              title: 'Circular dependency',
              detail: `Import cycle: ${[...cycle, next].join(' → ')}`,
              location: cycle[0],
            })
          }
        }
      }
    }
    stack.pop()
    state.set(node, 2)
  }

  for (const node of graph.keys()) {
    if ((state.get(node) ?? 0) === 0) dfs(node)
  }
  return findings
}

// ── Environment variable checks ──────────────────────────────────────────────

function parseEnvNames(raw: string): string[] {
  const names: string[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const name = t.slice(0, eq).trim().replace(/^export\s+/, '')
    if (/^[A-Z_][A-Z0-9_]*$/i.test(name)) names.push(name)
  }
  return names
}

function checkEnv(files: Map<string, string>): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = []
  const exampleNames = ['.env.example', '.env.local.example', '.env.sample', '.env.template', '.env.defaults']
  const hasExample = exampleNames.some((f) => files.has(f))

  const inExample = new Set<string>()
  for (const f of exampleNames) {
    const raw = files.get(f)
    if (raw) for (const n of parseEnvNames(raw)) inExample.add(n)
  }
  const inDotenv = new Set<string>(files.get('.env') ? parseEnvNames(files.get('.env')!) : [])

  // Names referenced in code (process.env / import.meta.env, dot + bracket)
  const inCode = new Set<string>()
  const referencedAnywhere = new Set<string>()
  const CODE_RES = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\]/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
  ]
  const INTERP_RE = /\$\{?([A-Z_][A-Z0-9_]*)\}?/g
  for (const [name, src] of files) {
    if (!src) continue
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext && JS_EXT_SET.has(ext)) {
      for (const re of CODE_RES) for (const m of src.matchAll(re)) { inCode.add(m[1]); referencedAnywhere.add(m[1]) }
    }
    // ${VAR} interpolation in compose / config / infra counts as a reference
    if (!name.startsWith('.env')) {
      for (const m of src.matchAll(INTERP_RE)) referencedAnywhere.add(m[1])
    }
  }
  for (const n of inCode) referencedAnywhere.add(n)

  const IGNORE = new Set(['NODE_ENV', 'PORT', 'PATH', 'HOME', 'PWD', 'USER', 'CI', 'TZ'])

  // Referenced in code but missing from .env.example (engineer won't know to set it)
  if (hasExample) {
    for (const name of inCode) {
      if (IGNORE.has(name)) continue
      if (!inExample.has(name) && !inDotenv.has(name)) {
        findings.push({
          category: 'missing_env_var',
          severity: 'warning',
          title: 'Env var missing from .env.example',
          detail: `'${name}' is read in code but not documented in .env.example — infrastructure engineers may not know to configure it.`,
          location: '.env.example',
        })
      }
    }
  }

  // .env.example variables not referenced anywhere
  for (const name of inExample) {
    if (IGNORE.has(name)) continue
    if (!referencedAnywhere.has(name)) {
      findings.push({
        category: 'unreferenced_env_example',
        severity: 'info',
        title: 'Unused .env.example variable',
        detail: `'${name}' is declared in .env.example but is never referenced in the code or configuration.`,
        location: '.env.example',
      })
    }
  }

  return findings
}

// ── Package manager consistency ──────────────────────────────────────────────

function checkPackageManager(files: Map<string, string>, pkg: Record<string, unknown> | null): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = []
  const lockfiles: { file: string; pm: string }[] = []
  if (files.has('package-lock.json')) lockfiles.push({ file: 'package-lock.json', pm: 'npm' })
  if (files.has('yarn.lock')) lockfiles.push({ file: 'yarn.lock', pm: 'yarn' })
  if (files.has('pnpm-lock.yaml')) lockfiles.push({ file: 'pnpm-lock.yaml', pm: 'pnpm' })

  if (lockfiles.length > 1) {
    findings.push({
      category: 'package_manager',
      severity: 'warning',
      title: 'Multiple lockfiles present',
      detail: `Found ${lockfiles.map((l) => l.file).join(', ')}. Mixed lockfiles cause non-deterministic installs — keep only one package manager.`,
      location: lockfiles.map((l) => l.file).join(', '),
    })
  }

  if (pkg && typeof pkg.packageManager === 'string' && lockfiles.length >= 1) {
    const declared = (pkg.packageManager as string).split('@')[0]
    if (!lockfiles.some((l) => l.pm === declared)) {
      findings.push({
        category: 'package_manager',
        severity: 'warning',
        title: 'packageManager field mismatch',
        detail: `package.json declares "${pkg.packageManager}" but the lockfile is ${lockfiles.map((l) => l.pm).join(', ')}.`,
        location: 'package.json',
      })
    }
  }

  if (lockfiles.length >= 1 && !files.has('package.json')) {
    findings.push({
      category: 'package_manager',
      severity: 'warning',
      title: 'Lockfile without package.json',
      detail: `A lockfile (${lockfiles[0].file}) is present but package.json is missing.`,
      location: lockfiles[0].file,
    })
  }

  return findings
}

// ── Stale Docker / config files ──────────────────────────────────────────────

function checkStaleConfig(files: Map<string, string>, stack: StackResult): ConsistencyFinding[] {
  const findings: ConsistencyFinding[] = []

  // .env committed into the repository
  if (files.has('.env')) {
    findings.push({
      category: 'stale_config',
      severity: 'warning',
      title: '.env committed to repository',
      detail: 'A .env file is present in the uploaded repository. Verify it is gitignored and contains no live secrets before installing into Azure.',
      location: '.env',
    })
  }

  // Dockerfile package manager vs lockfile mismatch
  const dockerfile = files.get('Dockerfile') ?? files.get('dockerfile')
  if (dockerfile) {
    const usesYarn = /\byarn(\s+install|\s+--|\s|$)/m.test(dockerfile)
    const usesPnpm = /\bpnpm\b/.test(dockerfile)
    const usesNpm = /\bnpm\s+(ci|install|i)\b/.test(dockerfile)
    if (usesYarn && stack.packageManager === 'npm' && files.has('package-lock.json')) {
      findings.push(staleDocker('Dockerfile uses yarn but the repository has a package-lock.json (npm).'))
    } else if (usesNpm && stack.packageManager === 'yarn' && files.has('yarn.lock')) {
      findings.push(staleDocker('Dockerfile uses npm but the repository has a yarn.lock (yarn).'))
    } else if (usesNpm && stack.packageManager === 'pnpm' && files.has('pnpm-lock.yaml')) {
      findings.push(staleDocker('Dockerfile uses npm but the repository has a pnpm-lock.yaml (pnpm).'))
    } else if (usesPnpm && stack.packageManager === 'npm' && files.has('package-lock.json')) {
      findings.push(staleDocker('Dockerfile uses pnpm but the repository has a package-lock.json (npm).'))
    }
  }

  // docker-compose env_file referencing files not in the repo
  const compose = files.get('docker-compose.yml') ?? files.get('docker-compose.yaml')
  if (compose) {
    for (const m of compose.matchAll(/env_file:\s*(?:\n\s*-\s*(.+)|(.+))/g)) {
      const ref = (m[1] ?? m[2] ?? '').trim().replace(/^['"]|['"]$/g, '')
      if (!ref) continue
      const norm = normalizePath(ref.replace(/^\.\//, ''))
      if (!files.has(norm) && !norm.includes('*')) {
        findings.push({
          category: 'stale_config',
          severity: 'info',
          title: 'docker-compose env_file missing',
          detail: `docker-compose references env_file '${ref}' which is not present in the repository.`,
          location: 'docker-compose.yml',
        })
      }
    }
  }

  // tsconfig extends a base config that is absent
  const tsconfig = files.get('tsconfig.json')
  if (tsconfig) {
    const m = tsconfig.match(/"extends"\s*:\s*"([^"]+)"/)
    if (m && m[1].startsWith('.')) {
      const target = normalizePath(m[1].replace(/^\.\//, ''))
      if (!files.has(target) && !files.has(target + '.json')) {
        findings.push({
          category: 'stale_config',
          severity: 'info',
          title: 'tsconfig extends missing base',
          detail: `tsconfig.json extends '${m[1]}' which was not found in the repository.`,
          location: 'tsconfig.json',
        })
      }
    }
  }

  return findings
}

function staleDocker(detail: string): ConsistencyFinding {
  return { category: 'stale_config', severity: 'warning', title: 'Stale Dockerfile', detail, location: 'Dockerfile' }
}
