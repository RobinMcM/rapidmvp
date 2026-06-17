import type { Question } from '../types/scaffold'

export const scaffoldQuestions: Question[] = [
  {
    question: 'What type of product are you building?',
    options: [
      { value: 'saas', label: 'SaaS App', icon: '⚡' },
      { value: 'content', label: 'Content Platform', icon: '📄' },
      { value: 'marketplace', label: 'Marketplace', icon: '🛍️' },
      { value: 'tool', label: 'Single-purpose Tool', icon: '🔧' },
    ],
  },
  {
    question: 'Does your product require user accounts?',
    options: [
      { value: 'required', label: 'Yes — login required', icon: '🔒' },
      { value: 'optional', label: 'Optional — login enhances features', icon: '🔓' },
      { value: 'none', label: 'No — fully public', icon: '🌐' },
    ],
  },
]
