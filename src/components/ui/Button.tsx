import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  className?: string
  href?: string
  to?: string
  onClick?: () => void
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  href,
  to,
  onClick,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rm-black'

  const variants = {
    primary:
      'bg-azure text-white hover:bg-azure-600 hover:shadow-lg hover:shadow-azure/25 hover:-translate-y-0.5 focus:ring-azure',
    secondary:
      'border border-slate-600 text-slate-200 hover:border-slate-400 hover:bg-slate-800/60 hover:-translate-y-0.5 focus:ring-slate-500',
    ghost:
      'text-slate-300 hover:text-white hover:bg-slate-800/40 focus:ring-slate-600',
  }

  const combined = `${base} ${variants[variant]} ${className}`.trim()

  if (to) {
    return <Link href={to} className={combined}>{children}</Link>
  }
  if (href) {
    return <a href={href} className={combined}>{children}</a>
  }
  return (
    <button type="button" className={combined} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
