jest.setTimeout(30000)
const fs = require('fs')
const path = require('path')
const child = require('child_process')
const { start, stop } = require('./setup')

let base

beforeAll(async () => { base = await start() })
afterAll(async () => { await stop(); await new Promise(r=>setTimeout(r,200)) })

test('upload valid image', async () => {
  // test file lives at repo root client/public/avatars when running tests from /home/calvin
  const filePath = path.join(__dirname, '..', '..', 'client', 'public', 'avatars', 'avatar1.svg')
  const axios = require('axios')
  const FormData = require('form-data')
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath))
  const res = await axios.post(`${base}/api/media/upload`, form, { headers: form.getHeaders(), maxBodyLength: 10 * 1024 * 1024 })
  expect(res.status).toBe(200)
  const body = res.data
  expect(body.url).toMatch(/\/uploads\//)
})

test('reject non-image', async () => {
  const filePath = path.join(__dirname, '..', 'README.md')
  const axios = require('axios')
  const FormData = require('form-data')
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath))
  try {
    await axios.post(`${base}/api/media/upload`, form, { headers: form.getHeaders(), maxBodyLength: 10 * 1024 * 1024 })
    throw new Error('expected failure')
  } catch (err) {
    const res = err.response
    expect(res.status).toBe(400)
    expect(res.data.error).toBeDefined()
  }
})
