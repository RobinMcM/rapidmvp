import type { LoginRequirement, Question, ScaffoldType } from '../types/scaffold'

export const scaffoldQuestions: Question[] = [
  {
    id: 'project_intent',
    question: 'What do you want to build?',
    type: 'single_select',
    options: [
      { value: 'local_business', label: 'Attract local customers', icon: 'pin' },
      { value: 'service_business', label: 'Promote my services', icon: 'tools' },
      { value: 'portfolio', label: 'Show my work', icon: 'grid' },
      { value: 'saas', label: 'Launch a web app', icon: 'code' },
      { value: 'ecommerce', label: 'Sell products online', icon: 'bag' },
    ],
    maps_to: 'scaffold_type',
    drives: ['page_set', 'auth_recipe', 'ai_modes'],
  },
  {
    id: 'needs_login',
    question: 'Do you need users to log in?',
    type: 'single_select',
    options: [
      { value: 'yes', label: 'Yes', icon: 'lock' },
      { value: 'no', label: 'No', icon: 'unlock' },
    ],
    maps_to: 'needs_auth',
    drives: ['auth_recipe'],
  },
]

export const pageSetByScaffoldType: Record<ScaffoldType, string[]> = {
  local_business: ['home', 'about', 'services', 'contact'],
  service_business: ['home', 'services', 'pricing', 'contact'],
  portfolio: ['home', 'work', 'about', 'contact'],
  saas: ['home', 'features', 'pricing', 'docs', 'auth'],
  ecommerce: ['home', 'catalog', 'product', 'cart', 'checkout', 'auth'],
}

export const aiModesByScaffoldType: Record<ScaffoldType, string[]> = {
  local_business: ['landing-copy', 'local-seo-basics'],
  service_business: ['services-copy', 'lead-capture'],
  portfolio: ['case-study-layout', 'portfolio-grid'],
  saas: ['product-marketing', 'developer-docs'],
  ecommerce: ['catalog-setup', 'checkout-ux'],
}

export const authDefaultByScaffoldType: Record<ScaffoldType, { optional: boolean; recipe: 'emailpassword' }> = {
  local_business: { optional: true, recipe: 'emailpassword' },
  service_business: { optional: true, recipe: 'emailpassword' },
  portfolio: { optional: true, recipe: 'emailpassword' },
  saas: { optional: false, recipe: 'emailpassword' },
  ecommerce: { optional: false, recipe: 'emailpassword' },
}

export const loginEnabledByAnswer: Record<LoginRequirement, boolean> = {
  yes: true,
  no: false,
}
