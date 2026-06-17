import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/db'
import { requireWorkspaceUser } from '../../../../../../lib/server/workspace-access'
import { getDocumentBuffer } from '../../../../../../lib/server/spaces'
import { parseTerraform } from '../../../../../../lib/parsers/terraform-parser'
import { parseBicep } from '../../../../../../lib/parsers/bicep-parser'
import { parseArm } from '../../../../../../lib/parsers/arm-parser'
import { parseCsv } from '../../../../../../lib/parsers/csv-parser'
import { parseMarkdown } from '../../../../../../lib/parsers/markdown-parser'
import { parsePdf } from '../../../../../../lib/parsers/pdf-parser'
import { parseDocx } from '../../../../../../lib/parsers/docx-parser'
import { HttpError } from '../../../../../../lib/server/http'

export const runtime = 'nodejs'

type FindingInput = {
  findingType: string
  key?: string
  value?: string
  contextJson?: string
}

async function extractFindings(buffer: Buffer, fileType: string): Promise<FindingInput[]> {
  const findings: FindingInput[] = []

  if (fileType === 'terraform') {
    const result = parseTerraform(buffer.toString('utf-8'))
    for (const r of result.resources) {
      findings.push({ findingType: 'tf_resource', key: r.type, value: r.name })
    }
    for (const v of result.variables) {
      findings.push({ findingType: 'tf_variable', key: v.name })
    }
    for (const p of result.providers) {
      findings.push({ findingType: 'tf_provider', key: p })
    }
    for (const o of result.outputs) {
      findings.push({ findingType: 'tf_output', key: o })
    }
    return findings
  }

  if (fileType === 'bicep') {
    const result = parseBicep(buffer.toString('utf-8'))
    for (const r of result.resources) {
      findings.push({ findingType: 'bicep_resource', key: r.type, value: r.name, contextJson: JSON.stringify({ apiVersion: r.apiVersion }) })
    }
    for (const p of result.parameters) {
      findings.push({ findingType: 'bicep_param', key: p.name, value: p.dataType })
    }
    for (const v of result.variables) {
      findings.push({ findingType: 'bicep_var', key: v })
    }
    return findings
  }

  if (fileType === 'arm') {
    let template: Record<string, unknown>
    try {
      template = JSON.parse(buffer.toString('utf-8')) as Record<string, unknown>
    } catch {
      return [{ findingType: 'parse_error', key: 'json_parse', value: 'Invalid JSON in ARM template' }]
    }
    const result = parseArm(template)
    for (const r of result.resources) {
      findings.push({ findingType: 'arm_resource', key: r.type, value: r.name, contextJson: JSON.stringify({ apiVersion: r.apiVersion }) })
    }
    for (const p of result.parameters) {
      findings.push({ findingType: 'arm_param', key: p })
    }
    for (const v of result.variables) {
      findings.push({ findingType: 'arm_var', key: v })
    }
    return findings
  }

  if (fileType === 'csv') {
    const result = parseCsv(buffer.toString('utf-8'))
    findings.push({ findingType: 'csv_meta', key: 'export_type', value: result.exportType })
    findings.push({ findingType: 'csv_meta', key: 'total_rows', value: String(result.totalRows) })
    findings.push({ findingType: 'csv_meta', key: 'headers', contextJson: JSON.stringify(result.headers) })
    // Store first 50 rows as compact JSON to keep finding count manageable
    const sample = result.rows.slice(0, 50)
    if (sample.length > 0) {
      findings.push({ findingType: 'csv_sample', key: 'rows', contextJson: JSON.stringify(sample) })
    }
    return findings
  }

  if (fileType === 'markdown') {
    const result = parseMarkdown(buffer.toString('utf-8'))
    for (const h of result.headings) {
      findings.push({ findingType: 'md_heading', value: h })
    }
    for (const f of result.codeFences) {
      findings.push({ findingType: 'md_code_fence', key: f.language, value: f.content.slice(0, 200) })
    }
    return findings
  }

  if (fileType === 'pdf') {
    const result = await parsePdf(buffer)
    findings.push({ findingType: 'pdf_meta', key: 'num_pages', value: String(result.numPages) })
    // Store text in chunks of ~2000 chars
    const text = result.text.slice(0, 20000)
    findings.push({ findingType: 'pdf_text', value: text })
    return findings
  }

  if (fileType === 'docx') {
    const result = await parseDocx(buffer)
    findings.push({ findingType: 'docx_text', value: result.text.slice(0, 20000) })
    if (result.messages.length > 0) {
      findings.push({ findingType: 'docx_warnings', contextJson: JSON.stringify(result.messages) })
    }
    return findings
  }

  if (fileType === 'screenshot') {
    findings.push({ findingType: 'screenshot', key: 'size_bytes', value: String(buffer.byteLength) })
    return findings
  }

  return [{ findingType: 'unknown_type', key: 'fileType', value: fileType }]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params
    const { dbUser } = await requireWorkspaceUser()

    const doc = await prisma.documentUpload.findUnique({
      where: { id: documentId },
      include: { blueprint: { include: { client: true } } },
    })

    if (!doc || doc.blueprint.client.userId !== dbUser.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const buffer = await getDocumentBuffer(doc.spacesKey)
    const findings = await extractFindings(buffer, doc.fileType)

    await prisma.$transaction([
      prisma.documentFinding.deleteMany({ where: { documentUploadId: documentId } }),
      ...findings.map((f) =>
        prisma.documentFinding.create({
          data: {
            documentUploadId: documentId,
            findingType: f.findingType,
            key: f.key,
            value: f.value,
            contextJson: f.contextJson,
          },
        })
      ),
    ])

    await prisma.documentUpload.update({
      where: { id: documentId },
      data: { parseStatus: 'parsed', parsedAt: new Date() },
    })

    return NextResponse.json({ findingsCount: findings.length, parseStatus: 'parsed' })
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[POST /api/v1/documents/[documentId]/parse]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
