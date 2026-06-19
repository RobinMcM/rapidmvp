import type { StackResult } from './stack-detector'
import type { EnvVariable } from './env-detector'

export type AzureService = {
  name: string
  tier: string
  reason: string
  required: boolean
}

export type GovernanceFinding = {
  category: string
  severity: 'info' | 'warning' | 'critical'
  finding: string
  recommendation: string
}

export type BuildScriptSpec = {
  scriptType: string
  title: string
  content: string
  explanation: string
}

export type AzureAssessment = {
  azureReadinessScore: number                                // 0–100
  suitability: 'suitable' | 'suitable_with_changes' | 'requires_containers' | 'unsupported'
  recommendedPath: string
  services: AzureService[]
  blockers: string[]
  risks: string[]
  installSteps: string[]
  governanceFindings: GovernanceFinding[]
  buildScripts: BuildScriptSpec[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasEnvVar(envVars: EnvVariable[], ...patterns: RegExp[]): boolean {
  return envVars.some((v) => patterns.some((p) => p.test(v.name)))
}

function hasDbDependency(stack: StackResult, envVars: EnvVariable[]): boolean {
  if (stack.hasDatabase || stack.hasPrisma) return true
  return hasEnvVar(envVars, /^DATABASE_URL$/, /^DB_URL$/, /^POSTGRES_URL$/, /^MYSQL_URL$/, /^MONGODB_URI$/, /^DATABASE_HOST$/, /^DB_HOST$/, /^PGHOST$/, /^PGDATABASE$/, /^PGURL$/)
}

function hasStorageDependency(envVars: EnvVariable[]): boolean {
  return hasEnvVar(envVars, /BLOB/i, /STORAGE/i, /S3_BUCKET/i, /AWS_S3/i, /DO_SPACES/i, /CDN_URL/i, /AZURE_STORAGE/i)
}

function detectHealthCheck(files: Map<string, string>): boolean {
  for (const [, raw] of files) {
    if (!raw) continue
    if (/['"`]\/health['"`]|route.*health|healthcheck/i.test(raw)) return true
  }
  return false
}

// ── Main assessor ─────────────────────────────────────────────────────────────

export function assessAzureReadiness(
  stack: StackResult,
  envVars: EnvVariable[],
  files: Map<string, string>
): AzureAssessment {
  let score = 100

  const services: AzureService[] = []
  const blockers: string[] = []
  const risks: string[] = []
  const governanceFindings: GovernanceFinding[] = []
  const buildScripts: BuildScriptSpec[] = []

  // ── Always recommended ────────────────────────────────────────────────────
  services.push({
    name: 'Azure App Service',
    tier: 'B2 or Standard S1',
    reason: `Hosts the ${stack.appType} application (${stack.framework !== 'unknown' ? stack.framework : stack.language} runtime)`,
    required: true,
  })
  services.push({
    name: 'Application Insights',
    tier: 'Standard',
    reason: 'APM, logging, performance tracking, and deployment health monitoring',
    required: true,
  })

  // ── Database ──────────────────────────────────────────────────────────────
  const needsDb = hasDbDependency(stack, envVars)
  if (needsDb) {
    services.push({
      name: 'Azure Database for PostgreSQL Flexible Server',
      tier: 'Burstable B1ms (dev) / Standard D2s_v3 (prod)',
      reason: stack.hasPrisma ? 'Prisma ORM detected' : 'Database environment variable or dependency detected',
      required: true,
    })
  }

  // ── Secrets → Key Vault ───────────────────────────────────────────────────
  const secretVars = envVars.filter((v) => v.classification === 'secret')
  if (secretVars.length > 0) {
    services.push({
      name: 'Azure Key Vault',
      tier: 'Standard',
      reason: `${secretVars.length} secret variable(s) detected — must not be stored in plain App Settings`,
      required: true,
    })
    risks.push(`${secretVars.length} secret environment variable(s) detected — store in Azure Key Vault, reference via managed identity`)
  }

  // ── Blob / file storage ───────────────────────────────────────────────────
  const needsStorage = hasStorageDependency(envVars)
  if (needsStorage) {
    services.push({
      name: 'Azure Storage Account',
      tier: 'Standard LRS',
      reason: 'File/blob storage environment variables detected',
      required: false,
    })
  }

  // ── Containers ────────────────────────────────────────────────────────────
  if (stack.hasDockerfile) {
    services.push({
      name: 'Azure Container Registry',
      tier: 'Basic',
      reason: 'Dockerfile detected — container image must be built and pushed before deployment',
      required: true,
    })
  }

  // ── Missing start command ─────────────────────────────────────────────────
  if (!stack.startCommand && !stack.hasDockerfile) {
    blockers.push('Missing production start command — add a "start" script to package.json (e.g. "next start" or "node dist/index.js")')
    governanceFindings.push({
      category: 'Deployment',
      severity: 'critical',
      finding: 'No production start command detected in package.json scripts.start',
      recommendation: 'Add "start" to package.json scripts. Azure App Service uses this to launch the application.',
    })
    score -= 20
  }

  // ── Missing build command (Node.js) ───────────────────────────────────────
  if (!stack.buildCommand && stack.language === 'nodejs') {
    risks.push('No build command detected — deployment may fail without a build step')
    score -= 10
  }

  // ── Missing .env.example ─────────────────────────────────────────────────
  const hasEnvExample = files.has('.env.example') || files.has('.env.local.example') || files.has('.env.sample')
  if (!hasEnvExample && envVars.length > 0) {
    governanceFindings.push({
      category: 'Configuration',
      severity: 'warning',
      finding: 'No .env.example file found in repository',
      recommendation: 'Add .env.example listing all required environment variable names (without values). This is the install guide for Azure administrators.',
    })
    score -= 10
  }

  // ── .env file committed ───────────────────────────────────────────────────
  if (files.has('.env')) {
    governanceFindings.push({
      category: 'Security',
      severity: 'critical',
      finding: '.env file present in the uploaded repository ZIP',
      recommendation: 'Verify .env is in .gitignore and was not committed with real secret values. All secrets must move to Azure Key Vault before deployment.',
    })
    risks.push('.env file found in repository — verify no live secrets were committed')
    score -= 20
  }

  // ── Health check ─────────────────────────────────────────────────────────
  const hasHealth = detectHealthCheck(files)
  if (!hasHealth) {
    governanceFindings.push({
      category: 'Reliability',
      severity: 'warning',
      finding: 'No health check endpoint detected',
      recommendation: 'Add GET /health returning HTTP 200. Azure App Service and deployment slots use this for health monitoring.',
    })
    score -= 10
  }

  // ── Unknown language ─────────────────────────────────────────────────────
  if (stack.language === 'unknown') {
    blockers.push('Unable to detect application language or runtime — Azure deployment strategy cannot be determined')
    score -= 40
  }

  // ── Prisma migration note ─────────────────────────────────────────────────
  if (stack.hasPrisma) {
    risks.push('Prisma ORM detected — database migrations must run as part of the deployment pipeline before app startup')
    governanceFindings.push({
      category: 'Database',
      severity: 'info',
      finding: 'Prisma ORM detected — migration step required on first deployment',
      recommendation: 'Add `prisma migrate deploy` to your CI/CD pipeline, triggered before the application starts. Use a startup script or release task.',
    })
    buildScripts.push({
      scriptType: 'DatabaseMigration',
      title: 'Prisma Migration — Azure PostgreSQL Flexible Server',
      content: [
        '#!/bin/bash',
        '# Run after Azure PostgreSQL is provisioned, before app deployment',
        '',
        'export DATABASE_URL="postgresql://<USER>:<PASSWORD>@<SERVER>.postgres.database.azure.com:5432/<DB>?sslmode=require"',
        '',
        'npx prisma migrate deploy',
        'echo "Prisma migration complete"',
      ].join('\n'),
      explanation: 'Applies all pending Prisma migrations to Azure PostgreSQL Flexible Server. Run once during initial provisioning and on every schema change.',
    })
  }

  // ── App Service configuration script ─────────────────────────────────────
  if (stack.language !== 'unknown') {
    const buildCmd = stack.buildCommand ?? (stack.framework === 'nextjs' ? 'npm run build' : null)
    const startCmd = stack.startCommand ?? (stack.framework === 'nextjs' ? 'npm run start' : null)
    const pm = stack.packageManager === 'yarn' ? 'yarn' : stack.packageManager === 'pnpm' ? 'pnpm' : 'npm'

    const settingsLines = [
      '  SCM_DO_BUILD_DURING_DEPLOYMENT=true \\',
      '  NODE_ENV=production \\',
      ...secretVars.slice(0, 8).map(
        (v) => `  ${v.name}="@Microsoft.KeyVault(SecretUri=https://<KEYVAULT_NAME>.vault.azure.net/secrets/${v.name.replace(/_/g, '-')}/)" \\`
      ),
      ...envVars
        .filter((v) => v.classification !== 'secret' && v.classification !== 'unknown')
        .slice(0, 8)
        .map((v) => `  ${v.name}="<REPLACE_WITH_VALUE>" \\`),
    ].filter(Boolean)

    buildScripts.push({
      scriptType: 'AzureAppServiceDeploy',
      title: 'Azure App Service — Configuration Script',
      content: [
        '#!/bin/bash',
        '# Azure App Service deployment and configuration',
        '# Replace placeholders before running',
        '',
        'RG="<YOUR_RESOURCE_GROUP>"',
        'APP="<YOUR_APP_NAME>"',
        '',
        '# Set startup command',
        startCmd
          ? `az webapp config set --name "$APP" --resource-group "$RG" --startup-file "${startCmd}"`
          : '# TODO: configure startup command',
        '',
        '# Configure application settings',
        `az webapp config appsettings set --name "$APP" --resource-group "$RG" --settings \\`,
        ...settingsLines,
        '  APPLICATIONINSIGHTS_CONNECTION_STRING="<AI_CONNECTION_STRING>"',
        '',
        buildCmd ? `# Build command: ${buildCmd}` : '# TODO: confirm build command',
        '',
        '# Enable Application Insights',
        'az monitor app-insights component connect-webapp \\',
        '  --app "<YOUR_AI_NAME>" --resource-group "$RG" --web-app "$APP"',
      ].join('\n'),
      explanation: `Azure CLI script to configure App Service settings, startup command, and Application Insights. Uses Key Vault references for secrets. Package manager: ${pm}.`,
    })
  }

  // ── GitHub Actions CI/CD script ───────────────────────────────────────────
  const pm = stack.packageManager === 'yarn' ? 'yarn' : stack.packageManager === 'pnpm' ? 'pnpm' : 'npm'
  const installCmd = pm === 'yarn' ? 'yarn install --frozen-lockfile' : pm === 'pnpm' ? 'pnpm install --frozen-lockfile' : 'npm ci'
  const buildCmd = stack.buildCommand ? `${pm} run build` : null

  buildScripts.push({
    scriptType: 'GithubActionsDeploy',
    title: 'GitHub Actions — Deploy to Azure App Service',
    content: [
      'name: Deploy to Azure App Service',
      '',
      'on:',
      '  push:',
      '    branches: [main]',
      '',
      'jobs:',
      '  deploy:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      stack.language === 'nodejs'
        ? [
            `      - uses: actions/setup-node@v4`,
            `        with:`,
            `          node-version: '${stack.nodeVersion ?? '20'}'`,
            `      - run: ${installCmd}`,
            buildCmd ? `      - run: ${buildCmd}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '',
      stack.hasPrisma ? '      - run: npx prisma migrate deploy' : '',
      '      - uses: azure/webapps-deploy@v3',
      '        with:',
      "          app-name: '<YOUR_APP_NAME>'",
      "          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}",
    ]
      .filter((l) => l !== '')
      .join('\n'),
    explanation: 'Minimal GitHub Actions workflow for deploying to Azure App Service on push to main branch.',
  })

  // ── Suitability ───────────────────────────────────────────────────────────
  let suitability: AzureAssessment['suitability'] = 'suitable'
  if (stack.language === 'unknown') {
    suitability = 'unsupported'
  } else if (stack.hasDockerfile && !stack.startCommand) {
    suitability = 'requires_containers'
  } else if (blockers.length > 0 || secretVars.length > 0 || !hasHealth) {
    suitability = 'suitable_with_changes'
  }

  // ── Install steps ─────────────────────────────────────────────────────────
  const installSteps: string[] = [
    'Provision Azure App Service (Linux, Node.js runtime or container)',
    needsDb ? 'Provision Azure Database for PostgreSQL Flexible Server and create application database' : '',
    secretVars.length > 0 ? 'Provision Azure Key Vault and migrate all secret values' : '',
    needsStorage ? 'Provision Azure Storage Account and update connection string' : '',
    stack.hasDockerfile ? 'Provision Azure Container Registry, build and push Docker image' : '',
    secretVars.length > 0 ? 'Grant App Service managed identity read access to Key Vault' : '',
    'Configure all required App Settings in Azure App Service',
    stack.hasPrisma ? 'Run `prisma migrate deploy` against Azure PostgreSQL before first start' : '',
    stack.buildCommand ? `Set build command: ${stack.buildCommand}` : '',
    stack.startCommand ? `Set startup command: ${stack.startCommand}` : '',
    'Enable Application Insights and verify telemetry',
    'Deploy application and validate health endpoint',
  ].filter(Boolean)

  // ── Recommended path ──────────────────────────────────────────────────────
  const requiredServices = services.filter((s) => s.required).map((s) =>
    s.name
      .replace('Azure ', '')
      .replace(' for PostgreSQL Flexible Server', ' PostgreSQL')
      .replace('Application ', 'App ')
  )
  const recommendedPath = requiredServices.slice(0, 4).join(' + ') || 'Azure App Service'

  score = Math.max(0, Math.min(100, score))

  return {
    azureReadinessScore: score,
    suitability,
    recommendedPath,
    services,
    blockers,
    risks,
    installSteps,
    governanceFindings,
    buildScripts,
  }
}
