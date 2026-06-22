import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSSRSession } from 'supertokens-node/nextjs'
import { ensureSuperTokensInit } from '../../../lib/auth/supertokens-backend'
import { requireAccountUser, requireRepositoryOwnership } from '../../../lib/server/account-access'
import { prisma } from '../../../lib/db'
import RepositoryDetailView, { type RepositoryDetail } from '../../../components/repository/RepositoryDetailView'
import type { ConsistencyReport } from '../../../lib/repository/consistency-checker'
import type { DetectedService } from '../../../lib/repository/service-detector'
import { buildArchitectureModel } from '../../../lib/repository/architecture-model'
import type { MigrationPlan, Assumption, Clarification } from '../../../lib/repository/migration-mapper'
import type { OperationalConfidence } from '../../../lib/repository/operational-confidence'

export const runtime = 'nodejs'

type EnvVariable = {
  name: string
  classification: 'required' | 'optional' | 'public' | 'secret' | 'unknown'
  hasValue: boolean
  source: string
}

type AzureService = { name: string; tier: string; reason: string; required: boolean }
type SecretMapping = { name: string; target: string; reference: string }

function parseJson<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T } catch { return fallback }
}

const STATUS_LABEL: Record<string, string> = {
  uploaded:   'Uploaded',
  inspecting: 'Inspecting',
  inspected:  'Inspected',
  failed:     'Failed',
}

export default async function RepositoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  ensureSuperTokensInit()

  const cookieStore = await cookies()
  const { hasToken, error } = await getSSRSession(
    cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }))
  )

  if (error || !hasToken) {
    redirect('/auth?redirectTo=/repositories')
  }

  const { id } = await params
  const { dbUser } = await requireAccountUser()
  await requireRepositoryOwnership(id, dbUser.id)

  const repository = await prisma.repositoryPackage.findUnique({
    where: { id },
    include: {
      installations: {
        where: { provider: 'azure' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { handoverReport: true },
      },
    },
  })

  if (!repository) {
    redirect('/repositories')
  }

  const installation = repository.installations[0] ?? null
  const recs = parseJson<{ suitability: string; recommendedPath: string }>(
    installation?.recommendationsJson ?? null,
    { suitability: 'unknown', recommendedPath: '—' }
  )
  const risks = parseJson<{ blockers: string[]; risks: string[] }>(
    installation?.risksJson ?? null,
    { blockers: [], risks: [] }
  )

  const detectedServices = parseJson<{ hasDatabase?: boolean; hasPrisma?: boolean; services?: DetectedService[] }>(
    repository.detectedServicesJson,
    {}
  )
  const azureServices = parseJson<AzureService[]>(installation?.cloudResourcesJson ?? null, [])
  const envVariables = parseJson<EnvVariable[]>(repository.envVariablesJson, [])

  const migrationPlan = parseJson<MigrationPlan | null>(installation?.migrationMappingJson ?? null, null)
  const operational = parseJson<OperationalConfidence | null>(installation?.operationalConfidenceJson ?? null, null)
  const assumptions = parseJson<Assumption[]>(installation?.assumptionsJson ?? null, [])
  const clarifications = parseJson<Clarification[]>(installation?.clarificationsJson ?? null, [])

  const architecture =
    repository.status === 'inspected'
      ? buildArchitectureModel({
          appType: repository.appType,
          detectedStack: repository.detectedStack,
          runtime: repository.runtime,
          hasDatabase: detectedServices.hasDatabase ?? false,
          hasPrisma: detectedServices.hasPrisma ?? false,
          detectedServices: detectedServices.services ?? [],
          envVarCount: envVariables.length,
          azureServices,
        })
      : null

  const initial: RepositoryDetail = {
    repositoryId: repository.id,
    name: repository.name,
    status: repository.status,
    detectedStack: repository.detectedStack,
    runtime: repository.runtime,
    packageManager: repository.packageManager,
    buildCommand: repository.buildCommand,
    startCommand: repository.startCommand,
    appType: repository.appType,
    architecture,
    envVariables,
    consistency: repository.consistencyFindingsJson
      ? parseJson<ConsistencyReport | null>(repository.consistencyFindingsJson, null)
      : null,
    installationId: installation?.id ?? null,
    readinessScore: installation?.readinessScore ?? null,
    suitability: recs.suitability,
    recommendedPath: recs.recommendedPath,
    services: azureServices,
    blockers: risks.blockers,
    risks: risks.risks,
    installSteps: parseJson<string[]>(installation?.installStepsJson ?? null, []),
    secretsMapping: parseJson<SecretMapping[]>(installation?.secretsMappingJson ?? null, []),
    migrationPlan,
    operational,
    assumptions,
    clarifications,
    stakeholderMarkdown: installation?.handoverReport?.stakeholderMarkdown ?? null,
    engineerMarkdown: installation?.handoverReport?.engineerMarkdown ?? null,
  }

  return (
    <div className="bg-rm-black min-h-screen">
      <div className="bg-rm-dark border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Repository Package</p>
          <h1 className="text-white font-bold text-xl">{repository.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[11px] text-slate-500">{repository.slug}</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">
              {STATUS_LABEL[repository.status] ?? repository.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <RepositoryDetailView initial={initial} />
      </div>
    </div>
  )
}
