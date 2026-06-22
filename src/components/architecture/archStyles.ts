import {
  Users,
  AppWindow,
  Database,
  ShieldCheck,
  HardDrive,
  Mail,
  ListChecks,
  Plug,
  Cloud,
  type LucideIcon,
} from 'lucide-react'
import type { ArchConfidence, ArchNodeKind } from '../../lib/repository/architecture-model'

export const NODE_ICON: Record<ArchNodeKind, LucideIcon> = {
  user: Users,
  application: AppWindow,
  database: Database,
  authentication: ShieldCheck,
  storage: HardDrive,
  email: Mail,
  queue: ListChecks,
  external_service: Plug,
  deployment_target: Cloud,
}

export type ConfidenceStyle = {
  badge: string
  dot: string
  ring: string
  text: string
}

// Confidence is conveyed by badge TEXT + icon as well as colour (colour-blind safe).
export const CONFIDENCE_STYLE: Record<ArchConfidence, ConfidenceStyle> = {
  detected: {
    badge: 'bg-emerald-900/40 text-emerald-300',
    dot: 'bg-emerald-500',
    ring: 'border-emerald-900/50',
    text: 'text-emerald-300',
  },
  likely: {
    badge: 'bg-amber-900/30 text-amber-300',
    dot: 'bg-amber-500',
    ring: 'border-amber-900/40',
    text: 'text-amber-300',
  },
  requires_clarification: {
    badge: 'bg-slate-800 text-slate-300',
    dot: 'bg-slate-500',
    ring: 'border-slate-700/60',
    text: 'text-slate-300',
  },
}
