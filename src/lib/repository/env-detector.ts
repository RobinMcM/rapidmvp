export type EnvClassification = 'required' | 'optional' | 'public' | 'secret' | 'unknown'

export type EnvVariable = {
  name: string
  classification: EnvClassification
  hasValue: boolean   // true if a non-empty value was seen in .env (we never store the value itself)
  source: string      // which file first declared this variable
}

// Priority order for upgrading classification
const CLASS_PRIORITY: EnvClassification[] = ['required', 'secret', 'public', 'optional', 'unknown']

function classRank(c: EnvClassification): number {
  return CLASS_PRIORITY.indexOf(c)
}

const SECRET_RE = /(_SECRET|_PASSWORD|_PRIVATE|_SIGNING_KEY|_API_KEY|_AUTH_TOKEN|_ACCESS_TOKEN|_REFRESH_TOKEN|_CLIENT_SECRET|_DB_PASS|_PRIVATE_KEY)$/i
const PUBLIC_RE = /^NEXT_PUBLIC_|^VITE_|^PUBLIC_|^NUXT_PUBLIC_/

function classify(name: string, fromExample: boolean): EnvClassification {
  if (PUBLIC_RE.test(name)) return 'public'
  if (SECRET_RE.test(name)) return 'secret'
  if (fromExample) return 'required'
  return 'unknown'
}

function parseEnvFile(raw: string): Array<{ name: string; hasValue: boolean }> {
  const vars: Array<{ name: string; hasValue: boolean }> = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const name = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (/^[A-Z_][A-Z0-9_]*$/i.test(name)) {
      vars.push({ name, hasValue: value.length > 0 && value !== '""' && value !== "''" })
    }
  }
  return vars
}

/**
 * Detects environment variables from all files in the repository.
 * Classifies each variable. Never stores or returns actual secret values.
 */
export function detectEnvVars(files: Map<string, string>): EnvVariable[] {
  const seen = new Map<string, EnvVariable>()

  function add(name: string, classification: EnvClassification, hasValue: boolean, source: string) {
    const existing = seen.get(name)
    if (existing) {
      // Upgrade classification if higher priority; update hasValue
      if (classRank(classification) < classRank(existing.classification)) {
        seen.set(name, { name, classification, hasValue: existing.hasValue || hasValue, source: existing.source })
      } else {
        seen.set(name, { ...existing, hasValue: existing.hasValue || hasValue })
      }
    } else {
      seen.set(name, { name, classification, hasValue, source })
    }
  }

  // ── 1. Example files → 'required' unless pattern overrides ─────────────────
  const exampleFiles = ['.env.example', '.env.local.example', '.env.sample', '.env.template', '.env.defaults']
  for (const fname of exampleFiles) {
    const raw = files.get(fname)
    if (!raw) continue
    for (const { name, hasValue } of parseEnvFile(raw)) {
      add(name, classify(name, true), hasValue, fname)
    }
  }

  // ── 2. .env → key names only, never store values; presence implies required ─
  const dotenv = files.get('.env')
  if (dotenv) {
    for (const { name } of parseEnvFile(dotenv)) {
      const cls = classify(name, false)
      // Treat .env keys as required (they're configured in the real env)
      add(name, cls === 'unknown' ? 'required' : cls, false, '.env')
    }
  }

  // ── 3. Source files — process.env.X and import.meta.env.X ─────────────────
  const PROCESS_ENV_RE = /process\.env\.([A-Z_][A-Z0-9_]*)/g
  const IMPORT_META_RE = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g
  const SOURCE_EXTS = new Set(['ts', 'tsx', 'js', 'mjs', 'jsx', 'cjs'])

  for (const [filename, raw] of files) {
    if (!raw) continue
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext || !SOURCE_EXTS.has(ext)) continue

    for (const m of raw.matchAll(PROCESS_ENV_RE)) {
      const name = m[1]
      // Skip internal Node.js env vars
      if (['NODE_ENV', 'PATH', 'HOME', 'PWD', 'USER'].includes(name)) continue
      add(name, classify(name, false), false, filename)
    }
    for (const m of raw.matchAll(IMPORT_META_RE)) {
      add(m[1], classify(m[1], false), false, filename)
    }
  }

  // ── 4. Docker Compose environment blocks ───────────────────────────────────
  const composeRaw = files.get('docker-compose.yml') ?? files.get('docker-compose.yaml') ?? ''
  if (composeRaw) {
    // Match lines like:   - KEY=VALUE  or  KEY: value  in environment: blocks
    const COMPOSE_VAR_RE = /^\s+[-\s]*([A-Z_][A-Z0-9_]*)(?:=|:)/gm
    for (const m of composeRaw.matchAll(COMPOSE_VAR_RE)) {
      const name = m[1]
      if (/^[A-Z_][A-Z0-9_]*$/.test(name)) {
        add(name, classify(name, false), false, 'docker-compose.yml')
      }
    }
  }

  // ── Sort: required → public → secret → optional → unknown ─────────────────
  return [...seen.values()].sort((a, b) => classRank(a.classification) - classRank(b.classification))
}
