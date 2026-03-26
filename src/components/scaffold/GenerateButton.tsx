type GenerateButtonProps = {
  disabled?: boolean
  loading?: boolean
  estimatedCost?: string
  onGenerate: () => void
}

export default function GenerateButton({ disabled, loading, estimatedCost = 'TBD', onGenerate }: GenerateButtonProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-300">
        Estimated generation cost: <span className="font-semibold text-white">{estimatedCost}</span>
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || loading}
        className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Scaffold (Placeholder)'}
      </button>
    </div>
  )
}
