'use client'

const SCRIPT_TYPES = ['Terraform', 'Azure Bicep', 'GitHub Actions', 'Cloudflare Wrangler', 'Docker Compose']

type Props = {
  selected: string
  onSelect: (type: string) => void
}

export default function ScriptTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {SCRIPT_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            selected === type
              ? 'bg-azure/20 text-white border border-azure/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  )
}
