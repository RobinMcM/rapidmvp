import type { ProcessStep } from '../types'

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: 'Extended Planning (3-5 days)',
    duration: '3-5 days',
    details: [
      'Multi-model AI validation',
      'Architecture design',
      'Security-first approach',
      'Risk identification',
    ],
  },
  {
    number: 2,
    title: 'Rapid Execution (2-8 hours)',
    duration: '2-8 hours',
    details: [
      'AI-assisted implementation',
      'Real-time quality checks',
      'Continuous validation',
      'Clean, documented code',
    ],
  },
  {
    number: 3,
    title: 'Production Ready',
    duration: 'Live',
    details: [
      'Deployed and tested',
      'Working in production',
      'Scalable architecture',
      'Ready for users',
    ],
  },
]
