export type PdfParseResult = { text: string; numPages: number }

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  // pdf-parse must be installed: npm install pdf-parse @types/pdf-parse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
  const result = await pdfParse(buffer)
  return { text: result.text, numPages: result.numpages }
}
