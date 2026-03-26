export type ScaffoldType = 'local_business' | 'service_business' | 'portfolio' | 'saas' | 'ecommerce'

export type LoginRequirement = 'yes' | 'no'

export type QuestionType = 'single_select'

export type QuestionMapTarget = 'scaffold_type' | 'needs_auth'

export type QuestionDrive = 'page_set' | 'auth_recipe' | 'ai_modes'

export interface QuestionOption {
  value: string
  label: string
  icon?: string
}

export interface Question {
  id: string
  question: string
  type: QuestionType
  options: QuestionOption[]
  maps_to: QuestionMapTarget
  drives: QuestionDrive[]
}

export interface ProjectConfig {
  scaffold_type: ScaffoldType
  needs_auth: LoginRequirement
}

export interface ScaffoldOutput {
  scaffoldType: ScaffoldType
  pageSet: string[]
  aiModes: string[]
  auth: {
    enabled: boolean
    optional: boolean
    recipe: 'emailpassword' | null
  }
}
