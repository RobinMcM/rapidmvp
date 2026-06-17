export type LeakageItem = {
  category: string
  description: string
  estimatedImpact: 'low' | 'medium' | 'high'
  source: 'csv' | 'iac' | 'advisor' | 'assessment'
}

export type RiskDecision = {
  tier: 'high' | 'moderate' | 'acceptable'
  tierLabel: string
  scoreRange: string
  action: string
}

export type FinancialScoreResult = {
  score: number
  leakageItems: LeakageItem[]
  riskDecision: RiskDecision
}

type FindingRow = { findingType: string; key: string | null; value: string | null; contextJson: string | null }
type ArchFinding = { category: string; severity: string }
type Assessment = { layer: string; status: string }

const RISK_DECISIONS: RiskDecision[] = [
  {
    tier: 'high',
    tierLabel: 'High Financial Risk',
    scoreRange: '0 – 39',
    action: 'Escalate to client leadership. Freeze non-critical spend pending remediation.',
  },
  {
    tier: 'moderate',
    tierLabel: 'Moderate Financial Risk',
    scoreRange: '40 – 69',
    action: 'Define remediation roadmap within 90 days. Prioritise tagging and budget alerts.',
  },
  {
    tier: 'acceptable',
    tierLabel: 'Acceptable Financial Posture',
    scoreRange: '70 – 100',
    action: 'Maintain governance cadence. Review quarterly.',
  },
]

function getRiskDecision(score: number): RiskDecision {
  if (score <= 39) return RISK_DECISIONS[0]
  if (score <= 69) return RISK_DECISIONS[1]
  return RISK_DECISIONS[2]
}

export function calculateFinancialScore(
  csvFindings: FindingRow[],
  architectureFindings: ArchFinding[],
  assessments: Assessment[]
): FinancialScoreResult {
  let score = 100
  const leakageItems: LeakageItem[] = []

  // Check for cost tagging evidence in assessments
  const hasCostTagging = assessments.some(
    (a) => a.layer.toLowerCase().includes('cost') || a.layer.toLowerCase().includes('tagging')
  )
  if (!hasCostTagging) {
    score -= 15
    leakageItems.push({
      category: 'Cost Tagging',
      description: 'No cost tagging or governance layer found in assessment',
      estimatedImpact: 'high',
      source: 'assessment',
    })
  }

  // Check for budget alert evidence in assessments
  const hasBudgetAlerts = assessments.some(
    (a) =>
      a.layer.toLowerCase().includes('budget') ||
      a.layer.toLowerCase().includes('alert') ||
      a.layer.toLowerCase().includes('monitor')
  )
  if (!hasBudgetAlerts) {
    score -= 10
    leakageItems.push({
      category: 'Budget Alerts',
      description: 'No budget alert or monitoring layer found in assessment',
      estimatedImpact: 'medium',
      source: 'assessment',
    })
  }

  // Check for DR cost allocation
  const hasDrCost = assessments.some(
    (a) => a.layer.toLowerCase().includes('dr') || a.layer.toLowerCase().includes('disaster recovery')
  )
  if (!hasDrCost) {
    score -= 10
    leakageItems.push({
      category: 'DR Cost Allocation',
      description: 'No disaster recovery cost allocation found in assessment layers',
      estimatedImpact: 'medium',
      source: 'assessment',
    })
  }

  // Check for FinOps evidence
  const hasFinOps = assessments.some(
    (a) => a.layer.toLowerCase().includes('finop') || a.layer.toLowerCase().includes('cost governance')
  )
  if (!hasFinOps) {
    score -= 10
    leakageItems.push({
      category: 'FinOps Practice',
      description: 'No FinOps practice evidence found in assessment',
      estimatedImpact: 'low',
      source: 'assessment',
    })
  }

  // Check CSV findings for Azure Advisor issues
  const advisorFindings = csvFindings.filter((f) => f.findingType === 'csv_meta' && f.value === 'azure_advisor')
  if (advisorFindings.length > 0) {
    score -= 10
    leakageItems.push({
      category: 'Unresolved Advisor Recommendations',
      description: 'Azure Advisor cost recommendations CSV detected — review and resolve recommendations',
      estimatedImpact: 'high',
      source: 'advisor',
    })
  }

  // Check for idle/unallocated resources in CSV
  const csvSample = csvFindings.find((f) => f.findingType === 'csv_sample')
  if (csvSample?.contextJson) {
    try {
      const rows = JSON.parse(csvSample.contextJson) as Record<string, string>[]
      const hasMissingTags = rows.some(
        (r) => !r['ResourceGroupName'] || r['ResourceGroupName'] === ''
      )
      if (hasMissingTags) {
        score -= 10
        leakageItems.push({
          category: 'Missing Resource Tags',
          description: 'Cost CSV contains resources with missing or empty ResourceGroupName — potential cost allocation gap',
          estimatedImpact: 'high',
          source: 'csv',
        })
      }
    } catch {
      // JSON parse failure — skip
    }
  }

  // Check IaC for missing cost governance
  const hasCostGovernanceInIaC = csvFindings.some(
    (f) => f.findingType === 'tf_resource' && (f.key ?? '').toLowerCase().includes('budget')
  )
  if (!hasCostGovernanceInIaC) {
    score -= 10
    leakageItems.push({
      category: 'IaC Cost Governance',
      description: 'No budget or cost management resource found in IaC findings',
      estimatedImpact: 'low',
      source: 'iac',
    })
  }

  // Critical financial findings from architecture analysis
  const criticalCostFindings = architectureFindings.filter(
    (f) => f.severity === 'critical' && f.category.toLowerCase().includes('cost')
  )
  if (criticalCostFindings.length > 0) {
    score -= Math.min(15, criticalCostFindings.length * 5)
    leakageItems.push({
      category: 'Critical Architecture Cost Findings',
      description: `${criticalCostFindings.length} critical cost-related finding(s) from architecture document analysis`,
      estimatedImpact: 'high',
      source: 'iac',
    })
  }

  score = Math.max(0, score)

  return { score, leakageItems, riskDecision: getRiskDecision(score) }
}
