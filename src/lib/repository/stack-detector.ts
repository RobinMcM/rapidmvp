export type StackResult = {
  language: string       // 'nodejs' | 'python' | 'go' | 'java' | 'ruby' | 'unknown'
  framework: string      // 'nextjs' | 'vite' | 'express' | 'fastify' | 'nestjs' | 'hono' | 'flask' | 'fastapi' | 'django' | 'gin' | 'echo' | 'spring-boot' | 'unknown'
  packageManager: string // 'npm' | 'pnpm' | 'yarn' | 'pip' | 'poetry' | 'unknown'
  hasDockerfile: boolean
  hasDockerCompose: boolean
  buildCommand: string | null
  startCommand: string | null
  appType: string        // 'fullstack' | 'api' | 'web' | 'cli' | 'unknown'
  nodeVersion: string | null
  hasPrisma: boolean
  hasDatabase: boolean   // any DB driver detected in deps
}

function hasFile(files: Map<string, string>, name: string): boolean {
  return files.has(name)
}

function content(files: Map<string, string>, name: string): string {
  return files.get(name) ?? ''
}

// Locate the application root. Usually '' (repo root), but handles repos where
// the app (and its package.json / manifest) lives in a subdirectory.
const MANIFEST_NAMES = ['package.json', 'requirements.txt', 'pyproject.toml', 'Pipfile', 'go.mod', 'pom.xml', 'build.gradle']

export function findAppRoot(files: Map<string, string>): string {
  for (const m of MANIFEST_NAMES) {
    if (files.has(m)) return '' // a manifest at repo root wins
  }
  let bestPrefix: string | null = null
  let bestDepth = Infinity
  for (const key of files.keys()) {
    const filename = key.split('/').pop() ?? ''
    if (!MANIFEST_NAMES.includes(filename)) continue
    const depth = key.split('/').length
    if (depth < bestDepth) {
      bestDepth = depth
      bestPrefix = key.slice(0, key.length - filename.length) // keeps trailing '/'
    }
  }
  return bestPrefix ?? ''
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return null
  }
}

function getDeps(pkg: Record<string, unknown>): Record<string, string> {
  return {
    ...((pkg.dependencies as Record<string, string>) ?? {}),
    ...((pkg.devDependencies as Record<string, string>) ?? {}),
  }
}

function hasDep(deps: Record<string, string>, ...names: string[]): boolean {
  return names.some((n) => n in deps)
}

export function detectStack(files: Map<string, string>): StackResult {
  let language = 'unknown'
  let framework = 'unknown'
  let packageManager = 'unknown'
  let buildCommand: string | null = null
  let startCommand: string | null = null
  let nodeVersion: string | null = null
  let hasPrisma = false
  let hasDatabase = false
  let appType = 'unknown'

  // Resolve the app root so subdirectory projects (monorepos) are detected.
  const root = findAppRoot(files)
  const has = (name: string) => hasFile(files, root + name) || (root !== '' && hasFile(files, name))
  const get = (name: string) => {
    const scoped = content(files, root + name)
    return scoped || (root !== '' ? content(files, name) : '')
  }

  // ── Package manager (Node ecosystem) ───────────────────────────────────────
  if (has('yarn.lock')) packageManager = 'yarn'
  else if (has('pnpm-lock.yaml')) packageManager = 'pnpm'
  else if (has('package-lock.json')) packageManager = 'npm'

  // ── Node.js ────────────────────────────────────────────────────────────────
  if (has('package.json')) {
    language = 'nodejs'
    const pkg = parseJson(get('package.json'))

    if (pkg) {
      const scripts = (pkg.scripts as Record<string, string>) ?? {}
      buildCommand = scripts.build ?? null
      startCommand = scripts.start ?? null

      const deps = getDeps(pkg)

      if (hasDep(deps, 'next')) {
        framework = 'nextjs'
        appType = 'fullstack'
      } else if (hasDep(deps, 'vite') || has('vite.config.ts') || has('vite.config.js') || has('vite.config.mjs')) {
        framework = 'vite'
        appType = 'web'
      } else if (hasDep(deps, '@nestjs/core')) {
        framework = 'nestjs'
        appType = 'api'
      } else if (hasDep(deps, 'express')) {
        framework = 'express'
        appType = 'api'
      } else if (hasDep(deps, 'fastify')) {
        framework = 'fastify'
        appType = 'api'
      } else if (hasDep(deps, 'hono', '@hono/node-server')) {
        framework = 'hono'
        appType = 'api'
      } else if (hasDep(deps, 'koa')) {
        framework = 'koa'
        appType = 'api'
      } else if (hasDep(deps, 'react', 'react-dom') && !hasDep(deps, 'next')) {
        framework = 'react'
        appType = 'web'
      } else if (hasDep(deps, 'vue')) {
        framework = 'vue'
        appType = 'web'
      } else if (hasDep(deps, 'svelte', '@sveltejs/kit')) {
        framework = 'svelte'
        appType = hasDep(deps, '@sveltejs/kit') ? 'fullstack' : 'web'
      }

      hasPrisma = hasDep(deps, '@prisma/client', 'prisma')
      hasDatabase = hasPrisma || hasDep(deps, 'pg', 'mysql2', 'mongoose', 'mongodb', 'better-sqlite3', 'redis', 'ioredis', 'sequelize', 'typeorm', 'drizzle-orm')

      if (pkg.engines && typeof pkg.engines === 'object') {
        const engines = pkg.engines as Record<string, string>
        nodeVersion = engines.node ?? null
      }
    }

    if (packageManager === 'unknown') packageManager = 'npm'
  }

  // ── next.config.* overrides framework ──────────────────────────────────────
  if (has('next.config.js') || has('next.config.mjs') || has('next.config.ts')) {
    framework = 'nextjs'
    if (language === 'unknown') language = 'nodejs'
    appType = 'fullstack'
  }

  // ── Python ─────────────────────────────────────────────────────────────────
  if (language === 'unknown' && (has('requirements.txt') || has('pyproject.toml') || has('Pipfile'))) {
    language = 'python'
    appType = 'api'

    const reqs = get('requirements.txt') + get('pyproject.toml')
    if (/\bfastapi\b/i.test(reqs)) framework = 'fastapi'
    else if (/\bflask\b/i.test(reqs)) framework = 'flask'
    else if (/\bdjango\b/i.test(reqs)) framework = 'django'
    else if (/\bstarlette\b/i.test(reqs)) framework = 'starlette'

    if (has('Pipfile')) packageManager = 'pipenv'
    else if (has('pyproject.toml') && get('pyproject.toml').includes('[tool.poetry]')) packageManager = 'poetry'
    else packageManager = 'pip'

    hasDatabase = /\bsqlalchemy\b|\bpsycopg\b|\bpymongo\b|\bmysql\b/i.test(reqs)
  }

  // ── Go ─────────────────────────────────────────────────────────────────────
  if (language === 'unknown' && has('go.mod')) {
    language = 'go'
    appType = 'api'
    const goMod = get('go.mod')
    if (/gin-gonic\/gin/.test(goMod)) framework = 'gin'
    else if (/labstack\/echo/.test(goMod)) framework = 'echo'
    else if (/gofiber\/fiber/.test(goMod)) framework = 'fiber'
    hasDatabase = /gorm\.io|database\/sql|pgx/.test(goMod)
    packageManager = 'go modules'
  }

  // ── Java ───────────────────────────────────────────────────────────────────
  if (language === 'unknown' && (has('pom.xml') || has('build.gradle'))) {
    language = 'java'
    appType = 'api'
    const build = get('pom.xml') + get('build.gradle')
    if (/spring-boot/i.test(build)) framework = 'spring-boot'
    hasDatabase = /postgresql|mysql|h2database|hibernate/i.test(build)
    packageManager = has('pom.xml') ? 'maven' : 'gradle'
  }

  // ── Dockerfile / Compose (check app root and repo root) ─────────────────────
  const hasDockerfile = has('Dockerfile') || has('dockerfile')
  const hasDockerCompose = has('docker-compose.yml') || has('docker-compose.yaml')

  // If compose has db services, mark hasDatabase
  if (hasDockerCompose) {
    const compose = get('docker-compose.yml') + get('docker-compose.yaml')
    if (/postgres|mysql|mongo|redis/i.test(compose)) hasDatabase = true
  }

  return {
    language,
    framework,
    packageManager,
    hasDockerfile,
    hasDockerCompose,
    buildCommand,
    startCommand,
    appType,
    nodeVersion,
    hasPrisma,
    hasDatabase,
  }
}
