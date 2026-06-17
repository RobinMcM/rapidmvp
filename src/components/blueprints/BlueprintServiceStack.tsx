type Props = {
  azure: string[]
  cloudflare: string[]
  ai: string[]
  dataLayer: string[]
  devOps: string[]
}

function BadgeList({ label, items, accent }: { label: string; items: string[]; accent: string }) {
  if (!items.length) return null
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`px-2 py-0.5 rounded text-[11px] font-medium ${accent}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function BlueprintServiceStack({ azure, cloudflare, ai, dataLayer, devOps }: Props) {
  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-6 flex flex-col gap-5">
      <h3 className="text-white font-semibold text-base">Technology Stack</h3>
      <BadgeList label="Azure Services" items={azure} accent="bg-azure/10 text-azure-300" />
      <BadgeList label="Cloudflare" items={cloudflare} accent="bg-cf-orange/10 text-cf-300" />
      <BadgeList label="AI / ML" items={ai} accent="bg-purple-900/40 text-purple-300" />
      <BadgeList label="Data Layer" items={dataLayer} accent="bg-slate-800 text-slate-400" />
      <BadgeList label="DevOps & IaC" items={devOps} accent="bg-slate-800 text-slate-400" />
    </div>
  )
}
