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
