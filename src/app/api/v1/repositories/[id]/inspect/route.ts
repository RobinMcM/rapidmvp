import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireAccountUser } from '../../../../../../lib/server/account-access'
import { getDocumentBuffer } from '../../../../../../lib/server/spaces'
import { readZipFiles } from '../../../../../../lib/repository/zip-reader'
import { detectStack } from '../../../../../../lib/repository/stack-detector'
import { detectEnvVars } from '../../../../../../lib/repository/env-detector'
import { checkConsistency } from '../../../../../../lib/repository/consistency-checker'
import { assessAzureReadiness } from '../../../../../../lib/repository/azure-assessor'
import { HttpError } from '../../../../../../lib/server/http'

export const runtime = 'nodejs'

/**
 * Inspect the repository ZIP: detect the (cloud-agnostic) stack + env vars and
 * store them on the RepositoryPackage. Then derive a default Azure
 * CloudInstallation (resources, secrets mapping, steps, readiness) from those
 * facts so the package is immediately installable.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { dbUser } = await requireAccountUser()

    const repository = await prisma.repositoryPackage.findUnique({
      where: { id },
      include: { account: true, documentUpload: true },
    })

    if (!repository || repository.account.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!repository.documentUpload) {
      return NextResponse.json({ error: 'No ZIP file linked to this repository' }, { status: 400 })
    }

    await prisma.repositoryPackage.update({
      where: { id },
      data: { status: 'inspecting' },
    })

    // ── Read ZIP from Spaces ────────────────────────────────────────────────
    const buffer = await getDocumentBuffer(repository.documentUpload.spacesKey)
    const files = await readZipFiles(buffer)

    // ── Cloud-agnostic inspection ───────────────────────────────────────────
    const stack = detectStack(files)
    const envVars = detectEnvVars(files)

    const detectedServices = {
      hasDatabase: stack.hasDatabase,
      hasPrisma: stack.hasPrisma,
      hasDockerfile: stack.hasDockerfile,
      hasDockerCompose: stack.hasDockerCompose,
      secretCount: envVars.filter((v) => v.classification === 'secret').length,
    }

    // ── Repository consistency check (runs before the cloud blueprint) ───────
    const consistency = checkConsistency(files, stack, envVars)

    await prisma.repositoryPackage.update({
      where: { id },
      data: {
        status: 'inspected',
        detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
        runtime: stack.language,
        packageManager: stack.packageManager,
        buildCommand: stack.buildCommand,
        startCommand: stack.startCommand,
        appType: stack.appType,
        detectedServicesJson: JSON.stringify(detectedServices),
        envVariablesJson: JSON.stringify(envVars),
        consistencyScore: consistency.score,
        consistencyFindingsJson: JSON.stringify(consistency),
      },
    })

    // ── Derive the default Azure cloud installation ─────────────────────────
    const azure = assessAzureReadiness(stack, envVars, files)

    const secretsMapping = envVars
      .filter((v) => v.classification === 'secret')
      .map((v) => ({
        name: v.name,
        target: 'azure_key_vault',
        reference: `@Microsoft.KeyVault(SecretUri=https://<KEYVAULT_NAME>.vault.azure.net/secrets/${v.name.replace(/_/g, '-')}/)`,
      }))

    const existing = await prisma.cloudInstallation.findFirst({
      where: { repositoryPackageId: id, provider: 'azure' },
    })

    const installationData = {
      readinessScore: azure.azureReadinessScore,
      cloudResourcesJson: JSON.stringify(azure.services),
      secretsMappingJson: JSON.stringify(secretsMapping),
      installStepsJson: JSON.stringify(azure.installSteps),
      risksJson: JSON.stringify({ blockers: azure.blockers, risks: azure.risks }),
      recommendationsJson: JSON.stringify({
        suitability: azure.suitability,
        recommendedPath: azure.recommendedPath,
        findings: azure.governanceFindings,
        assets: azure.buildScripts,
      }),
      status: 'ready',
    }

    const installation = existing
      ? await prisma.cloudInstallation.update({ where: { id: existing.id }, data: installationData })
      : await prisma.cloudInstallation.create({
          data: { repositoryPackageId: id, provider: 'azure', ...installationData },
        })

    return NextResponse.json({
      id,
      status: 'inspected',
      installationId: installation.id,
      provider: 'azure',
      readinessScore: azure.azureReadinessScore,
      detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
      runtime: stack.language,
      packageManager: stack.packageManager,
      buildCommand: stack.buildCommand,
      startCommand: stack.startCommand,
      appType: stack.appType,
      detectedServices,
      consistency,
      recommendedPath: azure.recommendedPath,
      suitability: azure.suitability,
      envVariables: envVars,
      services: azure.services,
      secretsMapping,
      blockers: azure.blockers,
      risks: azure.risks,
      installSteps: azure.installSteps,
    })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repositories/[id]/inspect]', err)

    try {
      const { id } = await params
      await prisma.repositoryPackage.update({ where: { id }, data: { status: 'failed' } })
    } catch { /* best-effort */ }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
