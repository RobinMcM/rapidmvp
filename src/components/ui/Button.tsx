import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
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
    'inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]'

  const variants = {
    primary:
      'bg-gradient-to-r from-[#3b82f6] to-[#7c3aed] text-white hover:opacity-90 hover:shadow-lg hover:shadow-[#3b82f6]/30 hover:-translate-y-0.5 focus:ring-[#3b82f6]',
    secondary:
      'border border-slate-500 text-slate-200 hover:border-slate-400 hover:bg-slate-800/50 hover:-translate-y-0.5 focus:ring-slate-500',
  }

  const combined = `${base} ${variants[variant]} ${className}`.trim()

  if (to) {
    return <Link to={to} className={combined}>{children}</Link>
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
