#!/usr/bin/env node
/**
 * Kill any process using the Vite dev server port(s).
 * Run before `npm run dev` if a background session is holding the port.
 * Usage: node scripts/kill-dev-port.js  OR  npm run kill-port
 */
import { execSync } from 'child_process'

const PORTS = [5173, 5174, 5175]

for (const port of PORTS) {
  try {
    const out = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim()
    const pids = out.split(/\s+/).filter(Boolean)
    for (const pid of pids) {
      console.log(`Killing process ${pid} on port ${port}`)
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'inherit' })
      } catch (_) {}
    }
  } catch {
    // No process on this port (lsof exits 1)
  }
}
console.log('Ports', PORTS.join(', '), 'cleared.')
