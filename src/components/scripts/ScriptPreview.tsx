'use client'

import { useState } from 'react'

type Script = {
  id: string
  title: string
  scriptType: string
  content: string
  explanation?: string | null
  requiredSecrets?: string | null
  validationSteps?: string | null
}

export default function ScriptPreview({ script }: { script: Script }) {
  const [copied, setCopied] = useState(false)

  const requiredSecrets: string[] = script.requiredSecrets ? JSON.parse(script.requiredSecrets) : []
  const validationSteps: string[] = script.validationSteps ? JSON.parse(script.validationSteps) : []

  async function handleCopy() {
    await navigator.clipboard.writeText(script.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-base">{script.title}</h3>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{script.scriptType}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:border-slate-500 hover:text-white transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {script.explanation && (
        <p className="text-slate-400 text-sm leading-relaxed">{script.explanation}</p>
      )}

      {requiredSecrets.length > 0 && (
        <div className="rounded-lg border border-orange-900/40 bg-orange-950/20 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-orange-500 mb-2">Required Secrets</p>
          <ul className="space-y-1">
            {requiredSecrets.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-orange-300/80">
                <span className="text-orange-500 flex-shrink-0">›</span>
                <code className="font-mono text-xs">{s}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg bg-rm-dark-3 border border-slate-800/60 overflow-hidden">
        <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
          <code className="font-mono text-slate-300 whitespace-pre">{script.content}</code>
        </pre>
      </div>

      {validationSteps.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-2">Validation Steps</p>
          <ol className="space-y-2">
            {validationSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 text-slate-500 text-[10px] flex items-center justify-center font-mono mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
