import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../../lib/server/workspace-access'
import { generateAdminDocument } from '../../../../../../lib/repository/document-generator'
import { HttpError } from '../../../../../../lib/server/http'
import type { StackResult } from '../../../../../../lib/repository/stack-detector'
import type { EnvVariable } from '../../../../../../lib/repository/env-detector'
import type { AzureAssessment } from '../../../../../../lib/repository/azure-assessor'

export const runtime = 'nodejs'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { dbUser } = await requireWorkspaceUser()

    const assessment = await prisma.repositoryAssessment.findUnique({
      where: { id },
      include: { blueprint: { include: { client: true } } },
    })

    if (!assessment || assessment.blueprint.client.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (assessment.status !== 'complete') {
      return NextResponse.json({ error: 'Inspection must complete before generating document' }, { status: 400 })
    }

    // Reconstruct types from stored JSON
    const envVars: EnvVariable[] = assessment.envVariablesJson
      ? (JSON.parse(assessment.envVariablesJson) as EnvVariable[])
      : []

    const services = assessment.azureServicesJson
      ? (JSON.parse(assessment.azureServicesJson) as AzureAssessment['services'])
      : []

    const { blockers, risks } = assessment.risksJson
      ? (JSON.parse(assessment.risksJson) as { blockers: string[]; risks: string[] })
      : { blockers: [], risks: [] }

    const installSteps: string[] = assessment.installStepsJson
      ? (JSON.parse(assessment.installStepsJson) as string[])
      : []

    const { suitability, recommendedPath } = assessment.recommendationsJson
      ? (JSON.parse(assessment.recommendationsJson) as { suitability: AzureAssessment['suitability']; recommendedPath: string })
      : { suitability: 'suitable_with_changes' as const, recommendedPath: '' }

    const stack: StackResult = {
      language: assessment.runtime ?? 'unknown',
      framework: assessment.detectedStack ?? 'unknown',
      packageManager: assessment.packageManager ?? 'unknown',
      hasDockerfile: false,
      hasDockerCompose: false,
      buildCommand: assessment.buildCommand ?? null,
      startCommand: assessment.startCommand ?? null,
      appType: assessment.appType ?? 'unknown',
      nodeVersion: null,
      hasPrisma: envVars.some((v) => v.source.includes('prisma')),
      hasDatabase: services.some((s) => s.name.includes('PostgreSQL') || s.name.includes('Database')),
    }

    const partialAssessment: AzureAssessment = {
      azureReadinessScore: assessment.azureReadinessScore ?? 0,
      suitability,
      recommendedPath,
      services,
      blockers,
      risks,
      installSteps,
      governanceFindings: [],
      buildScripts: [],
    }

    const doc = generateAdminDocument(assessment.repositoryName, stack, envVars, partialAssessment)

    await prisma.repositoryAssessment.update({
      where: { id },
      data: { adminDocumentMarkdown: doc },
    })

    return NextResponse.json({ adminDocumentMarkdown: doc })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repository-assessment/[id]/generate-document]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
