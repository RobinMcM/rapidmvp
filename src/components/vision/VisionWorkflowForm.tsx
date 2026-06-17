'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateVisionSummary } from '../../lib/vision/summary-generator'
import VisionSummary from './VisionSummary'

type Fields = {
  businessGoal: string
  targetUsers: string
  currentPlatform: string
  expectedGrowth: string
  integrations: string
  securityRequirements: string
  complianceRequirements: string
  preferredCloud: string
  aiRequirements: string
  teamCapability: string
}

const STEPS = [
  {
    key: 'businessGoal' as keyof Fields,
    label: 'Business Goal',
    question: 'What is the primary business goal for this platform?',
    placeholder: 'e.g. Build a B2B SaaS product for enterprise compliance teams…',
    hint: 'Be specific — this drives the blueprint recommendation.',
  },
  {
    key: 'targetUsers' as keyof Fields,
    label: 'Target Users',
    question: 'Who are the primary users of this platform?',
    placeholder: 'e.g. Internal ops teams, enterprise procurement managers…',
    hint: 'Include scale if known — e.g. "10,000 concurrent users".',
  },
  {
    key: 'currentPlatform' as keyof Fields,
    label: 'Current Platform',
    question: 'What is the current technology stack or platform (if any)?',
    placeholder: 'e.g. On-premise SQL Server with a legacy .NET monolith…',
    hint: 'Leave blank if this is a greenfield project.',
  },
  {
    key: 'expectedGrowth' as keyof Fields,
    label: 'Expected Growth',
    question: 'What is the expected growth profile over the next 12-24 months?',
    placeholder: 'e.g. 10× user growth expected, expanding to 3 new markets…',
    hint: 'Helps select the right scaling model.',
  },
  {
    key: 'integrations' as keyof Fields,
    label: 'Integrations',
    question: 'What third-party systems or APIs need to be integrated?',
    placeholder: 'e.g. Stripe, Salesforce, internal HR system, Azure AD…',
    hint: 'List all known integrations, including billing and identity.',
  },
  {
    key: 'securityRequirements' as keyof Fields,
    label: 'Security Requirements',
    question: 'What are the key security requirements?',
    placeholder: 'e.g. Zero Trust network access, MFA enforced, no public endpoints…',
    hint: 'Include any regulatory-driven security controls.',
  },
  {
    key: 'complianceRequirements' as keyof Fields,
    label: 'Compliance Requirements',
    question: 'What compliance frameworks must be met?',
    placeholder: 'e.g. GDPR, ISO 27001, SOC 2 Type II, PCI DSS…',
    hint: 'Include frameworks that are aspirational as well as mandatory.',
  },
  {
    key: 'preferredCloud' as keyof Fields,
    label: 'Cloud Preference',
    question: 'What cloud platform(s) are preferred or mandated?',
    placeholder: 'e.g. Azure (preferred), Cloudflare for edge, no AWS…',
    hint: 'Include commercial, contractual, or technical preferences.',
  },
  {
    key: 'aiRequirements' as keyof Fields,
    label: 'AI Requirements',
    question: 'Are there AI or ML requirements for this platform?',
    placeholder: 'e.g. RAG pipeline for document Q&A, Azure OpenAI for content generation…',
    hint: 'Leave blank if no AI features are required.',
  },
  {
    key: 'teamCapability' as keyof Fields,
    label: 'Team Capability',
    question: 'What is the current team structure and engineering capability?',
    placeholder: 'e.g. 3 senior engineers, strong Azure experience, no DevOps team yet…',
    hint: 'This helps calibrate complexity and operational overhead recommendations.',
  },
]

const EMPTY: Fields = {
  businessGoal: '',
  targetUsers: '',
  currentPlatform: '',
  expectedGrowth: '',
  integrations: '',
  securityRequirements: '',
  complianceRequirements: '',
  preferredCloud: '',
  aiRequirements: '',
  teamCapability: '',
}

export default function VisionWorkflowForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [showSummary, setShowSummary] = useState(false)
  const [saving, setSaving] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function handleNext() {
    if (isLast) {
      setShowSummary(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    if (showSummary) {
      setShowSummary(false)
    } else if (step > 0) {
      setStep((s) => s - 1)
    }
  }

  async function handleConfirm() {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/workspace')
      router.refresh()
    } catch {
      setSaving(false)
    }
  }

  if (showSummary) {
    const { generatedSummary, recommendedBlueprint } = generateVisionSummary(fields)
    return (
      <VisionSummary
        summary={generatedSummary}
        recommendedBlueprint={recommendedBlueprint}
        onConfirm={handleConfirm}
        onBack={handleBack}
        saving={saving}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 rounded-full transition-colors ${i <= step ? 'bg-azure' : 'bg-slate-800'}`}
          />
        ))}
      </div>

      {/* Step counter */}
      <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        Step {step + 1} of {STEPS.length} — {current.label}
      </p>

      {/* Question */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-1">{current.question}</h2>
        {current.hint && <p className="text-slate-500 text-sm">{current.hint}</p>}
      </div>

      {/* Input */}
      <textarea
        value={fields[current.key]}
        onChange={(e) => setFields((f) => ({ ...f, [current.key]: e.target.value }))}
        placeholder={current.placeholder}
        rows={4}
        className="w-full rounded-lg bg-rm-dark-2 border border-slate-700 focus:border-azure focus:ring-1 focus:ring-azure/30 text-slate-200 placeholder-slate-600 text-sm p-3 resize-none outline-none transition-colors"
      />

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors"
        >
          {isLast ? 'Review Summary' : 'Next'}
        </button>
        {!isLast && (
          <button
            type="button"
            onClick={() => { setFields((f) => ({ ...f, [current.key]: '' }) as Fields); handleNext() }}
            className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}
