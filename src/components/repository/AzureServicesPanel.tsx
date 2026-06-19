type AzureService = {
  name: string
  tier: string
  reason: string
  required: boolean
}

type Props = {
  recommendedPath: string
  suitability: string
  services: AzureService[]
  blockers: string[]
  risks: string[]
}

const SUIT_LABEL: Record<string, string> = {
  suitable:             'Suitable for Azure deployment',
  suitable_with_changes:'Suitable with configuration changes',
  requires_containers:  'Requires container-based deployment',
  unsupported:          'Runtime not detected',
}

const SUIT_COLOR: Record<string, string> = {
  suitable:             'text-emerald-400',
  suitable_with_changes:'text-amber-400',
  requires_containers:  'text-blue-400',
  unsupported:          'text-red-400',
}

export default function AzureServicesPanel({ recommendedPath, suitability, services, blockers, risks }: Props) {
  const reqServices = services.filter((s) => s.required)
  const optServices = services.filter((s) => !s.required)

  return (
    <div className="flex flex-col gap-5">
      {/* Recommended path summary */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1">Recommended path</p>
        <p className="text-azure-300 font-bold text-base">{recommendedPath}</p>
        <p className={`text-sm mt-1 ${SUIT_COLOR[suitability] ?? 'text-slate-400'}`}>
          {SUIT_LABEL[suitability] ?? suitability}
        </p>
      </div>

      {/* Required services */}
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <span className="text-slate-300 font-semibold text-sm">Required Azure Services</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {reqServices.map((svc) => (
            <div key={svc.name} className="px-5 py-3 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-azure mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">{svc.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{svc.tier} — {svc.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional services */}
      {optServices.length > 0 && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <span className="text-slate-300 font-semibold text-sm">Optional Services</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {optServices.map((svc) => (
              <div key={svc.name} className="px-5 py-3 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 font-medium text-sm">{svc.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{svc.tier} — {svc.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-5">
          <p className="text-red-400 font-semibold text-sm mb-3">Critical Blockers</p>
          <ul className="flex flex-col gap-2">
            {blockers.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-red-300 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {risks.length > 0 && (
        <div className="rounded-xl bg-amber-950/20 border border-amber-900/40 p-5">
          <p className="text-amber-400 font-semibold text-sm mb-3">Risks</p>
          <ul className="flex flex-col gap-2">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                <span className="text-amber-300 text-sm">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
