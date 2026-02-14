#!/usr/bin/env node
/**
 * Serve the built static site on PORT (or 8080).
 * Uses only Node built-ins so it works without the "serve" package.
 */
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = process.env.PORT || 8080
const dist = path.join(__dirname, '..', 'dist')

const mimes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url.replace(/\?.*/, '')
  let file = path.join(dist, url)

  if (!file.startsWith(dist)) {
    res.writeHead(403)
    res.end()
    return
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      file = path.join(dist, 'index.html')
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      const ext = path.extname(file)
      const type = mimes[ext] || 'application/octet-stream'
      res.writeHead(200, { 'Content-Type': type })
      res.end(data)
    })
  })
})

server.listen(port, () => {
  console.log(`Serving dist at http://localhost:${port}`)
})
