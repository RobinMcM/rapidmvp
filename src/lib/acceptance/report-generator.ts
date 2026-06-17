import Anthropic from '@anthropic-ai/sdk'
import { scoreAcceptanceCategories, type AcceptanceCategoryResult } from '../../types/acceptance'

const MODEL = 'claude-haiku-4-5'

type AssessmentRow = { layer: string; status: string }
type FindingRow = { category: string; severity: string; finding: string }

let client: Anthropic | null = null
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

async function generateNarratives(
  categories: Omit<AcceptanceCategoryResult, 'aiNarrative'>[],
  blueprintSlug: string
): Promise<string[]> {
  const compact = categories.map((c) => ({ name: c.name, status: c.status }))

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      'You are an expert cloud architecture governance reviewer. You write concise, client-friendly validation narratives for architecture acceptance reports. Respond with a JSON array of strings — one narrative per category, matching the input order. Each narrative is 1-2 sentences maximum.',
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          blueprintSlug,
          task: 'Write a concise 1-2 sentence validation narrative for each category. Use plain text only — no markdown, no lists.',
          categories: compact,
        }),
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        json_schema: {
          name: 'acceptance_narratives',
          schema: {
            type: 'object' as const,
            properties: {
              narratives: { type: 'array' as const, items: { type: 'string' as const } },
            },
            required: ['narratives'],
          },
        },
      },
    },
  } as Parameters<Anthropic['messages']['create']>[0])

  const text = response.content.find((b) => b.type === 'text')?.text ?? '{}'
  const parsed = JSON.parse(text) as { narratives?: string[] }
  return parsed.narratives ?? categories.map(() => '')
}

export async function generateAcceptanceReport(
  assessments: AssessmentRow[],
  findings: FindingRow[],
  blueprintSlug: string
): Promise<{ categories: AcceptanceCategoryResult[]; overallStatus: string }> {
  const scored = scoreAcceptanceCategories(assessments, findings)
  const narratives = await generateNarratives(scored, blueprintSlug)

  const categories: AcceptanceCategoryResult[] = scored.map((c, i) => ({
    ...c,
    aiNarrative: narratives[i] ?? '',
  }))

  const failCount = categories.filter((c) => c.status === 'fail').length
  const passCount = categories.filter((c) => c.status === 'pass').length
  const overallStatus =
    failCount > 2 ? 'fail' : passCount === categories.length ? 'pass' : 'partial'

  return { categories, overallStatus }
}
