import type { Question } from '../../../types/scaffold'
import OptionButton from './OptionButton'

type QuestionCardProps = {
  question: Question
  selectedValue?: string
  onSelect: (value: string) => void
}

export default function QuestionCard({ question, selectedValue, onSelect }: QuestionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">{question.question}</h2>
      <div className="mt-6 grid gap-3">
        {question.options.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            icon={option.icon}
            selected={selectedValue === option.value}
            onClick={() => onSelect(option.value)}
          />
        ))}
      </div>
    </section>
  )
}
