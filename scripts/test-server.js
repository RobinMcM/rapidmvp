#!/usr/bin/env node
/**
 * Quick test: does the dev server respond?
 * Run while "npm run dev" is running in another terminal.
 * Usage: npm run dev:test
 */
const port = process.env.PORT || 5173
const url = `http://127.0.0.1:${port}/`

fetch(url, { signal: AbortSignal.timeout(5000) })
  .then((res) => {
    console.log('Server responded:', res.status)
    return res.text()
  })
  .then((html) => {
    console.log('HTML length:', html?.length ?? 0, 'bytes')
    if (html?.includes('root')) console.log('Contains #root - OK')
  })
  .catch((err) => {
    console.error('Server not responding:', err.message)
    process.exit(1)
  })
