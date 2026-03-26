type RuntimeEnv = Record<string, string | undefined>

const runtimeEnv = (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined
const localhostFallback = 'http://localhost:3000'
const isProduction = runtimeEnv.NODE_ENV === 'production'
const explicitDomainSignal = pickFirst(
  runtimeEnv.NEXT_PUBLIC_WEBSITE_DOMAIN,
  runtimeEnv.NEXT_PUBLIC_APP_DOMAIN,
  runtimeEnv.APP_DOMAIN,
  browserOrigin
)
const isHostedRuntime = Boolean(
  runtimeEnv.RENDER ||
    runtimeEnv.RENDER_SERVICE_ID ||
    runtimeEnv.VERCEL ||
    runtimeEnv.CF_PAGES ||
    runtimeEnv.RAILWAY_ENVIRONMENT ||
    runtimeEnv.HEROKU_APP_NAME
)
const shouldEnforceNonLocalhost = isProduction && (isHostedRuntime || (!explicitDomainSignal ? true : !isLocalhostUrl(explicitDomainSignal)))

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return value.includes('localhost') || value.includes('127.0.0.1')
  }
}

function pickFirst(...values: Array<string | undefined>) {
  return values.find((value) => Boolean(value && value.trim()))
}

function assertNonLocalhostInProduction(value: string, keyName: string) {
  if (shouldEnforceNonLocalhost && isLocalhostUrl(value)) {
    throw new Error(`[auth-config] ${keyName} resolved to localhost in production. Configure public domain env variables.`)
  }
  return value
}

const resolvedWebsiteDomain = assertNonLocalhostInProduction(
  pickFirst(runtimeEnv.NEXT_PUBLIC_WEBSITE_DOMAIN, runtimeEnv.NEXT_PUBLIC_APP_DOMAIN, runtimeEnv.APP_DOMAIN, browserOrigin, localhostFallback) ??
    localhostFallback,
  'websiteDomain'
)

const resolvedCrudApiDomain = assertNonLocalhostInProduction(
  pickFirst(runtimeEnv.NEXT_PUBLIC_API_URL, runtimeEnv.NEXT_PUBLIC_API_DOMAIN, runtimeEnv.API_DOMAIN, browserOrigin, runtimeEnv.APP_DOMAIN, localhostFallback) ??
    localhostFallback,
  'crudApiDomain'
)

const resolvedAuthApiDomain = assertNonLocalhostInProduction(
  pickFirst(
    runtimeEnv.NEXT_PUBLIC_AUTH_API_URL,
    runtimeEnv.AUTH_API_DOMAIN,
    runtimeEnv.NEXT_PUBLIC_API_DOMAIN,
    runtimeEnv.API_DOMAIN,
    browserOrigin,
    resolvedCrudApiDomain
  ) ?? resolvedCrudApiDomain,
  'authApiDomain'
)

const localDevOrigins = ['http://localhost:3000', 'http://localhost:3001']
const defaultAuthApiBasePath =
  runtimeEnv.NEXT_PUBLIC_AUTH_API_BASE_PATH ?? runtimeEnv.AUTH_API_BASE_PATH ?? '/api/auth'

const envAllowedOrigins = (runtimeEnv.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const combinedAllowedOrigins = Array.from(
  new Set([
    runtimeEnv.APP_DOMAIN ?? resolvedWebsiteDomain,
    runtimeEnv.API_DOMAIN ?? resolvedCrudApiDomain,
    runtimeEnv.AUTH_API_DOMAIN ?? resolvedAuthApiDomain,
    ...localDevOrigins,
    ...envAllowedOrigins,
  ])
)

export const appInfo = {
  appName: 'RapidMvᵖ.io',
  websiteDomain: resolvedWebsiteDomain,
  // Use dedicated auth domain when provided; otherwise fallback to CRUD API domain.
  apiDomain: resolvedAuthApiDomain,
  // Set this to "/auth" for API-domain proxy pattern.
  apiBasePath: defaultAuthApiBasePath,
  websiteBasePath: '/auth',
}

export const apiUrls = {
  // Keep CRUD/data calls on app API domain (not auth domain).
  crudApiUrl: resolvedCrudApiDomain,
  authApiUrl: resolvedAuthApiDomain,
}

export const authEnv = {
  appDomain: runtimeEnv.APP_DOMAIN ?? resolvedWebsiteDomain,
  apiDomain: runtimeEnv.API_DOMAIN ?? resolvedCrudApiDomain,
  supertokensConnectionUri: runtimeEnv.SUPERTOKENS_CONNECTION_URI ?? 'http://localhost:3567',
  supertokensApiKey: runtimeEnv.SUPERTOKENS_API_KEY,
  cookieDomain: runtimeEnv.SUPERTOKENS_COOKIE_DOMAIN,
  allowedOrigins: combinedAllowedOrigins,
}
