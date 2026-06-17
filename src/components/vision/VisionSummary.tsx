'use client'

const blueprintLabels: Record<string, string> = {
  'ai-saas-platform': 'AI SaaS Platform',
  'multi-tenant-saas-platform': 'Multi-Tenant SaaS Platform',
  'rag-knowledge-platform': 'RAG Knowledge Platform',
  'global-content-platform': 'Global Content Platform',
  'enterprise-automation-platform': 'Enterprise Automation Platform',
}

type Props = {
  summary: string
  recommendedBlueprint: string
  onConfirm: () => void
  onBack: () => void
  saving: boolean
}

export default function VisionSummary({ summary, recommendedBlueprint, onConfirm, onBack, saving }: Props) {
  const label = blueprintLabels[recommendedBlueprint] ?? recommendedBlueprint

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-azure mb-1">Recommended Blueprint</p>
        <h2 className="text-white font-bold text-xl">{label}</h2>
      </div>

      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-3">Architecture Summary</p>
        <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
      </div>

      <p className="text-slate-500 text-xs">
        This recommendation is generated deterministically from your answers. You can change blueprint type at any time within your workspace.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Confirm and Save'}
        </button>
      </div>
    </div>
  )
}
