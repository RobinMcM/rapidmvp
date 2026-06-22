import {
  UploadCloud,
  Search,
  ShieldCheck,
  Settings,
  Code2,
  Cloud,
  FileText,
  Network,
  Inbox,
  Box,
  ClipboardList,
  Layers,
  Database,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from './platformModel'

export const ICONS: Record<IconName, LucideIcon> = {
  upload: UploadCloud,
  search: Search,
  'shield-check': ShieldCheck,
  settings: Settings,
  code: Code2,
  cloud: Cloud,
  'file-text': FileText,
  network: Network,
  inbox: Inbox,
  box: Box,
  clipboard: ClipboardList,
  layers: Layers,
  database: Database,
}
