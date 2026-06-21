import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../../lib/db'
import { requireAccountUser, requireInstallationOwnership } from '../../../../../../../../lib/server/account-access'
import { generateStakeholderReport, generateEngineerReport } from '../../../../../../../../lib/repository/report-generator'
import { HttpError } from '../../../../../../../../lib/server/http'
import type { StackResult } from '../../../../../../../../lib/repository/stack-detector'
import type { EnvVariable } from '../../../../../../../../lib/repository/env-detector'
import type { AzureAssessment } from '../../../../../../../../lib/repository/azure-assessor'
import type { ConsistencyReport } from '../../../../../../../../lib/repository/consistency-checker'

export const runtime = 'nodejs'

/**
 * Generate (or regenerate) the stakeholder + engineer handover report for a
 * cloud installation, reconstructing the inputs from stored package/install data.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ installId: string }> }
) {
  try {
    const { installId } = await params
    const { dbUser } = await requireAccountUser()

    const installation = await requireInstallationOwnership(installId, dbUser.id)
    const repository = installation.package

    if (installation.readinessScore === null) {
      return NextResponse.json(
        { error: 'Inspect the repository before generating a handover report' },
        { status: 400 }
      )
    }

    // Reconstruct inputs from stored JSON
    const envVars: EnvVariable[] = repository.envVariablesJson
      ? (JSON.parse(repository.envVariablesJson) as EnvVariable[])
      : []

    const services = installation.cloudResourcesJson
      ? (JSON.parse(installation.cloudResourcesJson) as AzureAssessment['services'])
      : []

    const { blockers, risks } = installation.risksJson
      ? (JSON.parse(installation.risksJson) as { blockers: string[]; risks: string[] })
      : { blockers: [], risks: [] }

    const installSteps: string[] = installation.installStepsJson
      ? (JSON.parse(installation.installStepsJson) as string[])
      : []

    const { suitability, recommendedPath } = installation.recommendationsJson
      ? (JSON.parse(installation.recommendationsJson) as {
          suitability: AzureAssessment['suitability']
          recommendedPath: string
        })
      : { suitability: 'suitable_with_changes' as const, recommendedPath: '' }

    const stack: StackResult = {
      language: repository.runtime ?? 'unknown',
      framework: repository.detectedStack ?? 'unknown',
      packageManager: repository.packageManager ?? 'unknown',
      hasDockerfile: false,
      hasDockerCompose: false,
      buildCommand: repository.buildCommand ?? null,
      startCommand: repository.startCommand ?? null,
      appType: repository.appType ?? 'unknown',
      nodeVersion: null,
      hasPrisma: envVars.some((v) => v.source.includes('prisma')),
      hasDatabase: services.some((s) => s.name.includes('PostgreSQL') || s.name.includes('Database')),
    }

    const assessment: AzureAssessment = {
      azureReadinessScore: installation.readinessScore ?? 0,
      suitability,
      recommendedPath,
      services,
      blockers,
      risks,
      installSteps,
      governanceFindings: [],
      buildScripts: [],
    }

    const consistency = repository.consistencyFindingsJson
      ? (JSON.parse(repository.consistencyFindingsJson) as ConsistencyReport)
      : undefined

    const stakeholderMarkdown = generateStakeholderReport(
      repository.name,
      installation.provider,
      stack,
      envVars,
      assessment,
      consistency
    )
    const engineerMarkdown = generateEngineerReport(repository.name, stack, envVars, assessment, consistency)

    const report = await prisma.handoverReport.upsert({
      where: { cloudInstallationId: installId },
      update: { stakeholderMarkdown, engineerMarkdown },
      create: { cloudInstallationId: installId, stakeholderMarkdown, engineerMarkdown },
    })

    return NextResponse.json({
      id: report.id,
      stakeholderMarkdown,
      engineerMarkdown,
    })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repositories/[id]/installations/[installId]/report]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
