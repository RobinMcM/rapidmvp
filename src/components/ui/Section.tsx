import { type ReactNode } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  heading?: string
  subheading?: string
  animate?: boolean
}

export default function Section({
  id,
  children,
  className = '',
  heading,
  subheading,
  animate = true,
}: SectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ triggerOnce: true })

  const visibilityClasses = animate
    ? `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
    : ''

  return (
    <section
      id={id}
      ref={animate ? ref : undefined}
      className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${visibilityClasses} ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <header className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">{heading}</h2>
            {subheading && (
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">{subheading}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
