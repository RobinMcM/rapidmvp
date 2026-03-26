export interface ProjectCard {
  title: string
  type: string
  planningDays: number
  buildHours: number
  tags: string[]
  liveUrl: string
}

export interface ProcessStep {
  number: number
  title: string
  duration: string
  details: string[]
}

/** Category for portfolio filter */
export type ProjectCategory = 'All' | 'Video' | 'FinTech' | 'Media' | 'API' | 'AI'

/** Full portfolio project for Projects page */
export interface PortfolioProject {
  id: string
  title: string
  type: string
  category: ProjectCategory
  planningDays: number
  buildHours: number
  image: string
  challenge: string
  solution: string
  results: string[]
  techStack: string[]
  tags: string[]
  liveUrl?: string
  linkLabel?: string
  secondaryLink?: string
  secondaryLabel?: string
}
