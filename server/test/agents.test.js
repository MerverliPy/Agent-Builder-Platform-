const fetch = require('node-fetch')
const { start, stop, createAuthUserAndToken } = require('./setup')

let base

beforeAll(async () => { base = await start() })
afterAll(async () => { await stop() })

test('health returns ok', async () => {
  const res = await fetch(`${base}/api/health`)
  const body = await res.json()
  expect(res.status).toBe(200)
  expect(body.status).toBe('ok')
})

test('create and fetch agent', async () => {
  const { tokenAdmin } = await createAuthUserAndToken(base)
  const payload = { name: 'Test Agent', skills: ['a','b'], responseStyle: 'friendly', roles: ['admin'] }
  const createRes = await fetch(`${base}/api/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` }, body: JSON.stringify(payload) })
  expect(createRes.status).toBe(201)
  const created = await createRes.json()
  expect(created.id).toBeTruthy()

  const getRes = await fetch(`${base}/api/agents/${created.id}`)
  expect(getRes.status).toBe(200)
  const got = await getRes.json()
  expect(got.name).toBe('Test Agent')
})
