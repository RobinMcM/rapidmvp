import { useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Section from '../components/ui/Section'
import { projects } from '../constants/projects'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

function TimelineBar({ planningDays, buildHours }: { planningDays: number; buildHours: number }) {
  const total = planningDays * 24 + buildHours
  const planningRatio = (planningDays * 24) / total
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Planning: {planningDays} days</span>
        <span>Build: {buildHours}h</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden flex">
        <div className="bg-[#7c3aed]/70 rounded-l-full" style={{ width: `${planningRatio * 100}%` }} />
        <div className="bg-[#3b82f6]/70 rounded-r-full" style={{ width: `${(1 - planningRatio) * 100}%` }} />
      </div>
    </div>
  )
}

export default function Home() {
  const { ref: heroRef, isVisible: heroVisible } = useIntersectionObserver({ triggerOnce: true })

  useEffect(() => {
    document.title = 'RapidMVP.io – Build Your MVP in Weeks, Not Months'
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]" aria-hidden />
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://picsum.photos/seed/rapidmvp-hero/1920/1080)`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]" aria-hidden />
        <div className="absolute inset-0 grid-pattern opacity-20" aria-hidden />

        <div
          ref={heroRef}
          className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-700 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
            Build Your MVP in Weeks, Not Months
          </h1>
          <p className="text-xl text-slate-300 mb-10">
            AI-Assisted Development + 30 Years Experience
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left sm:text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gradient">6</p>
              <p className="text-slate-400 text-sm">Platforms Built in 3 Months</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#3b82f6]">2–8h</p>
              <p className="text-slate-400 text-sm">Build Times</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-[#f97316]">£9.5K–16K</p>
              <p className="text-slate-400 text-sm">Fixed Price</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/projects" variant="primary">View Projects</Button>
            <Button to="/contact" variant="secondary">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Recent Builds */}
      <Section heading="Recent Builds" subheading="Production platforms delivered in weeks" animate>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {projects.slice(0, 3).map((project) => (
            <Card key={project.title}>
              <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
              <p className="text-slate-400 text-sm mb-3">{project.type}</p>
              <TimelineBar planningDays={project.planningDays} buildHours={project.buildHours} />
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors"
              >
                View Live →
              </a>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button to="/projects" variant="secondary">View Full Portfolio</Button>
        </div>
      </Section>

      {/* Value Props */}
      <Section heading="Why RapidMVP?" animate>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {[
            { title: '10x Faster', value: '10×', desc: 'Weeks not months', sub: 'Deploy before competitors even start' },
            { title: 'Enterprise Quality', value: '30+', desc: '30 years of architecture', sub: 'Security and scale built-in' },
            { title: 'AI-Powered', value: 'AI', desc: 'Multi-model validation', sub: 'Consistency guaranteed' },
          ].map((item) => (
            <div
              key={item.title}
              className="text-center p-6 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/70 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#3b82f6] mb-2 font-mono">{item.value}</div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-300 font-medium">{item.desc}</p>
              <p className="text-slate-500 text-sm mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Process Preview */}
      <Section heading="How We Work" subheading="Planning takes days. Building takes hours." animate>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {[
            { num: 1, label: 'Extended Planning (3–5 days)', icon: '🧠' },
            { num: 2, label: 'Rapid Execution (2–8 hours)', icon: '⚡' },
            { num: 3, label: 'Production Ready', icon: '✓' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4 md:block text-center">
              <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white font-bold flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="md:mt-3">
                <span className="text-2xl md:block mb-1" aria-hidden>{step.icon}</span>
                <p className="text-white font-medium">{step.label}</p>
              </div>
              {step.num < 3 && <span className="hidden md:inline text-slate-500 ml-2">→</span>}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button to="/process" variant="primary">Learn More</Button>
        </div>
      </Section>

      {/* Testimonial placeholder */}
      <Section animate>
        <div className="max-w-2xl mx-auto text-center p-8 rounded-xl bg-slate-900/60 border border-slate-700/50 border-dashed">
          <p className="text-slate-500 italic">Client testimonial coming soon.</p>
        </div>
      </Section>

      {/* CTA */}
      <Section animate>
        <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Build Fast?</h2>
          <p className="text-slate-400 mb-6">From idea to production in 2–3 weeks.</p>
          <Button to="/contact" variant="primary">Get in Touch</Button>
        </div>
      </Section>
    </div>
  )
}
