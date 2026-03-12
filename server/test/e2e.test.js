const fetch = require('node-fetch')
const { start, stop } = require('./setup')

let base

beforeAll(async () => { base = await start() })
afterAll(async () => { await stop() })

test('full flow: register -> login -> create -> update -> delete agent', async () => {
  const username = `e2e_${Date.now()}`
  const password = 'pass1234'

  // register
  const reg = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, roles: ['editor','admin'] }) })
  expect(reg.status).toBe(201)

  // login
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  expect(login.status).toBe(200)
  const ld = await login.json()
  const token = ld.token
  expect(token).toBeTruthy()

  // create agent
  const payload = { name: 'E2E Agent', skills: ['x'], responseStyle: 'casual', roles: ['r'] }
  const createRes = await fetch(`${base}/api/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
  expect(createRes.status).toBe(201)
  const created = await createRes.json()
  expect(created.name).toBe('E2E Agent')

  // update agent
  const update = { name: 'E2E Agent Updated', skills: ['a','b'] }
  const upRes = await fetch(`${base}/api/agents/${created.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(update) })
  expect(upRes.status).toBe(200)
  const updated = await upRes.json()
  expect(updated.name).toBe('E2E Agent Updated')

  // delete agent
  const delRes = await fetch(`${base}/api/agents/${created.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  expect([200,204]).toContain(delRes.status)

  // ensure deleted
  const getRes = await fetch(`${base}/api/agents/${created.id}`)
  expect(getRes.status).toBe(404)
})
