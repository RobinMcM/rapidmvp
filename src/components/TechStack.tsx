import Section from './ui/Section'

const techs = [
  { name: 'React', icon: '⚛' },
  { name: 'TypeScript', icon: 'TS' },
  { name: 'Docker', icon: '🐳' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Node.js', icon: '⬢' },
  { name: 'Tailwind CSS', icon: '▣' },
]

export default function TechStack() {
  return (
    <Section heading="Built With Modern Tools" animate>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {techs.map((t) => (
          <div
            key={t.name}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/70 hover:scale-105 transition-all duration-200"
          >
            <span className="text-2xl font-mono text-slate-300 mb-2">{t.icon}</span>
            <span className="text-sm font-medium text-white">{t.name}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-slate-500 mt-6 text-sm">
        Your tech stack, your choice - we adapt to your needs.
      </p>
    </Section>
  )
}
