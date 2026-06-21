import JSZip from 'jszip'

const BLOCKED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
  'vendor', '__pycache__', '.yarn', '.pnp', 'tmp', 'temp',
  '.cache', 'out', '.output', '.vercel', '.netlify', '.turbo',
  'bower_components', 'jspm_packages', '.gradle', 'target',
])

// Extensions we never read (binary / non-text)
const BINARY_EXTS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'bmp', 'tiff',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'mp4', 'mov', 'avi', 'webm', 'mkv', 'mp3', 'wav', 'ogg',
  'zip', 'tar', 'gz', 'bz2', 'rar', '7z', 'tgz', 'xz',
  'pdf', 'doc', 'docx', 'xlsx', 'pptx',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'pyc', 'pyo',
  'map', 'snap',
])

const MAX_FILE_BYTES = 512 * 1024  // 512 KB per file
const MAX_SOURCE_FILES = 400       // budget for ordinary source files (manifests are always read)

// Filenames worth reading no matter where they live
const PRIORITY_NAMES = new Set([
  'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'next.config.js', 'next.config.mjs', 'next.config.ts',
  'vite.config.js', 'vite.config.ts', 'vite.config.mjs',
  'Dockerfile', 'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.env', '.env.example', '.env.local', '.env.local.example', '.env.sample', '.env.template',
  'README.md', 'README.txt', 'readme.md',
  'go.mod', 'go.sum', 'requirements.txt', 'pyproject.toml', 'Pipfile',
  'pom.xml', 'build.gradle', 'settings.gradle', 'build.gradle.kts',
  'Procfile', 'app.yaml', 'azure.yaml', 'fly.toml', 'render.yaml',
  'tsconfig.json', '.nvmrc', '.node-version',
  'prisma/schema.prisma',
])

// Source file extensions we scan for env var references
const SOURCE_EXTS = new Set([
  'ts', 'tsx', 'js', 'mjs', 'jsx', 'cjs',
  'py', 'go', 'java', 'rb', 'php', 'rs',
  'yml', 'yaml', 'toml', 'tf', 'bicep', 'env',
])

function isBlockedPath(rawPath: string): boolean {
  const normalized = rawPath.replace(/\\/g, '/')

  // Zip-slip prevention: reject traversal and absolute paths
  if (normalized.includes('..') || normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    return true
  }

  const parts = normalized.split('/')
  for (const part of parts) {
    if (BLOCKED_DIRS.has(part)) return true
  }
  return false
}

function isBinaryExt(filename: string): boolean {
  const dotIdx = filename.lastIndexOf('.')
  if (dotIdx === -1) return false
  return BINARY_EXTS.has(filename.slice(dotIdx + 1).toLowerCase())
}

function isInteresting(normalizedPath: string): boolean {
  const parts = normalizedPath.split('/')
  const filename = parts[parts.length - 1]

  if (PRIORITY_NAMES.has(filename)) return true
  if (PRIORITY_NAMES.has(normalizedPath)) return true  // prisma/schema.prisma etc.

  const dotIdx = filename.lastIndexOf('.')
  const ext = dotIdx !== -1 ? filename.slice(dotIdx + 1).toLowerCase() : ''
  if (SOURCE_EXTS.has(ext)) return true

  // Pick up .env.* variants
  if (filename.startsWith('.env')) return true
  // Terraform / bicep / infra
  if (ext === 'tf' || ext === 'bicep' || ext === 'hcl') return true

  return false
}

// Manifest / config / env files are always read, no matter how many source
// files exist or where they sort — the stack detector depends on them.
function isPriorityFile(relativePath: string): boolean {
  const filename = relativePath.split('/').pop() ?? ''
  if (PRIORITY_NAMES.has(filename)) return true
  if (PRIORITY_NAMES.has(relativePath)) return true
  if (filename.startsWith('.env')) return true
  return false
}

/**
 * Reads a repository ZIP buffer in memory.
 * Returns a Map of normalised file path → text content.
 *
 * Two passes so the cap can never starve manifests:
 *   1. every manifest/config/env file (at any depth), always read;
 *   2. ordinary source files up to MAX_SOURCE_FILES.
 *
 * Zip-slip safe, size-bounded, no disk writes.
 */
export async function readZipFiles(buffer: Buffer): Promise<Map<string, string>> {
  const zip = await JSZip.loadAsync(buffer)
  const result = new Map<string, string>()

  type Candidate = { entry: JSZip.JSZipObject; relativePath: string }
  const priority: Candidate[] = []
  const regular: Candidate[] = []

  for (const [entryName, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue
    if (isBlockedPath(entryName)) continue
    if (isBinaryExt(entryName)) continue

    // Strip top-level directory prefix that GitHub adds (repo-name-main/)
    const normalized = entryName.replace(/\\/g, '/')
    const firstSlash = normalized.indexOf('/')
    const relativePath = firstSlash !== -1 ? normalized.slice(firstSlash + 1) : normalized

    if (!relativePath) continue

    if (isPriorityFile(relativePath)) priority.push({ entry, relativePath })
    else if (isInteresting(relativePath)) regular.push({ entry, relativePath })
  }

  async function read({ entry, relativePath }: Candidate): Promise<void> {
    if (result.has(relativePath)) return
    try {
      const uint8 = await entry.async('uint8array')
      // Record presence even when file is too large (enables lock-file detection)
      if (uint8.byteLength > MAX_FILE_BYTES) {
        result.set(relativePath, '')
        return
      }
      result.set(relativePath, new TextDecoder('utf-8', { fatal: false }).decode(uint8))
    } catch {
      // Skip unreadable entries silently
    }
  }

  // Pass 1 — manifests/config/env, always
  for (const c of priority) await read(c)

  // Pass 2 — ordinary source files, bounded
  let sourceCount = 0
  for (const c of regular) {
    if (sourceCount >= MAX_SOURCE_FILES) break
    const before = result.size
    await read(c)
    if (result.size > before) sourceCount++
  }

  return result
}
