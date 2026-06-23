'use client'

import { useEffect, type ReactNode } from 'react'
import { ArrowRight, KeyRound, Layers, X } from 'lucide-react'
import {
  AZURE_OVERVIEW_FIELDS,
  hasAzureServiceProfile,
  type AzureServiceOverview as Overview,
} from '../../lib/repository/azure-service-catalog'
import { KIND_STYLE, NODE_ICON } from './archStyles'

/**
 * The interactive Azure Service Overview — a slide-over drawer that answers
 * "What is this Azure service and how does it fit into my platform?".
 *
 * Reuses the Architecture Overview visual language: the kind-tinted icon tile
 * (NODE_ICON + KIND_STYLE), the font-mono field labels, and the rounded-2xl
 * dark surface of the inspector. Both Migration Planning and the Architecture
 * Overview open this same component, backed by the shared service catalogue.
 */
export default function AzureServiceOverview({
  overview,
  onClose,
  onSelectResource,
}: {
  overview: Overview | null
  onClose: () => void
  /** Open the overview for a related service (keeps navigation inside the drawer). */
  onSelectResource?: (resource: string) => void
}) {
  // Escape closes the drawer (keyboard dismissal, matching the inspector).
  useEffect(() => {
    if (!overview) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overview, onClose])

  if (!overview) return null

  const Icon = NODE_ICON[overview.kind]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${overview.resource} — Azure service overview`}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close Azure service overview"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-slate-700/70 bg-rm-dark-2/95 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-slate-800 bg-rm-dark-2/95 px-6 py-5 backdrop-blur">
          <span className={`flex-shrink-0 rounded-lg p-2.5 ${KIND_STYLE[overview.kind]}`}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Azure service · {overview.category}</p>
            <h3 className="text-white font-bold text-base leading-tight">{overview.resource}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-5 px-6 py-6">
          {AZURE_OVERVIEW_FIELDS.map((f) => {
            const value = overview[f.key]

            if (f.key === 'requiredSecrets') {
              return <SecretsField key={f.key} label={f.label} secrets={value as string[]} />
            }
            if (f.key === 'relatedServices') {
              return (
                <RelatedField
                  key={f.key}
                  label={f.label}
                  services={value as string[]}
                  onSelectResource={onSelectResource}
                />
              )
            }
            if (f.kind === 'list') {
              return <ListField key={f.key} label={f.label} items={value as string[]} />
            }
            return <TextField key={f.key} label={f.label} value={value as string} />
          })}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{children}</p>
}

function TextField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
    </div>
  )
}

function ListField({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
            <Layers size={14} className="text-azure-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SecretsField({ label, secrets }: { label: string; secrets: string[] }) {
  return (
    <div>
      <FieldLabel>{label} (names only)</FieldLabel>
      {secrets.length === 0 ? (
        <p className="text-slate-500 text-sm">None — this service uses managed identity rather than stored secrets.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {secrets.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded bg-slate-900/70 px-2 py-1 font-mono text-[11px] text-slate-300"
            >
              <KeyRound size={11} className="text-amber-400" aria-hidden="true" />
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function RelatedField({
  label,
  services,
  onSelectResource,
}: {
  label: string
  services: string[]
  onSelectResource?: (resource: string) => void
}) {
  if (services.length === 0) return null
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-1.5">
        {services.map((svc) => {
          const linkable = !!onSelectResource && hasAzureServiceProfile(svc)
          if (linkable) {
            return (
              <button
                key={svc}
                type="button"
                onClick={() => onSelectResource!(svc)}
                className="inline-flex items-center gap-1 rounded-full border border-azure/30 bg-azure/10 px-2.5 py-1 text-xs text-azure-300 transition-colors hover:border-azure hover:bg-azure/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure"
              >
                {svc}
                <ArrowRight size={12} aria-hidden="true" />
              </button>
            )
          }
          return (
            <span key={svc} className="inline-flex items-center rounded-full bg-slate-900/70 px-2.5 py-1 text-xs text-slate-400">
              {svc}
            </span>
          )
        })}
      </div>
    </div>
  )
}
