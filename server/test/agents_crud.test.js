const fetch = require('node-fetch')
const { start, stop, createAuthUserAndToken } = require('./setup')

let base

beforeAll(async () => { base = await start() })
afterAll(async () => { await stop() })

test('create -> update -> delete agent', async () => {
  const { tokenAdmin } = await createAuthUserAndToken(base)
  const payload = { name: 'CRUD Agent', skills: ['s1'], responseStyle: 'r', roles: ['r'] }
  const createRes = await fetch(`${base}/api/agents`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` }, body: JSON.stringify(payload) })
  expect(createRes.status).toBe(201)
  const created = await createRes.json()

  // update
  const updatePayload = { name: 'CRUD Agent Updated', skills: ['s2','s3'], responseStyle: 'formal', roles: ['admin'] }
  const updateRes = await fetch(`${base}/api/agents/${created.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenAdmin}` }, body: JSON.stringify(updatePayload) })
  expect(updateRes.status).toBe(200)
  const updated = await updateRes.json()
  expect(updated.name).toBe('CRUD Agent Updated')

  // delete
  const delRes = await fetch(`${base}/api/agents/${created.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenAdmin}` } })
  expect([200,204]).toContain(delRes.status)

  // ensure deleted
  const getRes = await fetch(`${base}/api/agents/${created.id}`)
  expect(getRes.status).toBe(404)
})
