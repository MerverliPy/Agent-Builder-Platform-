const express = require('express')
const router = express.Router()
const storage = require('../storage')
const { requireAuth, requireRole } = require('../middleware/auth')

/**
 * GET /api/admin/users - List all users (admin only)
 */
router.get('/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const all = await storage.getAll()
    const users = all.filter(u => u.type === 'user').map(u => {
      const { passwordHash, ...publicUser } = u
      return publicUser
    })
    res.json(users)
  } catch (err) { next(err) }
})

/**
 * PUT /api/admin/users/:id/role - Update user role (admin only)
 * Request body: { role: 'admin' | 'editor' | 'viewer' }
 */
router.put('/users/:id/role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body || {}
    
    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'role must be one of: admin, editor, viewer' })
    }
    
    const user = await storage.getById(id)
    if (!user || user.type !== 'user') {
      return res.status(404).json({ error: 'user not found' })
    }
    
    // Don't allow removing your own admin role
    if (req.user.sub === id && role !== 'admin') {
      return res.status(400).json({ error: 'cannot remove your own admin role' })
    }
    
    await storage.update(id, { roles: [role] })
    const updated = await storage.getById(id)
    const { passwordHash, ...publicUser } = updated
    res.json(publicUser)
  } catch (err) { next(err) }
})

/**
 * POST /api/admin/users/:id/roles - Add role to user (admin only)
 * Request body: { role: 'admin' | 'editor' | 'viewer' }
 */
router.post('/users/:id/roles', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body || {}
    
    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'role must be one of: admin, editor, viewer' })
    }
    
    const user = await storage.getById(id)
    if (!user || user.type !== 'user') {
      return res.status(404).json({ error: 'user not found' })
    }
    
    const currentRoles = user.roles || []
    if (currentRoles.includes(role)) {
      return res.status(400).json({ error: `user already has role: ${role}` })
    }
    
    const newRoles = [...currentRoles, role]
    await storage.update(id, { roles: newRoles })
    const updated = await storage.getById(id)
    const { passwordHash, ...publicUser } = updated
    res.json(publicUser)
  } catch (err) { next(err) }
})

/**
 * DELETE /api/admin/users/:id/roles/:role - Remove role from user (admin only)
 */
router.delete('/users/:id/roles/:role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id, role } = req.params
    
    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'role must be one of: admin, editor, viewer' })
    }
    
    const user = await storage.getById(id)
    if (!user || user.type !== 'user') {
      return res.status(404).json({ error: 'user not found' })
    }
    
    // Don't allow removing your own admin role
    if (req.user.sub === id && role === 'admin') {
      return res.status(400).json({ error: 'cannot remove your own admin role' })
    }
    
    const currentRoles = user.roles || []
    const newRoles = currentRoles.filter(r => r !== role)
    await storage.update(id, { roles: newRoles })
    const updated = await storage.getById(id)
    const { passwordHash, ...publicUser } = updated
    res.json(publicUser)
  } catch (err) { next(err) }
})

module.exports = router
