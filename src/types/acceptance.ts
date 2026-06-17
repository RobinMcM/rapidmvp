export type AcceptanceCategoryStatus = 'pass' | 'partial' | 'fail' | 'not_assessed'

export type AcceptanceCategoryResult = {
  name: string
  status: AcceptanceCategoryStatus
  notes: string
  aiNarrative: string
}

export const ACCEPTANCE_CATEGORIES: string[] = [
  'Identity & Access Management',
  'Network Security & Perimeter',
  'Data Encryption at Rest',
  'Data Encryption in Transit',
  'Compliance & Regulatory Alignment',
  'Business Continuity & Disaster Recovery',
  'Monitoring, Logging & Observability',
  'Incident Response & Alerting',
  'Patch & Vulnerability Management',
  'Cost Governance & Tagging',
  'Infrastructure as Code Quality',
  'CI/CD Pipeline & Deployment Controls',
  'Data Residency & Sovereignty',
  'Third-party Integration Risk',
  'Scalability & Performance Posture',
]

const CATEGORY_LAYER_MAP: Record<string, string[]> = {
  'Identity & Access Management': ['identity', 'auth', 'rbac', 'iam', 'access'],
  'Network Security & Perimeter': ['network', 'firewall', 'perimeter', 'endpoint', 'vpn', 'zero trust'],
  'Data Encryption at Rest': ['storage', 'database', 'encryption', 'kms', 'key vault'],
  'Data Encryption in Transit': ['tls', 'ssl', 'transit', 'https', 'certificate'],
  'Compliance & Regulatory Alignment': ['compliance', 'gdpr', 'pci', 'iso', 'audit'],
  'Business Continuity & Disaster Recovery': ['dr', 'backup', 'disaster recovery', 'rto', 'rpo', 'failover'],
  'Monitoring, Logging & Observability': ['monitoring', 'logging', 'observability', 'alerts', 'metrics'],
  'Incident Response & Alerting': ['incident', 'alerting', 'oncall', 'response', 'runbook'],
  'Patch & Vulnerability Management': ['patch', 'vulnerability', 'cve', 'scanning', 'updates'],
  'Cost Governance & Tagging': ['cost', 'tagging', 'budget', 'finops', 'billing'],
  'Infrastructure as Code Quality': ['iac', 'terraform', 'bicep', 'arm', 'pulumi', 'infrastructure'],
  'CI/CD Pipeline & Deployment Controls': ['cicd', 'pipeline', 'deployment', 'github actions', 'devops'],
  'Data Residency & Sovereignty': ['residency', 'sovereignty', 'region', 'data location', 'gdpr'],
  'Third-party Integration Risk': ['third-party', 'vendor', 'api', 'integration', 'dependency'],
  'Scalability & Performance Posture': ['scale', 'performance', 'load', 'autoscale', 'latency'],
}

type AssessmentRow = {
  layer: string
  status: string
}

type FindingRow = {
  category: string
  severity: string
}

function scoreCategoryFromAssessments(categoryName: string, assessments: AssessmentRow[]): AcceptanceCategoryStatus {
  const keywords = CATEGORY_LAYER_MAP[categoryName] ?? []
  const relevant = assessments.filter((a) =>
    keywords.some((kw) => a.layer.toLowerCase().includes(kw))
  )

  if (relevant.length === 0) return 'not_assessed'

  const allValidated = relevant.every((a) => ['validated', 'production_ready', 'live'].includes(a.status))
  const anyBlocked = relevant.some((a) => a.status === 'blocked')

  if (allValidated) return 'pass'
  if (anyBlocked) return 'fail'
  return 'partial'
}

function applyFindingPenalties(status: AcceptanceCategoryStatus, categoryName: string, findings: FindingRow[]): AcceptanceCategoryStatus {
  const categoryKeywords = categoryName.toLowerCase()
  const relevant = findings.filter((f) =>
    f.category.toLowerCase().includes(categoryKeywords) ||
    categoryKeywords.includes(f.category.toLowerCase())
  )

  const hasCritical = relevant.some((f) => f.severity === 'critical')
  const hasWarning = relevant.some((f) => f.severity === 'warning')

  if (hasCritical && status !== 'fail') return 'fail'
  if (hasWarning && status === 'pass') return 'partial'
  return status
}

export function scoreAcceptanceCategories(
  assessments: AssessmentRow[],
  findings: FindingRow[]
): Omit<AcceptanceCategoryResult, 'aiNarrative'>[] {
  return ACCEPTANCE_CATEGORIES.map((name) => {
    const baseStatus = scoreCategoryFromAssessments(name, assessments)
    const status = applyFindingPenalties(baseStatus, name, findings)
    const notes = `Based on ${assessments.length} assessment layers and ${findings.length} architecture findings.`
    return { name, status, notes }
  })
}
