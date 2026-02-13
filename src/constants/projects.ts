import type { ProjectCard } from '../types'

export const projects: ProjectCard[] = [
  {
    title: 'MovieShaker.com',
    type: 'Video Processing Platform',
    planningDays: 5,
    buildHours: 2,
    tags: ['React', 'ffmpeg', 'Docker', 'PostgreSQL'],
    liveUrl: 'https://movieshaker.com',
  },
  {
    title: 'reelInvesting.com',
    type: 'FinTech Platform',
    planningDays: 4,
    buildHours: 3,
    tags: ['React', 'PostgreSQL', 'REST APIs'],
    liveUrl: 'https://reelinvesting.com',
  },
  {
    title: 'aFilmInaBox.com',
    type: 'Media Delivery Platform',
    planningDays: 3,
    buildHours: 1.5,
    tags: ['React', 'Docker', 'CDN'],
    liveUrl: 'https://afilminabox.com',
  },
]
