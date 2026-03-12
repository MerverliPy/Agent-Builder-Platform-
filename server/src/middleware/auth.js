const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = h.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || []
    const ok = roles.some(r => userRoles.includes(r))
    if (!ok) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

module.exports = { requireAuth, requireRole }
