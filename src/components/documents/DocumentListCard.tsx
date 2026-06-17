'use client'

import { useState } from 'react'

const parseStatusColour: Record<string, string> = {
  pending: 'bg-slate-800 text-slate-400',
  uploaded: 'bg-amber-900/40 text-amber-400',
  parsed: 'bg-azure/20 text-azure-300',
  failed: 'bg-red-900/40 text-red-400',
}

const fileTypeColour: Record<string, string> = {
  pdf: 'bg-red-900/30 text-red-300',
  docx: 'bg-blue-900/30 text-blue-300',
  terraform: 'bg-purple-900/30 text-purple-300',
  bicep: 'bg-indigo-900/30 text-indigo-300',
  arm: 'bg-sky-900/30 text-sky-300',
  csv: 'bg-green-900/30 text-green-300',
  markdown: 'bg-slate-700 text-slate-300',
  screenshot: 'bg-cf-orange/10 text-cf-300',
}

type Props = {
  id: string
  fileName: string
  fileType: string
  parseStatus: string
  findingsCount: number
  onParse: (id: string) => Promise<void>
  onAnalyse: (id: string) => Promise<void>
}

export default function DocumentListCard({ id, fileName, fileType, parseStatus, findingsCount, onParse, onAnalyse }: Props) {
  const [parsing, setParsing] = useState(false)
  const [analysing, setAnalysing] = useState(false)

  async function handleParse() {
    setParsing(true)
    await onParse(id)
    setParsing(false)
  }

  async function handleAnalyse() {
    setAnalysing(true)
    await onAnalyse(id)
    setAnalysing(false)
  }

  return (
    <div className="rounded-xl bg-rm-dark-2/70 border border-slate-800 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{fileName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${fileTypeColour[fileType] ?? 'bg-slate-800 text-slate-400'}`}>
              {fileType}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${parseStatusColour[parseStatus] ?? parseStatusColour.pending}`}>
              {parseStatus}
            </span>
          </div>
        </div>
        {findingsCount > 0 && (
          <span className="flex-shrink-0 text-slate-500 text-xs font-mono">{findingsCount} findings</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleParse}
          disabled={parsing || parseStatus === 'pending'}
          className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:border-slate-500 hover:text-white transition-colors disabled:opacity-40"
        >
          {parsing ? 'Parsing…' : 'Parse'}
        </button>
        <button
          type="button"
          onClick={handleAnalyse}
          disabled={analysing || parseStatus !== 'parsed'}
          className="px-3 py-1.5 rounded-lg bg-azure/20 border border-azure/40 text-azure-300 text-xs font-medium hover:bg-azure/30 transition-colors disabled:opacity-40"
        >
          {analysing ? 'Analysing…' : 'AI Analyse'}
        </button>
      </div>
    </div>
  )
}
