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

/**
 * Optional authentication - sets req.user if valid token provided, but doesn't require it
 */
function optionalAuth(req, res, next) {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ')) {
    req.user = null
    return next()
  }
  const token = h.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
  } catch (err) {
    req.user = null
  }
  return next()
}

function requireRole(...roles) {
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || []
    const ok = roles.some(r => userRoles.includes(r))
    if (!ok) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

module.exports = { requireAuth, optionalAuth, requireRole }
