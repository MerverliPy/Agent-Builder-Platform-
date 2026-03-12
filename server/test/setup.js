const createApp = require('../src/app')
const http = require('http')
const cleanupUploads = require('../src/tasks/cleanupUploads')
const fetch = require('node-fetch')

async function createAuthUserAndToken(base) {
  // register a dev user and login to get a token with admin role
  const username = `testadmin${Date.now()}`
  const password = 'password'
  // register
  await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, roles: ['admin'] }) })
  // login
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  const data = await login.json()
  return { tokenAdmin: data.token }
}

let server

async function start() {
  const app = createApp()
  server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const { port } = server.address()
  return `http://127.0.0.1:${port}`
}

async function stop() {
  if (!server) return
  await new Promise((resolve) => server.close(resolve))
  // ensure test artifacts in uploads/ are removed to keep CI/workspace clean
  try {
    // ttlHours=0 will treat any age as eligible; dryRun=false to actually delete
    await cleanupUploads({ dryRun: false, ttlHours: 0 })
  } catch (err) {
    // swallow errors to not break test teardown
    // eslint-disable-next-line no-console
    console.error('cleanupUploads teardown error:', err)
  }
}

module.exports = { start, stop, createAuthUserAndToken }
