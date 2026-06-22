import type { MigrationPlan } from '../../lib/repository/migration-mapper'
import { buildOwnershipModel } from '../../lib/repository/migration-mapper'

type AzureService = { name: string; tier: string; reason: string; required: boolean }

/**
 * The Ownership Model — a core product concept. It makes "you own this platform"
 * concrete by tying each owned area to the Azure resource that backs it.
 */
export default function OwnershipModelPanel({
  plan,
  services,
}: {
  plan: MigrationPlan | null
  services: AzureService[]
}) {
  if (!plan) return null
  const model = buildOwnershipModel(plan, services)

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-rm-dark-2/70 border border-azure/30 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Ownership model</p>
          <span className="text-white font-semibold text-sm">What you own on Azure</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {model.owned.map((item) => (
            <div key={item.area} className="px-5 py-3 flex items-start gap-3">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.present ? 'bg-emerald-500' : 'bg-slate-600'}`}
              />
              <div className="min-w-0">
                <p className="text-white font-medium text-sm">{item.youOwn}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.backedBy}</p>
              </div>
              <span
                className={`ml-auto px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${
                  item.present ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {item.present ? 'In this platform' : 'Recommended'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {model.external.length > 0 && (
        <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800">
            <span className="text-slate-300 font-semibold text-sm">External Services (by design)</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {model.external.map((e) => (
              <div key={e.provider} className="px-5 py-3">
                <p className="text-white font-medium text-sm">{e.provider}</p>
                <p className="text-slate-500 text-xs mt-0.5">{e.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
