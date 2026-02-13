import Section from './ui/Section'

const values = [
  {
    title: '10x Faster',
    value: '10×',
    description: 'Weeks not months',
    sub: 'Deploy before competitors even start',
  },
  {
    title: 'Enterprise Quality',
    value: '30+',
    description: '30 years of architecture',
    sub: 'Security and scale built-in',
  },
  {
    title: 'AI-Powered',
    value: 'AI',
    description: 'Multi-model validation',
    sub: 'Consistency guaranteed',
  },
]

export default function ValueProposition() {
  return (
    <Section heading="Why RapidMVP?" animate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
        {values.map((item) => (
          <div
            key={item.title}
            className="text-center p-6 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/70 transition-colors"
          >
            <div className="text-4xl md:text-5xl font-bold text-[#3b82f6] mb-2 font-mono">
              {item.value}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-300 font-medium">{item.description}</p>
            <p className="text-slate-500 text-sm mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
