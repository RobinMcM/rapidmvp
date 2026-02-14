import { useEffect } from 'react'
import Button from '../components/ui/Button'
import Section from '../components/ui/Section'

const comparisonRows = [
  { aspect: 'Timeline', traditional: '6-12 months', aiOnly: '3-6 weeks', rapidmvp: '2-3 weeks' },
  { aspect: 'Cost', traditional: '£50K-100K+', aiOnly: '£5K-15K + ongoing', rapidmvp: '£9.5K-16K' },
  { aspect: 'Quality', traditional: 'High', aiOnly: 'Variable', rapidmvp: 'High' },
  { aspect: 'Control', traditional: 'Full', aiOnly: 'Limited', rapidmvp: 'Full' },
  { aspect: 'Maintenance', traditional: 'You own', aiOnly: 'Platform lock-in', rapidmvp: 'You own' },
  { aspect: 'Scalability', traditional: 'Excellent', aiOnly: 'Limited', rapidmvp: 'Excellent' },
]

export default function Process() {
  useEffect(() => {
    document.title = 'The RapidMvᵖ Methodology – RapidMvᵖ.io'
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <Section heading="The RapidMvᵖ Methodology" subheading="30 Years of Discipline Meets AI Speed" animate>
        <div className="max-w-3xl mx-auto text-center text-slate-400">
          <p className="text-lg">
            Planning takes days. Building takes hours. You get enterprise quality at startup speed.
          </p>
        </div>
      </Section>

      {/* The Problem */}
      <Section heading="The Problem" animate>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-2">Traditional Development</h3>
            <p className="text-slate-400 text-sm">6-12 months. High quality but slow and expensive.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-2">AI-Only Platforms</h3>
            <p className="text-slate-400 text-sm">3-6 weeks but bloated, expensive, limited control.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/60 border border-[#3b82f6]/30">
            <h3 className="text-lg font-bold text-[#3b82f6] mb-2">The Gap</h3>
            <p className="text-slate-400 text-sm">You need both speed and quality. That’s RapidMvᵖ.</p>
          </div>
        </div>
      </Section>

      {/* Our Solution - Visual workflow */}
      <Section heading="Our Solution" subheading="Three phases. No waste." animate>
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Phase 1 */}
          <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/60">
            <div className="bg-[#3b82f6]/20 px-6 py-3 border-b border-slate-700/50">
              <h3 className="font-bold text-white">Phase 1: Extended Planning (3-5 days)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-white mb-2">Multi-Model Validation</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• ChatGPT analyzes requirements</li>
                  <li>• Claude validates architecture</li>
                  <li>• Models must agree before build</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-white mb-2">Architecture Design</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Database schema</li>
                  <li>• API endpoints</li>
                  <li>• Security strategy</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-white mb-2">Rules.md Creation</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Platform-specific rules</li>
                  <li>• Tech stack decisions</li>
                  <li>• Coding standards</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-500 text-2xl">↓</div>

          {/* Phase 2 */}
          <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/60">
            <div className="bg-[#7c3aed]/20 px-6 py-3 border-b border-slate-700/50">
              <h3 className="font-bold text-white">Phase 2: Rapid Execution (2-8 hours)</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-white mb-2">AI-Assisted Build</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Cursor / Claude Code CLI</li>
                  <li>• Rules.md enforces consistency</li>
                  <li>• Real-time code generation</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="font-semibold text-white mb-2">Continuous Validation</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• “Explain this code”</li>
                  <li>• “Can you improve it?”</li>
                  <li>• Quality checks at every step</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-500 text-2xl">↓</div>

          {/* Phase 3 */}
          <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900/60">
            <div className="bg-emerald-500/20 px-6 py-3 border-b border-slate-700/50">
              <h3 className="font-bold text-white">Phase 3: Production Ready</h3>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 max-w-xl">
                <h4 className="font-semibold text-white mb-2">Testing & Deployment</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Comprehensive testing</li>
                  <li>• Docker deployment</li>
                  <li>• SSL, security hardening</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Why It Works */}
      <Section heading="Why It Works" animate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <p className="text-slate-300">Experience guides AI — not the other way around. Planning prevents waste (COBOL/punch card discipline).</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <p className="text-slate-300">Multi-model validation catches errors early. You get clean, documented, maintainable code.</p>
          </div>
        </div>
      </Section>

      {/* Comparison Table */}
      <Section heading="Comparison" subheading="How we stack up" animate>
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/50">
                <th className="px-6 py-4 text-white font-semibold">Aspect</th>
                <th className="px-6 py-4 text-slate-400 font-semibold">Traditional</th>
                <th className="px-6 py-4 text-slate-400 font-semibold">AI-Only Platforms</th>
                <th className="px-6 py-4 text-[#3b82f6] font-semibold">RapidMvᵖ</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.aspect} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                  <td className="px-6 py-3 text-white font-medium">{row.aspect}</td>
                  <td className="px-6 py-3 text-slate-400">{row.traditional}</td>
                  <td className="px-6 py-3 text-slate-400">{row.aiOnly}</td>
                  <td className="px-6 py-3 text-[#3b82f6] font-medium">{row.rapidmvp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Tech Stack */}
      <Section heading="Tech Stack" animate>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {[
            'React', 'TypeScript', 'Tailwind', 'Node.js', 'Express', 'PostgreSQL',
            'Docker', 'DigitalOcean', 'Claude API', 'ChatGPT', 'SuperTokens', 'S3',
          ].map((tech) => (
            <div
              key={tech}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 text-center text-slate-300 text-sm font-medium"
            >
              {tech}
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section animate>
        <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Build with This Methodology?</h2>
          <Button to="/contact" variant="primary">Get in Touch</Button>
        </div>
      </Section>
    </div>
  )
}
