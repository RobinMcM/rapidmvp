'use client'
import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'

const PROJECT_TYPES = [
  { value: '', label: 'Select project type' },
  { value: 'ai-saas', label: 'AI-Powered SaaS Platform' },
  { value: 'enterprise', label: 'Enterprise Internal Platform' },
  { value: 'multi-tenant', label: 'Multi-Tenant SaaS' },
  { value: 'data-platform', label: 'Data & Analytics Platform' },
  { value: 'content-platform', label: 'Content & Media Platform' },
  { value: 'automation', label: 'Automation & Integration Platform' },
  { value: 'other', label: 'Other / Not sure yet' },
]

const TEAM_SIZES = [
  { value: '', label: 'Select team size' },
  { value: '1-5', label: '1–5 people' },
  { value: '6-20', label: '6–20 people' },
  { value: '21-100', label: '21–100 people' },
  { value: '100+', label: '100+ people' },
]

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

interface FormState {
  name: string
  company: string
  email: string
  projectType: string
  teamSize: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const inputClass =
  'w-full px-4 py-3 rounded-lg bg-rm-dark border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-azure/50 focus:border-azure/50 transition-colors'

export default function RegistrationSection() {
  const [form, setForm]     = useState<FormState>({ name: '', company: '', email: '', projectType: '', teamSize: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')
  const widgetRef           = useRef<HTMLDivElement>(null)

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.company || !form.email) {
      setError('Please complete all required fields.')
      return
    }
    setError('')
    setStatus('submitting')

    const turnstileInput = widgetRef.current?.querySelector<HTMLInputElement>(
      '[name="cf-turnstile-response"]'
    )
    const turnstileToken = turnstileInput?.value ?? ''

    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Submission failed')
      }
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <section className="bg-rm-dark py-24 px-6" id="register" aria-label="Registration confirmation">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-azure/15 text-azure flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Access confirmed</h2>
          <p className="text-slate-400 mb-8">
            Thank you, <strong className="text-white">{form.name}</strong>. Your platform access
            request has been received. Upload your repository ZIP when you are ready.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-azure text-white hover:bg-azure-600 transition-colors"
          >
            Access the Platform
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    )
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <section
        className="bg-rm-dark py-24 px-6 relative overflow-hidden"
        id="register"
        aria-label="Registration"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] glow-azure opacity-20 blur-3xl" aria-hidden />

        <div className="relative max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="label-mono text-azure mb-4">Get Started</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Access the AI Architecture Assistant
            </h2>
            <p className="text-slate-400 text-lg">
              Registration opens access to the RapidMVP platform. Upload your first
              repository ZIP immediately after sign-up.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-xl border border-slate-700/60 bg-rm-dark-2/80 p-8">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Full Name <span className="text-azure">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={set('name')}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="reg-company" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Company <span className="text-azure">*</span>
                  </label>
                  <input
                    id="reg-company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Acme Corporation"
                    value={form.company}
                    onChange={set('company')}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="reg-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Work Email <span className="text-azure">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="reg-project-type" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Project Type
                  </label>
                  <select
                    id="reg-project-type"
                    value={form.projectType}
                    onChange={set('projectType')}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {PROJECT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-team-size" className="block text-xs font-medium text-slate-400 mb-1.5">
                    Team Size
                  </label>
                  <select
                    id="reg-team-size"
                    value={form.teamSize}
                    onChange={set('teamSize')}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {TEAM_SIZES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <div ref={widgetRef} className="mb-6 flex justify-start">
                <div
                  className="cf-turnstile"
                  data-sitekey={TURNSTILE_SITE_KEY}
                  data-theme="dark"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-400 text-sm mb-4 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 rounded-lg font-semibold text-sm bg-azure text-white hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-azure/20 flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Request Platform Access
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-center text-slate-600 text-xs mt-4">
                Already have an account?{' '}
                <a href="/auth" className="text-azure hover:text-azure-300 transition-colors">
                  Sign in
                </a>
              </p>
            </form>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-600">
            {['No credit card required', 'Immediate platform access', 'Enterprise-grade security'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-azure/60" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </span>
            ))}
          </div>

        </div>
      </section>
    </>
  )
}
