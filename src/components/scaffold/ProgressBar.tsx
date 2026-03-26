type ProgressBarProps = {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const safeTotal = Math.max(1, totalSteps)
  const safeCurrent = Math.min(Math.max(currentStep, 1), safeTotal)
  const progressPercent = (safeCurrent / safeTotal) * 100

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>
          Step {safeCurrent} of {safeTotal}
        </span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}
