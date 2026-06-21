'use client'

import { useState } from 'react'

type Props = {
  repositoryId: string
  installationId: string | null
  initialStakeholderMarkdown: string | null
  initialEngineerMarkdown: string | null
}

type Audience = 'stakeholder' | 'engineer'

export default function HandoverReportPanel({
  repositoryId,
  installationId,
  initialStakeholderMarkdown,
  initialEngineerMarkdown,
}: Props) {
  const [stakeholder, setStakeholder] = useState<string | null>(initialStakeholderMarkdown)
  const [engineer, setEngineer] = useState<string | null>(initialEngineerMarkdown)
  const [audience, setAudience] = useState<Audience>('stakeholder')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const markdown = audience === 'stakeholder' ? stakeholder : engineer
  const hasReport = Boolean(stakeholder || engineer)

  async function handleGenerate() {
    if (!installationId) {
      setError('Inspect the repository before generating a handover report.')
      return
    }
    setWorking(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/v1/repositories/${repositoryId}/installations/${installationId}/report`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Failed to generate report')
      }
      const data = (await res.json()) as { stakeholderMarkdown: string; engineerMarkdown: string }
      setStakeholder(data.stakeholderMarkdown)
      setEngineer(data.engineerMarkdown)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setWorking(false)
    }
  }

  async function handleCopy() {
    if (!markdown) return
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `handover-${audience}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!hasReport) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 flex flex-col items-center gap-4 text-center">
        <h3 className="text-white font-semibold">No handover report yet</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Generate a stakeholder-readable deployment explanation and a technical install guide for
          infrastructure engineers from this repository&apos;s cloud installation.
        </p>
        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={working || !installationId}
          className="px-5 py-2.5 rounded-lg bg-azure text-white text-sm font-semibold hover:bg-azure-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {working ? 'Generating…' : 'Generate handover report'}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg bg-slate-900/60 p-0.5">
          <button
            onClick={() => setAudience('stakeholder')}
            className={`px-3 py-1 text-xs font-medium rounded ${audience === 'stakeholder' ? 'bg-azure text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Stakeholder
          </button>
          <button
            onClick={() => setAudience('engineer')}
            className={`px-3 py-1 text-xs font-medium rounded ${audience === 'engineer' ? 'bg-azure text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Engineer
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={working}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {working ? 'Regenerating…' : 'Regenerate'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Download
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-medium rounded bg-azure text-white hover:bg-azure-600 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>
        </div>
      </div>
      {error && <p className="px-5 py-2 text-red-400 text-xs font-mono">{error}</p>}
      <div className="p-5 overflow-x-auto">
        <pre className="text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
          {markdown}
        </pre>
      </div>
    </div>
  )
}
