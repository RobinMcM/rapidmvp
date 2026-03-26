import { Fragment } from 'react'
import Section from './ui/Section'
import { processSteps } from '../constants/processSteps'

const stepIcons: Record<number, string> = {
  1: '🧠',
  2: '⚡',
  3: '✓',
}

export default function Process() {
  return (
    <Section
      id="process"
      heading="The RapidMvᵖ Methodology"
      subheading="Planning Takes Days. Building Takes Hours."
      animate
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-2 lg:gap-4 items-center md:items-stretch">
        {processSteps.map((step, index) => (
          <Fragment key={step.number}>
            <div className="flex flex-col md:flex-1 w-full max-w-sm mx-auto md:mx-0">
              <div className="relative rounded-xl bg-slate-900/80 border border-slate-700/50 p-6 hover:border-slate-600/70 transition-colors h-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#3b82f6] text-white font-bold text-sm flex items-center justify-center">
                  {step.number}
                </div>
                <div className="text-3xl mb-3" aria-hidden>
                  {stepIcons[step.number]}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                <p className="text-slate-500 text-xs mb-4">{step.duration}</p>
                <ul className="space-y-2">
                  {step.details.map((item) => (
                    <li key={item} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-[#3b82f6] mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {index < processSteps.length - 1 && (
              <div
                className="hidden md:flex items-center justify-center text-slate-500 text-2xl shrink-0 w-8"
                aria-hidden
              >
                →
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </Section>
  )
}
