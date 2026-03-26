import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <article
      className={`
        relative rounded-xl overflow-hidden
        bg-slate-900/80 border border-slate-700/50
        backdrop-blur-sm
        transition-all duration-300
        hover:-translate-y-1 hover:border-slate-600/70 hover:card-glow
        ${className}
      `}
    >
      <div className="relative p-6">{children}</div>
    </article>
  )
}
