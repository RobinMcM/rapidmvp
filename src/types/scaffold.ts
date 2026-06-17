export type ScaffoldType = 'saas' | 'content' | 'marketplace' | 'tool'
export type LoginRequirement = 'required' | 'optional' | 'none'

export type ProjectConfig = {
  scaffold_type: ScaffoldType
  needs_auth: LoginRequirement
}

export type Question = {
  question: string
  options: Array<{ value: string; label: string; icon: string }>
}

export type ScaffoldOutput = {
  scaffoldType: string
  pageSet: string[]
  auth: {
    enabled: boolean
    recipe: string
    optional: boolean
  }
  aiModes: string[]
}
