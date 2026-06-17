'use client'

import { useState } from 'react'
import ScriptTypeSelector from './ScriptTypeSelector'
import ScriptPreview from './ScriptPreview'

type Script = {
  id: string
  title: string
  scriptType: string
  content: string
  explanation?: string | null
  requiredSecrets?: string | null
  validationSteps?: string | null
}

export default function BuildScriptsView({ scripts }: { scripts: Script[] }) {
  const availableTypes = [...new Set(scripts.map((s) => s.scriptType))]
  const [selectedType, setSelectedType] = useState(availableTypes[0] ?? 'Terraform')

  const currentScript = scripts.find((s) => s.scriptType === selectedType) ?? null

  if (scripts.length === 0) {
    return (
      <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-10 text-center">
        <p className="text-slate-500 text-sm">No build scripts defined for this blueprint yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Left: script type selector */}
      <div className="flex-shrink-0 w-full sm:w-52">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mb-3">Script Type</p>
        <ScriptTypeSelector selected={selectedType} onSelect={setSelectedType} />
      </div>

      {/* Right: script preview */}
      <div className="flex-1 min-w-0 rounded-xl bg-rm-dark-2/70 border border-slate-800 p-5">
        {currentScript ? (
          <ScriptPreview script={currentScript} />
        ) : (
          <p className="text-slate-500 text-sm">No script for {selectedType}.</p>
        )}
      </div>
    </div>
  )
}
