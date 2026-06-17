export type ArmResource = { type: string; name: string; apiVersion: string }
export type ArmParseResult = {
  resources: ArmResource[]
  parameters: string[]
  variables: string[]
}

export function parseArm(template: Record<string, unknown>): ArmParseResult {
  const resources: ArmResource[] = []
  const parameters: string[] = []
  const variables: string[] = []

  const rawResources = template.resources
  if (Array.isArray(rawResources)) {
    for (const r of rawResources) {
      if (r && typeof r === 'object') {
        const res = r as Record<string, unknown>
        resources.push({
          type: String(res.type ?? ''),
          name: String(res.name ?? ''),
          apiVersion: String(res.apiVersion ?? ''),
        })
      }
    }
  }

  const rawParams = template.parameters
  if (rawParams && typeof rawParams === 'object') {
    parameters.push(...Object.keys(rawParams as Record<string, unknown>))
  }

  const rawVars = template.variables
  if (rawVars && typeof rawVars === 'object') {
    variables.push(...Object.keys(rawVars as Record<string, unknown>))
  }

  return { resources, parameters, variables }
}
