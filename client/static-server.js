#!/usr/bin/env node
// Minimal static file server (no deps) for serving a CRA build folder.
// Usage: HOST=0.0.0.0 PORT=3000 node static-server.js

const http = require('http')
const fs = require('fs')
const path = require('path')

const HOST = process.env.HOST || process.env.BIND_ADDR || '0.0.0.0'
const PORT = Number(process.env.PORT || process.env.LISTEN_PORT || 3000)
const BUILD_DIR = path.resolve(__dirname, 'build')

const mime = new Map([
  ['.html', 'text/html'],
  ['.js', 'application/javascript'],
  ['.css', 'text/css'],
  ['.json', 'application/json'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon']
])

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return sendIndex(res)
    const ext = path.extname(filePath)
    const type = mime.get(ext) || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=0' })
    fs.createReadStream(filePath).pipe(res)
  })
}

function sendIndex(res) {
  const index = path.join(BUILD_DIR, 'index.html')
  fs.readFile(index, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('index not found')
      return
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(req.url.split('?')[0])
    // Prevent directory traversal
    const safePath = path.normalize(urlPath).replace(/^\/+/, '')
    const filePath = path.join(BUILD_DIR, safePath)
    if (!filePath.startsWith(BUILD_DIR)) return sendIndex(res)
    // If path is a directory, serve index
    fs.stat(filePath, (err, stat) => {
      if (!err && stat.isDirectory()) return sendIndex(res)
      if (fs.existsSync(filePath)) return sendFile(res, filePath)
      // SPA fallback
      sendIndex(res)
    })
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('server error')
  }
})

server.listen(PORT, HOST, () => {
  console.log(`static server serving ${BUILD_DIR} at http://${HOST}:${PORT}`)
})
