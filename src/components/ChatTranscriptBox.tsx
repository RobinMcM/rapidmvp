'use client'

import { useEffect, useMemo, useState } from 'react'

type ContactPayloadMessage = {
  type?: string
  source?: string
  summary?: string
  transcript?: Array<{ role?: string; content?: string }>
}

const ALLOWED_ORIGINS = new Set(['https://chatbot.rapidmvp.io', 'https://chatbot.openrouter.io', 'http://localhost:3000'])

function formatPayloadText(payload: ContactPayloadMessage): string {
  const summary = typeof payload.summary === 'string' ? payload.summary.trim() : ''
  const transcript = Array.isArray(payload.transcript) ? payload.transcript : []
  const transcriptText = transcript
    .map((item) => `${typeof item?.role === 'string' ? item.role : 'assistant'}: ${typeof item?.content === 'string' ? item.content : ''}`)
    .join('\n\n')
    .trim()
  if (summary && transcriptText) return `${summary}\n\n${transcriptText}`
  return summary || transcriptText
}

export default function ChatTranscriptBox() {
  const [value, setValue] = useState('')
  const helperText = useMemo(
    () => (value ? 'Chat transcript captured from Contact button.' : 'Click Contact in chatbot to populate this field.'),
    [value]
  )

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!ALLOWED_ORIGINS.has(event.origin)) return
      const data = (event.data ?? {}) as ContactPayloadMessage
      if (data.type !== 'usageflows:contactPayload' || data.source !== 'usageflows-chatbot') return
      setValue(formatPayloadText(data))
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <section className="mx-auto mt-10 max-w-5xl px-6 pb-8">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6">
        <label htmlFor="chat-transcript-box" className="mb-2 block text-sm font-medium text-slate-200">
          Chat Transcript (from Contact button)
        </label>
        <textarea
          id="chat-transcript-box"
          name="chatTranscript"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          placeholder="No transcript yet."
        />
        <p className="mt-2 text-xs text-slate-400">{helperText}</p>
      </div>
    </section>
  )
}
