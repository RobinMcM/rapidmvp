'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = { blueprintId: string }

export default function BlueprintSubNav({ blueprintId }: Props) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Assessment',    href: `/workspace/blueprints/${blueprintId}/assessment` },
    { label: 'Costs & Risks', href: `/workspace/blueprints/${blueprintId}/costs-risks` },
    { label: 'Build Scripts', href: `/workspace/blueprints/${blueprintId}/scripts` },
    { label: 'Documents',     href: `/workspace/blueprints/${blueprintId}/documents` },
    { label: 'Acceptance',    href: `/workspace/blueprints/${blueprintId}/acceptance` },
    { label: 'Financial',     href: `/workspace/blueprints/${blueprintId}/financial` },
  ]

  return (
    <div className="bg-rm-dark border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Blueprint sections">
          {tabs.map(({ label, href }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-azure text-white'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
