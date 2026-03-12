const { genId } = require('../utils/id')

function normalizeUser(payload = {}) {
  const now = new Date().toISOString()
  return {
    id: payload.id || genId('u_'),
    username: String(payload.username || '').trim(),
    passwordHash: payload.passwordHash || null,
    roles: Array.isArray(payload.roles) ? payload.roles : (payload.roles ? String(payload.roles).split(',').map(s=>s.trim()).filter(Boolean) : []),
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now
  }
}

module.exports = { normalizeUser }
