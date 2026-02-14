#!/usr/bin/env node
/**
 * Serve the built static site on PORT (or 8080).
 * Used when the platform requires a web process; for static-only, use Static Site deployment instead.
 */
const { spawn } = require('child_process')
const path = require('path')

const port = process.env.PORT || '8080'
const dist = path.join(__dirname, '..', 'dist')

const child = spawn('npx', ['serve', '-s', dist, '-l', port], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port },
  shell: true,
})

child.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
child.on('exit', (code) => {
  process.exit(code ?? 0)
})
