type Props = {
  azure: string[]
  cloudflare: string[]
  ai: string[]
  dataLayer: string[]
}

type Layer = {
  label: string
  sublabel: string
  items: string[]
  itemClass: string
  borderClass: string
  labelClass: string
}

function ConnectorArrow() {
  return (
    <div className="flex justify-center my-1.5" aria-hidden>
      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default function BlueprintArchitectureDiagram({ azure, cloudflare, ai, dataLayer }: Props) {
  const layers: Layer[] = [
    {
      label: 'Edge Layer',
      sublabel: 'Cloudflare',
      items: cloudflare,
      itemClass: 'bg-cf-orange/10 text-cf-300',
      borderClass: 'border-cf-orange/25',
      labelClass: 'text-cf-orange',
    },
    {
      label: 'Application Layer',
      sublabel: 'Azure',
      items: azure,
      itemClass: 'bg-azure/10 text-azure-300',
      borderClass: 'border-azure/25',
      labelClass: 'text-azure',
    },
    ...(ai.length > 0
      ? [
          {
            label: 'AI / ML Layer',
            sublabel: 'Azure AI',
            items: ai,
            itemClass: 'bg-purple-900/30 text-purple-300',
            borderClass: 'border-purple-800/30',
            labelClass: 'text-purple-400',
          },
        ]
      : []),
    {
      label: 'Data Layer',
      sublabel: 'Storage & Cache',
      items: dataLayer,
      itemClass: 'bg-slate-800 text-slate-400',
      borderClass: 'border-slate-700/50',
      labelClass: 'text-slate-400',
    },
  ]

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-6">
      {/* Users */}
      <div className="flex justify-center mb-1.5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Users / Internet
        </div>
      </div>

      {layers.map((layer) => (
        <div key={layer.label}>
          <ConnectorArrow />
          <div className={`rounded-lg border ${layer.borderClass} p-4`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${layer.labelClass}`}>
                {layer.label}
              </span>
              <span className="text-slate-600 text-[10px] font-mono">{layer.sublabel}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {layer.items.map((item) => (
                <span key={item} className={`px-2 py-0.5 rounded text-[11px] font-medium ${layer.itemClass}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
