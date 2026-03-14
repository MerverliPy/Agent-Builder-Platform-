const storage = require('../storage')
const { normalizeUser } = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

async function register(req, res, next) {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ error: 'username and password required' })
    // ensure unique username
    const all = await storage.getAll()
    if (all.some(u => u.username === username)) return res.status(400).json({ error: 'username exists' })
    const hash = await bcrypt.hash(password, 8)
    
    // First user gets admin role, subsequent users are 'editor' by default
    const existingUsers = all.filter(u => u.type === 'user')
    const defaultRoles = existingUsers.length === 0 ? ['admin'] : ['editor']
    
    const user = normalizeUser({ username, passwordHash: hash, roles: defaultRoles })
    const created = await storage.create(Object.assign({}, user, { type: 'user' }))
    res.status(201).json({ id: created.id, username: created.username, roles: created.roles })
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ error: 'username and password required' })
    const all = await storage.getAll()
    const u = all.find(x => x.type === 'user' && x.username === username)
    if (!u) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, u.passwordHash || '')
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ sub: u.id, username: u.username, roles: u.roles || [] }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
    res.json({ token, expiresIn: JWT_EXPIRES_IN })
  } catch (err) { next(err) }
}

async function me(req, res, next) {
  try {
    const id = req.user && req.user.sub
    if (!id) return res.status(401).json({ error: 'missing token' })
    const u = await storage.getById(id)
    if (!u || u.type !== 'user') return res.status(404).json({ error: 'user not found' })
    // don't expose passwordHash
    const { passwordHash, ...publicUser } = u
    res.json(publicUser)
  } catch (err) { next(err) }
}

async function changePassword(req, res, next) {
  try {
    const id = req.user && req.user.sub
    if (!id) return res.status(401).json({ error: 'missing token' })
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' })
    const u = await storage.getById(id)
    if (!u || u.type !== 'user') return res.status(404).json({ error: 'user not found' })
    const ok = await bcrypt.compare(currentPassword, u.passwordHash || '')
    if (!ok) return res.status(401).json({ error: 'invalid current password' })
    const hash = await bcrypt.hash(newPassword, 8)
    await storage.update(id, { passwordHash: hash })
    res.status(204).end()
  } catch (err) { next(err) }
}

module.exports = { login, register, me, changePassword }
