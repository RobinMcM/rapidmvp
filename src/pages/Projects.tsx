import { useEffect, useMemo, useState, useCallback } from 'react'
import Button from '../components/ui/Button'
import Section from '../components/ui/Section'
import { portfolioProjects } from '../constants/portfolio'
import type { ProjectCategory } from '../types'

const categories: ProjectCategory[] = ['All', 'Video', 'FinTech', 'Media', 'API', 'AI']

function ProjectCard({
  title,
  type,
  category,
  planningDays,
  buildHours,
  image,
  challenge,
  solution,
  results,
  techStack,
  tags,
  liveUrl,
  linkLabel,
  secondaryLink,
  secondaryLabel,
}: {
  title: string
  type: string
  category: ProjectCategory
  planningDays: number
  buildHours: number
  image: string
  challenge: string
  solution: string
  results: string[]
  techStack: string[]
  tags: string[] // displayed as category pill; tech stack shown separately
  liveUrl?: string
  linkLabel?: string
  secondaryLink?: string
  secondaryLabel?: string
}) {
  const total = planningDays * 24 + buildHours
  const planningRatio = (planningDays * 24) / total
  const [imgError, setImgError] = useState(false)
  const handleImgError = useCallback(() => setImgError(true), [])

  return (
    <article className="rounded-xl overflow-hidden bg-slate-900/80 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/70 hover:card-glow">
      <div className="aspect-video overflow-hidden bg-slate-800 flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-500 text-sm">
            {title}
          </div>
        ) : (
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImgError}
          />
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">{category}</span>
        </div>
        <p className="text-slate-400 text-sm mb-3">{type}</p>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Planning: {planningDays} days</span>
          <span>Build: {buildHours}h</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden flex mb-4">
          <div className="bg-[#7c3aed]/70 rounded-l-full" style={{ width: `${planningRatio * 100}%` }} />
          <div className="bg-[#3b82f6]/70 rounded-r-full" style={{ width: `${(1 - planningRatio) * 100}%` }} />
        </div>
        <p className="text-slate-300 text-sm mb-2"><strong className="text-slate-400">Challenge:</strong> {challenge}</p>
        <p className="text-slate-300 text-sm mb-3"><strong className="text-slate-400">Solution:</strong> {solution}</p>
        <ul className="text-slate-400 text-sm mb-3 list-disc list-inside space-y-1">
          {results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-slate-700/80 text-slate-400 text-xs">{t}</span>
          ))}
          {techStack.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">{t}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {liveUrl && linkLabel && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
            >
              {linkLabel} →
            </a>
          )}
          {!liveUrl && linkLabel && (
            <span className="text-sm text-slate-500">{linkLabel}</span>
          )}
          {secondaryLink && secondaryLabel && (
            <a href={secondaryLink} className="text-sm text-slate-500 hover:text-slate-400 ml-2">
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState<ProjectCategory>('All')

  useEffect(() => {
    document.title = 'Our Work – RapidMVP.io'
  }, [])

  const filtered = useMemo(
    () =>
      filter === 'All' ? portfolioProjects : portfolioProjects.filter((p) => p.category === filter),
    [filter]
  )

  return (
    <div className="min-h-screen">
      <Section heading="Our Work" subheading="6 Production Platforms in 3 Months" animate>
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-slate-400 mb-4">Have a Project in Mind?</p>
          <Button to="/contact" variant="primary">Get in Touch</Button>
        </div>
      </Section>
    </div>
  )
}
