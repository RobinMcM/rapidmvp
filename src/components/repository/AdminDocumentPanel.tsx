'use client'

import { useState } from 'react'

type Props = {
  assessmentId: string
  markdown: string
  onRegenerated: (newMarkdown: string) => void
}

export default function AdminDocumentPanel({ assessmentId, markdown, onRegenerated }: Props) {
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/v1/repository-assessment/${assessmentId}/generate-document`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = (await res.json()) as { adminDocumentMarkdown: string }
        onRegenerated(data.adminDocumentMarkdown)
      }
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <span className="text-slate-300 font-semibold text-sm">Azure Administrator Installation Document</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-medium rounded bg-azure text-white hover:bg-azure-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
          {markdown}
        </pre>
      </div>
    </div>
  )
}
