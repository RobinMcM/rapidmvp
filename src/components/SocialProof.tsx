import Card from './ui/Card'
import Section from './ui/Section'
import { projects } from '../constants/projects'

function TimelineBar({
  planningDays,
  buildHours,
}: {
  planningDays: number
  buildHours: number
}) {
  const total = planningDays * 24 + buildHours
  const planningRatio = (planningDays * 24) / total

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Planning: {planningDays} days</span>
        <span>Build: {buildHours}h</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden flex">
        <div
          className="bg-[#7c3aed]/70 rounded-l-full transition-all duration-300"
          style={{ width: `${planningRatio * 100}%` }}
        />
        <div
          className="bg-[#3b82f6]/70 rounded-r-full transition-all duration-300"
          style={{ width: `${(1 - planningRatio) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function SocialProof() {
  return (
    <Section heading="Proven Results" animate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {projects.map((project) => (
          <Card key={project.title}>
            <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{project.type}</p>
            <TimelineBar planningDays={project.planningDays} buildHours={project.buildHours} />
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              View Live →
            </a>
          </Card>
        ))}
      </div>
    </Section>
  )
}
