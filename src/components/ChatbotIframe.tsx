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
const DEFAULT_WIDGET_EMBED_SRC = 'https://taxflow.uk/chatbot/embed?rule=insolvency&model=anthropic/claude-3.5-sonnet&bg=%23250411'
const DEFAULT_WIDGET_SCRIPT_SRC = 'https://taxflow.uk/chatbot-widget/usageflows-chatbot.js'

export default function ChatbotIframe() {
  const configuredWidgetScriptSrc = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_SRC?.trim()
  const widgetApiBase = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_API_BASE?.trim()
  const widgetModeId = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_MODE_ID?.trim() || 'insolvency'
  const widgetEmbedSrc = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_EMBED_SRC?.trim() || DEFAULT_WIDGET_EMBED_SRC
  const widgetModel = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_MODEL?.trim()
  const widgetBgColor = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_BG_COLOR?.trim()
  const widgetContactUrl = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_CONTACT_URL?.trim()
  const widgetContactTargetOrigin = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_CONTACT_TARGET_ORIGIN?.trim()
  const widgetAllowedParentOrigins = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_ALLOWED_PARENT_ORIGINS?.trim()
  const src = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_SRC?.trim()
  const title = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_TITLE?.trim() || 'Chatbot assistant'
  const initialOpen = process.env.NEXT_PUBLIC_CHATBOT_IFRAME_INITIAL_OPEN === 'true'
  const widgetHostRef = useRef<HTMLDivElement | null>(null)
  const widgetMountRef = useRef<HTMLDivElement | null>(null)

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
  const runtimeCacheBuster = useMemo(() => String(Date.now()), [])

  const widgetScriptSrc = useMemo(() => {
    if (configuredWidgetScriptSrc) return configuredWidgetScriptSrc
    if (!widgetEmbedSrc) return ''
    try {
      const embedUrl = new URL(widgetEmbedSrc)
      return `${embedUrl.origin}/chatbot-widget/usageflows-chatbot.js`
    } catch {
      return DEFAULT_WIDGET_SCRIPT_SRC
    }
  }, [configuredWidgetScriptSrc, widgetEmbedSrc])

  useEffect(() => {
    if (!widgetScriptSrc) return

    let cancelled = false
    const scriptId = 'usageflows-chatbot-widget-script'

    const mountWidget = () => {
      if (cancelled || !widgetMountRef.current) return
      widgetMountRef.current.innerHTML = ''
      const widgetEl = document.createElement('usageflows-chatbot')
      if (widgetEmbedSrc) {
        try {
          const embedUrl = new URL(widgetEmbedSrc)
          embedUrl.searchParams.set('cb', runtimeCacheBuster)
          widgetEl.setAttribute('embed-src', embedUrl.toString())
        } catch {
          const sep = widgetEmbedSrc.includes('?') ? '&' : '?'
          widgetEl.setAttribute('embed-src', `${widgetEmbedSrc}${sep}cb=${encodeURIComponent(runtimeCacheBuster)}`)
        }
      } else {
        widgetEl.setAttribute('mode-id', widgetModeId)
        if (widgetApiBase) widgetEl.setAttribute('api-base', widgetApiBase)
        if (widgetModel) widgetEl.setAttribute('model', widgetModel)
        if (widgetBgColor) widgetEl.setAttribute('bg-color', widgetBgColor)
      }
      if (widgetContactUrl) widgetEl.setAttribute('contact-url', widgetContactUrl)
      if (widgetContactTargetOrigin) widgetEl.setAttribute('contact-target-origin', widgetContactTargetOrigin)
      if (widgetAllowedParentOrigins) widgetEl.setAttribute('allowed-parent-origins', widgetAllowedParentOrigins)
      widgetEl.setAttribute('embedded', 'false')
      widgetEl.style.display = 'block'
      widgetEl.style.width = '100%'
      widgetEl.style.height = '100%'
      widgetMountRef.current.appendChild(widgetEl)
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
    const scriptSep = widgetScriptSrc.includes('?') ? '&' : '?'
    script.src = `${widgetScriptSrc}${scriptSep}cb=${encodeURIComponent(runtimeCacheBuster)}`
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
      if (widgetMountRef.current) widgetMountRef.current.innerHTML = ''
    }
  }, [widgetApiBase, widgetEmbedSrc, widgetModeId, widgetModel, widgetBgColor, widgetContactUrl, widgetContactTargetOrigin, widgetAllowedParentOrigins, widgetScriptSrc])

  if (widgetScriptSrc) {
    return (
      <div ref={widgetHostRef}>
        <div ref={widgetMountRef} />
        {!widgetReady && (
          <span className="fixed bottom-5 right-5 z-[9999] rounded bg-black/50 px-2 py-1 text-xs text-white/80">Loading chat...</span>
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
