import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../../lib/server/workspace-access'
import { getDocumentBuffer } from '../../../../../../lib/server/spaces'
import { readZipFiles } from '../../../../../../lib/repository/zip-reader'
import { detectStack } from '../../../../../../lib/repository/stack-detector'
import { detectEnvVars } from '../../../../../../lib/repository/env-detector'
import { assessAzureReadiness } from '../../../../../../lib/repository/azure-assessor'
import { generateAdminDocument } from '../../../../../../lib/repository/document-generator'
import { HttpError } from '../../../../../../lib/server/http'

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
      include: {
        blueprint: { include: { client: true } },
        documentUpload: true,
      },
    })

    if (!assessment || assessment.blueprint.client.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!assessment.documentUpload) {
      return NextResponse.json({ error: 'No ZIP file linked to this assessment' }, { status: 400 })
    }

    await prisma.repositoryAssessment.update({
      where: { id },
      data: { status: 'inspecting' },
    })

    // ── Read ZIP from Spaces ────────────────────────────────────────────────
    const buffer = await getDocumentBuffer(assessment.documentUpload.spacesKey)
    const files = await readZipFiles(buffer)

    // ── Deterministic analysis ──────────────────────────────────────────────
    const stack = detectStack(files)
    const envVars = detectEnvVars(files)
    const azureAssessment = assessAzureReadiness(stack, envVars, files)
    const adminDoc = generateAdminDocument(assessment.repositoryName, stack, envVars, azureAssessment)

    // ── Persist assessment results ──────────────────────────────────────────
    const blueprintId = assessment.clientBlueprintId

    await prisma.repositoryAssessment.update({
      where: { id },
      data: {
        status: 'complete',
        azureReadinessScore: azureAssessment.azureReadinessScore,
        detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
        runtime: stack.language,
        packageManager: stack.packageManager,
        buildCommand: stack.buildCommand,
        startCommand: stack.startCommand,
        appType: stack.appType,
        envVariablesJson: JSON.stringify(envVars),
        azureServicesJson: JSON.stringify(azureAssessment.services),
        installStepsJson: JSON.stringify(azureAssessment.installSteps),
        risksJson: JSON.stringify({ blockers: azureAssessment.blockers, risks: azureAssessment.risks }),
        recommendationsJson: JSON.stringify({
          suitability: azureAssessment.suitability,
          recommendedPath: azureAssessment.recommendedPath,
        }),
        adminDocumentMarkdown: adminDoc,
      },
    })

    // ── Create ArchitectureFinding records ──────────────────────────────────
    if (azureAssessment.governanceFindings.length > 0) {
      await prisma.architectureFinding.createMany({
        data: azureAssessment.governanceFindings.map((f) => ({
          clientBlueprintId: blueprintId,
          documentUploadId: assessment.documentUploadId,
          category: f.category,
          severity: f.severity,
          finding: f.finding,
          recommendation: f.recommendation,
          aiGenerated: false,
        })),
      })
    }

    // ── Create BuildScript records ──────────────────────────────────────────
    if (azureAssessment.buildScripts.length > 0) {
      // Remove previous build scripts from this repository assessment before inserting
      // (identify by title prefix to avoid duplicates on re-inspect)
      const scriptTitles = azureAssessment.buildScripts.map((s) => s.title)
      await prisma.buildScript.deleteMany({
        where: { clientBlueprintId: blueprintId, title: { in: scriptTitles } },
      })

      await prisma.buildScript.createMany({
        data: azureAssessment.buildScripts.map((s) => ({
          clientBlueprintId: blueprintId,
          scriptType: s.scriptType,
          title: s.title,
          content: s.content,
          explanation: s.explanation,
          requiredSecrets: envVars
            .filter((v) => v.classification === 'secret')
            .map((v) => v.name)
            .join(', ') || null,
        })),
      })
    }

    return NextResponse.json({
      id,
      status: 'complete',
      azureReadinessScore: azureAssessment.azureReadinessScore,
      detectedStack: stack.framework !== 'unknown' ? stack.framework : stack.language,
      runtime: stack.language,
      packageManager: stack.packageManager,
      buildCommand: stack.buildCommand,
      startCommand: stack.startCommand,
      appType: stack.appType,
      recommendedPath: azureAssessment.recommendedPath,
      suitability: azureAssessment.suitability,
      envVariables: envVars,
      services: azureAssessment.services,
      blockers: azureAssessment.blockers,
      risks: azureAssessment.risks,
      installSteps: azureAssessment.installSteps,
      governanceFindingsCreated: azureAssessment.governanceFindings.length,
      buildScriptsCreated: azureAssessment.buildScripts.length,
      adminDocumentMarkdown: adminDoc,
    })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/repository-assessment/[id]/inspect]', err)

    // Mark as failed
    try {
      const { id } = await params
      await prisma.repositoryAssessment.update({
        where: { id },
        data: { status: 'failed' },
      })
    } catch { /* best-effort */ }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
