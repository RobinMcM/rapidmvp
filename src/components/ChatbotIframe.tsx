'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const DEFAULT_WIDTH = 380
const DEFAULT_HEIGHT = 560

export default function ChatbotIframe() {
  const widgetScriptSrc = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_SRC?.trim()
  const widgetApiBase = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_API_BASE?.trim()
  const widgetModeId = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_MODE_ID?.trim() || 'insolvency'
  const widgetEmbedded = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_EMBEDDED !== 'false'
  const src = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_SRC?.trim()
  const title = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_TITLE?.trim() || 'Chatbot assistant'
  const initialOpen = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_INITIAL_OPEN === 'true'
  const widgetHostRef = useRef<HTMLDivElement | null>(null)

  const width = useMemo(() => {
    const parsed = Number(process.env.NEXT_PUBLIC_CHATBOT_IFRAME_WIDTH)
    return Number.isFinite(parsed) && parsed >= 320 && parsed <= 1200 ? parsed : DEFAULT_WIDTH
  }, [])

  const height = useMemo(() => {
    const parsed = Number(process.env.NEXT_PUBLIC_CHATBOT_IFRAME_HEIGHT)
    return Number.isFinite(parsed) && parsed >= 360 && parsed <= 1200 ? parsed : DEFAULT_HEIGHT
  }, [])

  const [open, setOpen] = useState(initialOpen)
  const [loaded, setLoaded] = useState(false)
  const [widgetReady, setWidgetReady] = useState(false)

  useEffect(() => {
    if (!widgetScriptSrc) return

    let cancelled = false
    const scriptId = 'usageflows-chatbot-widget-script'

    const mountWidget = () => {
      if (cancelled || !open || !widgetHostRef.current) return
      widgetHostRef.current.innerHTML = ''
      const widgetEl = document.createElement('usageflows-chatbot')
      widgetEl.setAttribute('mode-id', widgetModeId)
      if (widgetApiBase) widgetEl.setAttribute('api-base', widgetApiBase)
      widgetEl.setAttribute('embedded', String(widgetEmbedded))
      widgetEl.style.display = 'block'
      widgetEl.style.width = '100%'
      widgetEl.style.height = '100%'
      widgetHostRef.current.appendChild(widgetEl)
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existing?.dataset.loaded === 'true') {
      setWidgetReady(true)
      mountWidget()
      return () => {
        cancelled = true
      }
    }

    const script = existing ?? document.createElement('script')
    script.id = scriptId
    script.src = widgetScriptSrc
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      setWidgetReady(true)
      mountWidget()
    }
    script.onerror = () => {
      script.dataset.loaded = 'error'
      setWidgetReady(false)
    }
    if (!existing) document.body.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [open, widgetApiBase, widgetEmbedded, widgetModeId, widgetScriptSrc])

  if (widgetScriptSrc) {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open chatbot"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-500"
          >
            <ChatIcon />
          </button>
        ) : (
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
            style={{ width: `${width}px`, height: `${height}px`, maxWidth: 'calc(100vw - 1.5rem)', maxHeight: 'calc(100vh - 5rem)' }}
          >
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 text-xs text-white/70">
              <span>{title}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                className="rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
            {!widgetReady && (
              <div className="absolute m-3 rounded bg-black/50 px-2 py-1 text-xs text-white/80">
                Loading chat...
              </div>
            )}
            <div
              ref={widgetHostRef}
              style={{ width: '100%', height: 'calc(100% - 2.5rem)' }}
            />
          </div>
        )}
      </div>
    )
  }

  if (!src) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chatbot"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-500"
        >
          <ChatIcon />
        </button>
      ) : (
        <div
          className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: 'calc(100vw - 1.5rem)', maxHeight: 'calc(100vh - 5rem)' }}
        >
          <div className="flex h-10 items-center justify-between border-b border-white/10 px-3 text-xs text-white/70">
            <span>{title}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chatbot"
              className="rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
          {!loaded && (
            <div className="absolute m-3 rounded bg-black/50 px-2 py-1 text-xs text-white/80">
              Loading chat...
            </div>
          )}
          <iframe
            src={src}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            style={{ width: '100%', height: 'calc(100% - 2.5rem)', border: 0, background: '#fff' }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}
    </div>
  )
}
