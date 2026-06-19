type EnvVariable = {
  name: string
  classification: 'required' | 'optional' | 'public' | 'secret' | 'unknown'
  hasValue: boolean
  source: string
}

const CLASS_STYLE: Record<string, { bg: string; text: string }> = {
  required: { bg: 'bg-amber-900/40',   text: 'text-amber-400'   },
  optional: { bg: 'bg-slate-800/60',   text: 'text-slate-400'   },
  public:   { bg: 'bg-blue-900/40',    text: 'text-blue-400'    },
  secret:   { bg: 'bg-red-900/40',     text: 'text-red-400'     },
  unknown:  { bg: 'bg-slate-800/60',   text: 'text-slate-500'   },
}

type Props = { envVars: EnvVariable[] }

export default function EnvVarsTable({ envVars }: Props) {
  if (envVars.length === 0) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-6 text-center">
        <p className="text-slate-500 text-sm">No environment variables detected in this repository.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-slate-300 font-semibold text-sm">Environment Variables</span>
        <span className="text-slate-500 text-xs">{envVars.length} detected — values never displayed</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-5 py-2.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider">Variable</th>
              <th className="text-left px-5 py-2.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider">Classification</th>
              <th className="text-left px-5 py-2.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider">Value</th>
              <th className="text-left px-5 py-2.5 text-slate-500 font-mono text-[10px] uppercase tracking-wider hidden sm:table-cell">Source</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map((v) => {
              const style = CLASS_STYLE[v.classification] ?? CLASS_STYLE.unknown
              return (
                <tr key={v.name} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-2.5 font-mono text-white text-xs">{v.name}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${style.bg} ${style.text}`}>
                      {v.classification}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-slate-600 text-xs">
                    {v.classification === 'secret' ? '●●●●●●' : v.hasValue ? 'example value' : 'not set'}
                  </td>
                  <td className="px-5 py-2.5 text-slate-500 text-xs font-mono hidden sm:table-cell truncate max-w-xs">
                    {v.source}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
