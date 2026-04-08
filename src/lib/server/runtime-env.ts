type RuntimeEnv = Record<string, string | undefined>

const runtimeEnv = (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}

export function readRequiredEnv(key: string) {
  const value = runtimeEnv[key]
  if (!value || !value.trim()) {
    throw new Error(`[server-env] Missing required environment variable: ${key}`)
  }

  return value
}

export function readOptionalEnv(key: string, fallback?: string) {
  return runtimeEnv[key] ?? fallback
}
