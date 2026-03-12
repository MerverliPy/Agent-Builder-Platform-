const fetch = require('node-fetch')
const { start, stop } = require('./setup')

let base

beforeAll(async () => { base = await start() })
afterAll(async () => { await stop() })

test('register -> login -> me returns public user', async () => {
  const username = `u_${Date.now()}`
  const password = 'secret'

  const reg = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, roles: ['admin'] }) })
  expect(reg.status).toBe(201)

  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  expect(login.status).toBe(200)
  const data = await login.json()
  expect(data.token).toBeTruthy()

  const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: `Bearer ${data.token}` } })
  expect(me.status).toBe(200)
  const u = await me.json()
  expect(u.username).toBe(username)
  expect(u.passwordHash).toBeUndefined()
})

test('change-password flow', async () => {
  const username = `u2_${Date.now()}`
  const password = 'oldpass'
  const newpass = 'newpass'

  // register
  const reg = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, roles: ['admin'] }) })
  expect(reg.status).toBe(201)

  // login
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  expect(login.status).toBe(200)
  const data = await login.json()

  // wrong current password
  const wrong = await fetch(`${base}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, body: JSON.stringify({ currentPassword: 'bad', newPassword: newpass }) })
  expect(wrong.status).toBe(401)

  // correct change
  const ch = await fetch(`${base}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.token}` }, body: JSON.stringify({ currentPassword: password, newPassword: newpass }) })
  expect([200,204]).toContain(ch.status)

  // old password should fail
  const loginOld = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
  expect([400,401]).toContain(loginOld.status)

  // new password should succeed
  const loginNew = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: newpass }) })
  expect(loginNew.status).toBe(200)
  const newData = await loginNew.json()
  expect(newData.token).toBeTruthy()
})
