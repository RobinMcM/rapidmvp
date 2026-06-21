import type { StackResult } from './stack-detector'
import type { EnvVariable } from './env-detector'
import type { AzureAssessment } from './azure-assessor'

function suitabilityLabel(s: AzureAssessment['suitability']): string {
  switch (s) {
    case 'suitable':             return 'Ready for cloud deployment'
    case 'suitable_with_changes': return 'Ready with configuration changes required'
    case 'requires_containers':  return 'Requires container-based deployment (Dockerfile detected)'
    case 'unsupported':          return 'Unable to assess — runtime could not be detected'
  }
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 50) return 'Medium'
  return 'Low'
}

function providerLabel(provider: string): string {
  switch (provider) {
    case 'azure': return 'Microsoft Azure'
    case 'aws':   return 'Amazon Web Services'
    case 'gcp':   return 'Google Cloud'
    default:      return provider
  }
}

/**
 * Plain-language narrative for stakeholders. Answers: what was delivered, what
 * the app appears to do, what it needs to run, and whether it is ready for
 * cloud installation — without deep technical detail.
 */
export function generateStakeholderReport(
  repositoryName: string,
  provider: string,
  stack: StackResult,
  envVars: EnvVariable[],
  assessment: AzureAssessment
): string {
  const today = new Date().toISOString().split('T')[0]
  const fwLabel = stack.framework !== 'unknown' ? stack.framework : stack.language
  const secrets = envVars.filter((v) => v.classification === 'secret')
  const lines: string[] = []

  lines.push(`# Handover Report — ${repositoryName}`)
  lines.push('')
  lines.push(`**Prepared:** ${today}`)
  lines.push(`**Target cloud:** ${providerLabel(provider)}`)
  lines.push(`**Cloud Readiness:** ${assessment.azureReadinessScore}/100 (${scoreLabel(assessment.azureReadinessScore)})`)
  lines.push('')
  lines.push('---')
  lines.push('')

  lines.push('## What was delivered')
  lines.push('')
  lines.push(`The repository **${repositoryName}** was handed over as a ZIP package and inspected automatically. It is a **${stack.appType}** application built with **${fwLabel}**.`)
  lines.push('')

  lines.push('## What it needs to run')
  lines.push('')
  const reqServices = assessment.services.filter((s) => s.required)
  if (reqServices.length > 0) {
    lines.push('To run in the cloud, this application requires:')
    lines.push('')
    for (const svc of reqServices) {
      lines.push(`- **${svc.name.replace('Azure ', '')}** — ${svc.reason}`)
    }
  } else {
    lines.push('No additional cloud services beyond basic hosting were detected.')
  }
  lines.push('')
  if (secrets.length > 0) {
    lines.push(`It also uses **${secrets.length} secret value(s)** (such as API keys or passwords) that must be supplied securely before go-live.`)
    lines.push('')
  }

  lines.push('## Is it ready?')
  lines.push('')
  lines.push(`**${suitabilityLabel(assessment.suitability)}.**`)
  lines.push('')
  if (assessment.blockers.length > 0) {
    lines.push(`There are **${assessment.blockers.length} blocker(s)** that must be resolved before deployment:`)
    lines.push('')
    for (const b of assessment.blockers) {
      lines.push(`- ${b}`)
    }
  } else {
    lines.push('No critical blockers were found. Some configuration is still required before go-live.')
  }
  lines.push('')

  if (assessment.risks.length > 0) {
    lines.push('## Things to be aware of')
    lines.push('')
    for (const r of assessment.risks) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('_A detailed installation guide for infrastructure engineers accompanies this report._')

  return lines.join('\n')
}

/**
 * The technical installation guide for infrastructure engineers (formerly the
 * "Azure Administrator Installation Document").
 */
export function generateEngineerReport(
  repositoryName: string,
  stack: StackResult,
  envVars: EnvVariable[],
  assessment: AzureAssessment
): string {
  const today = new Date().toISOString().split('T')[0]
  const required   = envVars.filter((v) => v.classification === 'required')
  const secrets    = envVars.filter((v) => v.classification === 'secret')
  const publicVars = envVars.filter((v) => v.classification === 'public')
  const optional   = envVars.filter((v) => v.classification === 'optional')

  const pmInstallCmd =
    stack.packageManager === 'yarn'  ? 'yarn install --frozen-lockfile' :
    stack.packageManager === 'pnpm'  ? 'pnpm install --frozen-lockfile' :
    'npm ci'

  const lines: string[] = []

  lines.push(`# Engineer Install Guide — ${repositoryName}`)
  lines.push('')
  lines.push(`**Prepared:** ${today}`)
  lines.push(`**Cloud Readiness Score:** ${assessment.azureReadinessScore}/100 (${scoreLabel(assessment.azureReadinessScore)})`)
  lines.push(`**Suitability:** ${suitabilityLabel(assessment.suitability)}`)
  lines.push(`**Recommended Path:** ${assessment.recommendedPath}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 1. Executive Summary ─────────────────────────────────────────────────
  lines.push('## 1. Executive Summary')
  lines.push('')
  const fwLabel = stack.framework !== 'unknown' ? stack.framework : stack.language
  lines.push(`This guide provides cloud installation steps for the **${repositoryName}** repository. The application is built with **${fwLabel}** and is assessed as: **${suitabilityLabel(assessment.suitability)}**.`)
  lines.push('')
  lines.push(`**Cloud Readiness Score: ${assessment.azureReadinessScore}/100**`)
  lines.push('')
  if (assessment.blockers.length > 0) {
    lines.push(`> **Action Required:** ${assessment.blockers.length} critical blocker(s) must be resolved before deployment.`)
    lines.push('')
  } else {
    lines.push('No critical blockers were identified. Configuration changes are needed before deployment.')
    lines.push('')
  }
  lines.push(`The minimum viable cloud architecture requires: **${assessment.recommendedPath}**.`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 2. Repository / Application Summary ──────────────────────────────────
  lines.push('## 2. Repository / Application Summary')
  lines.push('')
  lines.push('| Property | Value |')
  lines.push('|---|---|')
  lines.push(`| Repository | \`${repositoryName}\` |`)
  lines.push(`| Language | ${stack.language} |`)
  lines.push(`| Framework | ${stack.framework} |`)
  lines.push(`| Package Manager | ${stack.packageManager} |`)
  lines.push(`| Application Type | ${stack.appType} |`)
  lines.push(`| Has Dockerfile | ${stack.hasDockerfile ? 'Yes' : 'No'} |`)
  lines.push(`| Has Docker Compose | ${stack.hasDockerCompose ? 'Yes' : 'No'} |`)
  lines.push(`| Uses Prisma ORM | ${stack.hasPrisma ? 'Yes' : 'No'} |`)
  lines.push(`| Database Dependency | ${stack.hasDatabase ? 'Detected' : 'Not detected'} |`)
  if (stack.nodeVersion) lines.push(`| Required Node Version | \`${stack.nodeVersion}\` |`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 3. Detected Technology Stack ─────────────────────────────────────────
  lines.push('## 3. Detected Technology Stack')
  lines.push('')
  lines.push(`- **Language:** ${stack.language}`)
  lines.push(`- **Framework:** ${stack.framework}`)
  lines.push(`- **Package Manager:** ${stack.packageManager}`)
  if (stack.nodeVersion) lines.push(`- **Node Version (engines.node):** ${stack.nodeVersion}`)
  lines.push(`- **Build Command:** \`${stack.buildCommand ?? 'not detected'}\``)
  lines.push(`- **Start Command:** \`${stack.startCommand ?? 'not detected'}\``)
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 4. Recommended Cloud Architecture ────────────────────────────────────
  lines.push('## 4. Recommended Cloud Architecture')
  lines.push('')
  lines.push(`**Recommended path:** ${assessment.recommendedPath}`)
  lines.push('')
  for (const svc of assessment.services) {
    lines.push(`### ${svc.name}`)
    lines.push(`- **Tier:** ${svc.tier}`)
    lines.push(`- **Required:** ${svc.required ? 'Yes' : 'Optional'}`)
    lines.push(`- **Reason:** ${svc.reason}`)
    lines.push('')
  }
  lines.push('---')
  lines.push('')

  // ── 5. Required Cloud Services ────────────────────────────────────────────
  lines.push('## 5. Required Cloud Services')
  lines.push('')
  const reqServices = assessment.services.filter((s) => s.required)
  const optServices = assessment.services.filter((s) => !s.required)
  for (let i = 0; i < reqServices.length; i++) {
    lines.push(`${i + 1}. **${reqServices[i].name}** (${reqServices[i].tier}) — ${reqServices[i].reason}`)
  }
  if (optServices.length > 0) {
    lines.push('')
    lines.push('**Optional services:**')
    for (const svc of optServices) {
      lines.push(`- ${svc.name} — ${svc.reason}`)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 6. Required Environment Variables / App Settings ─────────────────────
  lines.push('## 6. Required Environment Variables / App Settings')
  lines.push('')
  lines.push('Configure all of the following in **Azure App Service → Configuration → Application Settings**.')
  lines.push('')

  if (required.length > 0) {
    lines.push('### Required Variables')
    lines.push('')
    lines.push('| Variable | Notes |')
    lines.push('|---|---|')
    for (const v of required) {
      lines.push(`| \`${v.name}\` | Required — set in App Service App Settings |`)
    }
    lines.push('')
  }

  if (publicVars.length > 0) {
    lines.push('### Public / Build-Time Variables')
    lines.push('')
    lines.push('| Variable | Notes |')
    lines.push('|---|---|')
    for (const v of publicVars) {
      lines.push(`| \`${v.name}\` | Public — safe to include in build output |`)
    }
    lines.push('')
  }

  if (optional.length > 0) {
    lines.push('### Optional Variables')
    lines.push('')
    for (const v of optional) {
      lines.push(`- \`${v.name}\``)
    }
    lines.push('')
  }

  if (required.length === 0 && publicVars.length === 0 && optional.length === 0) {
    lines.push('_No environment variables detected. Review source code before deployment._')
    lines.push('')
  }

  lines.push('---')
  lines.push('')

  // ── 7. Secret Handling Instructions ──────────────────────────────────────
  lines.push('## 7. Secret Handling Instructions')
  lines.push('')
  if (secrets.length > 0) {
    lines.push(`**${secrets.length} secret variable(s) detected.** These must be stored in Azure Key Vault and referenced via managed identity — never stored as plain App Settings.`)
    lines.push('')
    lines.push('**Steps:**')
    lines.push('')
    lines.push('1. Create Azure Key Vault in the same resource group as your App Service.')
    lines.push('2. Enable system-assigned managed identity on App Service.')
    lines.push('3. Grant the managed identity the **Key Vault Secrets User** role.')
    lines.push('4. Create Key Vault secrets:')
    lines.push('')
    lines.push('```bash')
    for (const v of secrets) {
      lines.push(`az keyvault secret set --vault-name <KEYVAULT_NAME> --name "${v.name.replace(/_/g, '-')}" --value "<VALUE>"`)
    }
    lines.push('```')
    lines.push('')
    lines.push('5. Reference secrets in App Settings using Key Vault references:')
    lines.push('')
    lines.push('```')
    for (const v of secrets) {
      lines.push(`${v.name} = @Microsoft.KeyVault(SecretUri=https://<KEYVAULT_NAME>.vault.azure.net/secrets/${v.name.replace(/_/g, '-')}/)`)
    }
    lines.push('```')
    lines.push('')
    lines.push('> **Never commit secret values to source control. Never store secrets as plain App Service settings.**')
  } else {
    lines.push('No secret-class environment variables were detected. Review all environment variables before production deployment and move any sensitive values to Azure Key Vault.')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 8. Database Setup Requirements ───────────────────────────────────────
  lines.push('## 8. Database Setup Requirements')
  lines.push('')
  if (stack.hasPrisma) {
    lines.push('**Prisma ORM detected.** Follow these steps:')
    lines.push('')
    lines.push('1. Provision Azure Database for PostgreSQL Flexible Server (version 16 recommended).')
    lines.push('2. Create a dedicated database user with limited privileges.')
    lines.push('3. Set the `DATABASE_URL` App Setting to the connection string:')
    lines.push('   ```')
    lines.push('   postgresql://<USER>:<PASSWORD>@<SERVER>.postgres.database.azure.com:5432/<DB>?sslmode=require')
    lines.push('   ```')
    lines.push('4. Run migrations before first startup:')
    lines.push('   ```bash')
    lines.push('   npx prisma migrate deploy')
    lines.push('   ```')
    lines.push('5. Add migration step to CI/CD pipeline — must run before app starts.')
  } else if (stack.hasDatabase) {
    lines.push('A database dependency was detected (via environment variables or dependencies). Provision the appropriate Azure database service and configure the connection string in App Settings.')
  } else {
    lines.push('_No database dependency detected._')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 9. Build Command ──────────────────────────────────────────────────────
  lines.push('## 9. Build Command')
  lines.push('')
  if (stack.buildCommand) {
    lines.push('```bash')
    lines.push(stack.buildCommand)
    lines.push('```')
  } else {
    lines.push('> ⚠️ **No build command detected.** Configure in Azure App Service deployment settings or add a `build` script to package.json.')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 10. Start Command ─────────────────────────────────────────────────────
  lines.push('## 10. Start Command')
  lines.push('')
  if (stack.startCommand) {
    lines.push('```bash')
    lines.push(stack.startCommand)
    lines.push('```')
  } else {
    lines.push('> ⚠️ **No start command detected.** This is a blocker. Add a `start` script to package.json (e.g. `"next start"` or `"node dist/index.js"`) and configure it as the App Service startup command.')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 11. Deployment Process ────────────────────────────────────────────────
  lines.push('## 11. Deployment Process')
  lines.push('')
  for (let i = 0; i < assessment.installSteps.length; i++) {
    lines.push(`${i + 1}. ${assessment.installSteps[i]}`)
  }
  lines.push('')
  lines.push('### Install Dependencies and Build')
  lines.push('')
  lines.push('```bash')
  lines.push(pmInstallCmd)
  if (stack.buildCommand) lines.push(stack.buildCommand)
  lines.push('```')
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 12. Validation Checklist ──────────────────────────────────────────────
  lines.push('## 12. Validation Checklist')
  lines.push('')
  lines.push('- [ ] Azure App Service provisioned with correct runtime')
  if (stack.hasDatabase || stack.hasPrisma) {
    lines.push('- [ ] Azure PostgreSQL provisioned and accessible')
    lines.push('- [ ] Database user and schema created')
    if (stack.hasPrisma) lines.push('- [ ] Prisma migrations applied (`prisma migrate deploy`)')
    lines.push('- [ ] DATABASE_URL connection string tested')
  }
  if (secrets.length > 0) {
    lines.push('- [ ] Azure Key Vault provisioned')
    lines.push('- [ ] All secrets added to Key Vault')
    lines.push('- [ ] App Service managed identity has Key Vault Secrets User role')
    lines.push('- [ ] Key Vault references configured in App Settings')
  }
  lines.push('- [ ] All required App Settings configured')
  lines.push('- [ ] Application builds without errors')
  lines.push('- [ ] Application starts without errors')
  lines.push('- [ ] Health endpoint returns HTTP 200')
  lines.push('- [ ] Application Insights connected and receiving telemetry')
  lines.push('- [ ] Custom domain and SSL configured (if applicable)')
  lines.push('- [ ] Deployment pipeline tested end-to-end')
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 13. Risks and Blockers ────────────────────────────────────────────────
  lines.push('## 13. Risks and Blockers')
  lines.push('')
  lines.push('### Critical Blockers')
  lines.push('')
  if (assessment.blockers.length > 0) {
    for (const b of assessment.blockers) {
      lines.push(`- **${b}**`)
    }
  } else {
    lines.push('_No critical blockers identified._')
  }
  lines.push('')
  lines.push('### Risks')
  lines.push('')
  if (assessment.risks.length > 0) {
    for (const r of assessment.risks) {
      lines.push(`- ${r}`)
    }
  } else {
    lines.push('_No significant risks identified._')
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // ── 14. Outstanding Questions ─────────────────────────────────────────────
  lines.push('## 14. Outstanding Questions')
  lines.push('')
  lines.push('The following items require confirmation from the development team before deployment:')
  lines.push('')
  const questions = [
    'What is the expected production traffic volume? (Determines App Service tier)',
    'Is a CI/CD pipeline already in place, or does one need to be created?',
    'Are all secret values (keys, tokens, passwords) available for Key Vault upload?',
    'Is there an existing Azure subscription and resource group to deploy into?',
    'What is the target Azure region?',
    !stack.startCommand ? 'What is the correct production start command for this application?' : null,
    stack.hasPrisma ? 'Has the Prisma schema been reviewed and tested against Azure PostgreSQL?' : null,
    stack.hasDockerfile ? 'Is the Dockerfile production-ready or development-only?' : null,
    envVars.length === 0 ? 'No environment variables were detected — is the app configuration documented elsewhere?' : null,
  ].filter(Boolean) as string[]

  for (let i = 0; i < questions.length; i++) {
    lines.push(`${i + 1}. ${questions[i]}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('_Engineer install guide generated by RapidMVP._')

  return lines.join('\n')
}
