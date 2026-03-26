type OptionButtonProps = {
  label: string
  icon?: string
  selected: boolean
  onClick: () => void
}

export default function OptionButton({ label, icon, selected, onClick }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-500/10 text-white'
          : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500'
      }`}
    >
      <span className="flex items-center gap-3">
        {icon ? <span className="text-sm uppercase text-slate-400">{icon}</span> : null}
        <span className="font-medium">{label}</span>
      </span>
    </button>
  )
}
