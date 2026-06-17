export type BicepResource = { name: string; type: string; apiVersion: string }
export type BicepParam = { name: string; dataType: string }
export type BicepParseResult = {
  resources: BicepResource[]
  parameters: BicepParam[]
  variables: string[]
}

export function parseBicep(content: string): BicepParseResult {
  const resources: BicepResource[] = []
  const parameters: BicepParam[] = []
  const variables: string[] = []

  // resource name 'type@apiVersion' = { ... }
  const resourceRe = /^resource\s+(\w+)\s+'([^@']+)@([^']+)'/gm
  let m: RegExpExecArray | null
  while ((m = resourceRe.exec(content)) !== null) {
    resources.push({ name: m[1], type: m[2], apiVersion: m[3] })
  }

  // param name dataType
  const paramRe = /^param\s+(\w+)\s+(\w+)/gm
  while ((m = paramRe.exec(content)) !== null) {
    parameters.push({ name: m[1], dataType: m[2] })
  }

  // var name
  const varRe = /^var\s+(\w+)/gm
  while ((m = varRe.exec(content)) !== null) {
    variables.push(m[1])
  }

  return { resources, parameters, variables }
}
