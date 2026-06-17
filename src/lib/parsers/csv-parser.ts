export type CsvParseResult = {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
  exportType: 'azure_cost' | 'azure_advisor' | 'unknown'
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function detectExportType(headers: string[]): CsvParseResult['exportType'] {
  const h = headers.map((s) => s.toLowerCase())
  if (h.includes('date') && h.includes('subscriptionid') && h.includes('metercategory')) {
    return 'azure_cost'
  }
  if (h.includes('recommendationtypeid') && h.includes('impact') && h.includes('category')) {
    return 'azure_advisor'
  }
  return 'unknown'
}

export function parseCsv(content: string): CsvParseResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0, exportType: 'unknown' }
  }

  const headers = parseCsvLine(lines[0])
  const exportType = detectExportType(headers)
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? ''
    })
    rows.push(row)
  }

  return { headers, rows, totalRows: rows.length, exportType }
}
