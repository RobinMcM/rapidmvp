// @anthropic-ai/sdk must be installed: npm install @anthropic-ai/sdk
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-haiku-4-5'

export type AnalysisResult = {
  category: string
  severity: 'info' | 'warning' | 'critical'
  finding: string
  recommendation: string
}

type FindingRow = {
  findingType: string
  key: string | null
  value: string | null
  contextJson: string | null
}

type ArchFinding = {
  category: string
  severity: string
  finding: string
  recommendation: string | null
}

let client: Anthropic | null = null

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return client
}

const ANALYSIS_SYSTEM_PROMPT =
  'You are an expert cloud architecture reviewer. You receive structured findings extracted deterministically from IaC files, cost reports, or architecture documents. Respond with structured JSON only. Never include markdown fences or prose outside the JSON.'

const ANALYSIS_JSON_SCHEMA = {
  name: 'architecture_findings',
  description: 'List of architecture findings from document analysis',
  schema: {
    type: 'object' as const,
    properties: {
      findings: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            category: { type: 'string' as const },
            severity: { type: 'string' as const, enum: ['info', 'warning', 'critical'] },
            finding: { type: 'string' as const },
            recommendation: { type: 'string' as const },
          },
          required: ['category', 'severity', 'finding', 'recommendation'],
        },
      },
    },
    required: ['findings'],
  },
}

export async function analyseDocumentFindings(
  findings: FindingRow[],
  fileType: string,
  blueprintSlug: string
): Promise<AnalysisResult[]> {
  const compact = findings.map((f) => ({
    type: f.findingType,
    key: f.key,
    value: f.value ? f.value.slice(0, 300) : undefined,
  }))

  const userMessage = JSON.stringify({
    fileType,
    blueprintSlug,
    findingsCount: compact.length,
    findings: compact,
  })

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    output_config: {
      format: {
        type: 'json_schema',
        json_schema: ANALYSIS_JSON_SCHEMA,
      },
    },
  } as Parameters<Anthropic['messages']['create']>[0]) as Anthropic.Message

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}'
  const parsed = JSON.parse(text) as { findings?: AnalysisResult[] }
  return parsed.findings ?? []
}

export async function generateArchitectureSummary(
  findings: ArchFinding[],
  blueprintSlug: string
): Promise<string> {
  const compact = findings.map((f) => ({
    category: f.category,
    severity: f.severity,
    finding: f.finding,
  }))

  const userMessage = JSON.stringify({
    blueprintSlug,
    findingsCount: compact.length,
    findings: compact,
    task: 'Write a concise 2-3 paragraph architecture governance summary based on these findings. Focus on the most critical issues and the overall risk posture. Use plain text only.',
  })

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 512,
    system: 'You are an expert cloud architecture reviewer. Write concise, plain-text summaries. No markdown, no lists, no headings — prose only.',
    messages: [{ role: 'user', content: userMessage }],
  })

  return response.content.find((b) => b.type === 'text')?.text ?? ''
}
