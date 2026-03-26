'use client'

import { useMemo, useState } from 'react'
import { scaffoldQuestions } from '../../../lib/scaffoldConfig'
import { deriveScaffoldOutput } from '../../../lib/scaffoldEngine'
import type { LoginRequirement, ProjectConfig, ScaffoldType } from '../../../types/scaffold'
import GenerateButton from './GenerateButton'
import ProgressBar from './ProgressBar'
import QuestionCard from './QuestionCard'
import ScaffoldSummary from './ScaffoldSummary'

const TOTAL_STEPS = 3

export default function ScaffoldWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectIntent, setProjectIntent] = useState<ScaffoldType | null>(null)
  const [needsAuth, setNeedsAuth] = useState<LoginRequirement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const projectConfig = useMemo<ProjectConfig | null>(() => {
    if (!projectIntent || !needsAuth) {
      return null
    }

    return {
      scaffold_type: projectIntent,
      needs_auth: needsAuth,
    }
  }, [projectIntent, needsAuth])

  const output = useMemo(() => {
    if (!projectConfig) {
      return null
    }
    return deriveScaffoldOutput(projectConfig)
  }, [projectConfig])

  const canContinueFromStepOne = Boolean(projectIntent)
  const canContinueFromStepTwo = Boolean(needsAuth)
  const canShowSummary = Boolean(output)

  const handleIntentSelect = (value: string) => {
    setProjectIntent(value as ScaffoldType)
  }

  const handleAuthSelect = (value: string) => {
    setNeedsAuth(value as LoginRequirement)
  }

  const handleNext = () => {
    if (currentStep === 1 && canContinueFromStepOne) {
      setCurrentStep(2)
      return
    }
    if (currentStep === 2 && canContinueFromStepTwo) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1))
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    window.setTimeout(() => setIsGenerating(false), 600)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white md:text-4xl">Project Scaffold Wizard</h1>
      <p className="mt-3 text-slate-300">
        Answer two quick questions and review the derived scaffold before generation.
      </p>

      <div className="mt-8">
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      <div className="mt-6">
        {currentStep === 1 ? (
          <QuestionCard
            question={scaffoldQuestions[0]}
            selectedValue={projectIntent ?? undefined}
            onSelect={handleIntentSelect}
          />
        ) : null}

        {currentStep === 2 ? (
          <QuestionCard
            question={scaffoldQuestions[1]}
            selectedValue={needsAuth ?? undefined}
            onSelect={handleAuthSelect}
          />
        ) : null}

        {currentStep === 3 && canShowSummary && output ? (
          <div className="space-y-4">
            <ScaffoldSummary output={output} />
            <GenerateButton onGenerate={handleGenerate} loading={isGenerating} estimatedCost="$0.00 (v1 placeholder)" />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={(currentStep === 1 && !canContinueFromStepOne) || (currentStep === 2 && !canContinueFromStepTwo)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  )
}
