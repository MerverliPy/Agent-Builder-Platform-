const storage = require('../storage')
const { normalizeAgent } = require('../models/agentModel')

async function create(req, res, next) {
  try {
    const payload = normalizeAgent(req.body || {})
    const created = await storage.create(payload)
    res.status(201).json(created)
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const list = await storage.getAll()
    res.json(list)
  } catch (err) { next(err) }
}

async function getOne(req, res, next) {
  try {
    const id = req.params.id
    const item = await storage.getById(id)
    if (!item) return res.status(404).json({ error: 'agent not found' })
    res.json(item)
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const id = req.params.id
    // only apply provided fields
    const body = req.body || {}
    const patch = {}
    if (body.name !== undefined) patch.name = body.name
    if (body.avatar !== undefined) patch.avatar = body.avatar
    if (body.skills !== undefined) patch.skills = Array.isArray(body.skills) ? body.skills : (typeof body.skills === 'string' ? body.skills.split(',').map(s=>s.trim()).filter(Boolean) : [])
    if (body.responseStyle !== undefined) patch.responseStyle = body.responseStyle
    if (body.roles !== undefined) patch.roles = Array.isArray(body.roles) ? body.roles : (typeof body.roles === 'string' ? body.roles.split(',').map(s=>s.trim()).filter(Boolean) : [])

    const updated = await storage.update(id, patch)
    if (!updated) return res.status(404).json({ error: 'agent not found' })
    res.json(updated)
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const id = req.params.id
    const ok = await storage.delete(id)
    if (!ok) return res.status(404).json({ error: 'agent not found' })
    res.status(204).end()
  } catch (err) { next(err) }
}

module.exports = { create, getAll, getOne, update, remove }
