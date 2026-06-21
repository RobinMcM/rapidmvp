/**
 * Test fixtures for the repository-analysis engine.
 * The engine consumes a Map<filename, contents>, the same shape zip-reader produces.
 */

export function filesFrom(record: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(record))
}

/** A Next.js + Prisma fullstack repo with a committed secret in .env. */
export function nextjsPrismaRepo(): Map<string, string> {
  return filesFrom({
    'package.json': JSON.stringify({
      name: 'demo',
      scripts: { build: 'next build', start: 'next start' },
      dependencies: { next: '^15.0.0', '@prisma/client': '^6.0.0', pg: '^8.0.0' },
      engines: { node: '20' },
    }),
    'package-lock.json': '{}',
    '.env.example': 'DATABASE_URL=\nNEXT_PUBLIC_APP_URL=\nSESSION_SECRET=\nPORT=',
    'prisma/schema.prisma': 'generator client {}',
    'src/index.ts': 'const k = process.env.MY_FEATURE_FLAG',
  })
}

/** An Express API repo, no start script, no Dockerfile. */
export function expressApiRepo(): Map<string, string> {
  return filesFrom({
    'package.json': JSON.stringify({
      name: 'api',
      scripts: { build: 'tsc' },
      dependencies: { express: '^4.0.0' },
    }),
    'package-lock.json': '{}',
  })
}

/** A Python FastAPI repo. */
export function fastapiRepo(): Map<string, string> {
  return filesFrom({
    'requirements.txt': 'fastapi==0.110\nuvicorn\nsqlalchemy\npsycopg2',
  })
}
