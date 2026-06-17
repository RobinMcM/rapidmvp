export type TfResource = { type: string; name: string }
export type TfVariable = { name: string }
export type TerraformParseResult = {
  resources: TfResource[]
  variables: TfVariable[]
  providers: string[]
  outputs: string[]
}

export function parseTerraform(content: string): TerraformParseResult {
  const resources: TfResource[] = []
  const variables: TfVariable[] = []
  const providers: string[] = []
  const outputs: string[] = []

  const resourceRe = /^resource\s+"([^"]+)"\s+"([^"]+)"/gm
  let m: RegExpExecArray | null
  while ((m = resourceRe.exec(content)) !== null) {
    resources.push({ type: m[1], name: m[2] })
  }

  const variableRe = /^variable\s+"([^"]+)"/gm
  while ((m = variableRe.exec(content)) !== null) {
    variables.push({ name: m[1] })
  }

  const providerRe = /^provider\s+"([^"]+)"/gm
  while ((m = providerRe.exec(content)) !== null) {
    providers.push(m[1])
  }

  const outputRe = /^output\s+"([^"]+)"/gm
  while ((m = outputRe.exec(content)) !== null) {
    outputs.push(m[1])
  }

  return { resources, variables, providers, outputs }
}
