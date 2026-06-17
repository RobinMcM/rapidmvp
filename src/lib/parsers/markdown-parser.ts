export type CodeFence = { language: string; content: string }
export type MarkdownParseResult = {
  headings: string[]
  codeFences: CodeFence[]
  links: string[]
}

export function parseMarkdown(content: string): MarkdownParseResult {
  const headings: string[] = []
  const codeFences: CodeFence[] = []
  const links: string[] = []

  const headingRe = /^#{1,6}\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = headingRe.exec(content)) !== null) {
    headings.push(m[1].trim())
  }

  const fenceRe = /```(\w*)\n([\s\S]*?)```/g
  while ((m = fenceRe.exec(content)) !== null) {
    codeFences.push({ language: m[1] ?? '', content: m[2] ?? '' })
  }

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  while ((m = linkRe.exec(content)) !== null) {
    links.push(m[2])
  }

  return { headings, codeFences, links }
}
