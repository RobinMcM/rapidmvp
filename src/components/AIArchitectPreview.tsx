'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Role = 'user' | 'ai' | 'typing'

interface Message {
  role: 'user' | 'ai'
  content: string
  services?: string[]
}

const conversation: Message[] = [
  {
    role: 'user',
    content: 'I want to build an AI-powered SaaS platform targeting enterprise customers.',
  },
  {
    role: 'ai',
    content: 'Understood. A few questions to refine the architecture — how many concurrent users do you anticipate in year one, and do you have any data residency or compliance requirements?',
  },
  {
    role: 'user',
    content: 'Around 50,000 users. We need GDPR compliance and data must stay in Europe.',
  },
  {
    role: 'ai',
    content:
      'Based on your scale and compliance requirements, I recommend the following architecture:',
    services: [
      'Azure Container Apps — EU West region, auto-scaling compute',
      'Azure PostgreSQL Flexible Server — GDPR-compliant, private endpoint',
      'Cloudflare Edge — European PoPs, Zero Trust security',
      'Azure OpenAI — EU-hosted AI inference with data residency guarantees',
      'Azure Key Vault — Secrets and encryption key management',
      'Cloudflare Workers — Edge logic and request routing',
    ],
  },
]

const DELAYS = [600, 2200, 4400, 5800]
const LOOP_DELAY = 10000

export default function AIArchitectPreview() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [showTyping, setShowTyping]     = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    const run = () => {
      setVisibleCount(0)
      setShowTyping(false)

      DELAYS.forEach((delay, i) => {
        // Show typing indicator before each AI message
        const msg = conversation[i]
        if (msg.role === 'ai') {
          timers.push(setTimeout(() => setShowTyping(true), delay - 800))
        }
        timers.push(
          setTimeout(() => {
            setShowTyping(false)
            setVisibleCount(i + 1)
          }, delay)
        )
      })

      // Loop
      timers.push(setTimeout(run, DELAYS[DELAYS.length - 1] + LOOP_DELAY))
    }

    run()
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section className="bg-rm-black py-24 px-6" aria-label="AI Architect preview">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div>
            <p className="label-mono text-azure mb-4">AI Architecture Assistant</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              Start designing your platform{' '}
              <span className="text-gradient-azure">right now.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              The RapidMVP AI Architect is the core of the platform. It asks the right
              questions, understands your constraints and produces a tailored cloud
              architecture recommendation — before a single line of code is written.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                ['Discovers', 'your business goals, growth expectations and constraints'],
                ['Recommends', 'Azure and Cloudflare services matched to your exact requirements'],
                ['Identifies', 'security risks, compliance needs and cost optimisation opportunities'],
                ['Produces',   'a complete platform blueprint ready for your team to review'],
              ].map(([verb, rest]) => (
                <li key={verb} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded flex-shrink-0 bg-azure/15 text-azure flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-slate-300 text-sm">
                    <strong className="text-white font-semibold">{verb}</strong>{' '}
                    {rest}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="#register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-azure text-white hover:bg-azure-600 hover:-translate-y-0.5 transition-all shadow-md shadow-azure/25"
            >
              Start Your Architecture Session
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ── Right: Chat window ── */}
          <div className="relative">
            {/* Glow behind window */}
            <div className="absolute inset-0 glow-azure opacity-30 scale-110 blur-2xl" aria-hidden />

            <div className="relative rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl shadow-black/50">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-rm-dark-3 border-b border-slate-700/60">
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="flex-1 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-azure animate-pulse" />
                  <span className="label-mono text-slate-500 text-[10px]">RapidMVP AI Architect</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="bg-rm-dark min-h-[420px] max-h-[420px] overflow-y-auto p-5 flex flex-col gap-4 scroll-smooth">

                {/* Welcome message */}
                <div className="flex items-start gap-3 message-appear">
                  <div className="w-8 h-8 rounded-lg bg-azure flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    R
                  </div>
                  <div className="bg-rm-dark-3 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Hello. I&apos;m the RapidMVP AI Architect. Describe your platform goals and I&apos;ll design an architecture tailored to your requirements.
                    </p>
                  </div>
                </div>

                {/* Conversation messages */}
                {conversation.slice(0, visibleCount).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 message-appear ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <div className="w-8 h-8 rounded-lg bg-azure flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                        R
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-300 text-xs font-bold">
                        U
                      </div>
                    )}
                    <div
                      className={`rounded-xl max-w-[80%] px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-azure/15 rounded-tr-sm'
                          : 'bg-rm-dark-3 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-slate-300 text-sm leading-relaxed">{msg.content}</p>
                      {msg.services && (
                        <ul className="mt-3 space-y-1.5">
                          {msg.services.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-xs text-slate-400">
                              <span className="mt-0.5 text-azure font-bold">›</span>
                              <span className="font-mono">{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {showTyping && (
                  <div className="flex items-start gap-3 message-appear">
                    <div className="w-8 h-8 rounded-lg bg-azure flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      R
                    </div>
                    <div className="bg-rm-dark-3 rounded-xl rounded-tl-sm px-4 py-3.5">
                      <div className="flex gap-1 items-center">
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500" />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Input bar */}
              <div className="bg-rm-dark-3 border-t border-slate-700/60 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 bg-rm-dark rounded-lg px-4 py-2.5 text-sm text-slate-600 border border-slate-700/50">
                  Describe your platform requirements...
                </div>
                <Link
                  href="#register"
                  className="px-4 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors flex-shrink-0"
                >
                  Start Session
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
