export type DocxParseResult = { text: string; messages: string[] }

export async function parseDocx(buffer: Buffer): Promise<DocxParseResult> {
  // mammoth must be installed: npm install mammoth
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require('mammoth') as {
    extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string; messages: { message: string }[] }>
  }
  const result = await mammoth.extractRawText({ buffer })
  return {
    text: result.value,
    messages: result.messages.map((m) => m.message),
  }
}
