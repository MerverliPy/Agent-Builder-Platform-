const express = require('express')
const router = express.Router()
const storage = require('../storage')

/**
 * Test Helper Routes
 * 
 * WARNING: These routes are ONLY for test environments.
 * They allow destructive operations like wiping the entire database.
 * NEVER enable in production!
 */

/**
 * POST /api/test/reset
 * 
 * Clears all agents and users from the database.
 * Returns summary of what was deleted.
 */
router.post('/reset', async (req, res) => {
  try {
    const deletedAgents = []
    const deletedUsers = []

    // Get all items from storage
    if (storage && storage.getAll) {
      const allItems = await storage.getAll()
      if (allItems && Array.isArray(allItems)) {
        for (const item of allItems) {
          if (item && item.id) {
            await storage.delete(item.id)
            
            // Track what type was deleted
            if (item.type === 'user') {
              deletedUsers.push(item.id)
            } else {
              // Assume it's an agent (or other entity)
              deletedAgents.push(item.id)
            }
          }
        }
      }
    }

    res.json({
      success: true,
      deleted: {
        agents: deletedAgents.length,
        users: deletedUsers.length
      },
      agentIds: deletedAgents,
      userIds: deletedUsers
    })
  } catch (error) {
    console.error('Test reset error:', error)
    res.status(500).json({ 
      error: 'Reset failed',
      message: error.message 
    })
  }
})

/**
 * POST /api/test/set-roles
 * 
 * Sets roles for a user (test helper)
 * Body: { username: string, roles: string[] }
 */
router.post('/set-roles', async (req, res) => {
  try {
    const { username, roles } = req.body
    
    if (!username || !roles || !Array.isArray(roles)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Requires username (string) and roles (array)'
      })
    }
    
    // Find user by username in general storage
    const allItems = await storage.getAll()
    const user = allItems.find(u => u.type === 'user' && u.username === username)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    // Update user roles
    await storage.update(user.id, { roles })
    
    res.json({
      success: true,
      userId: user.id,
      username,
      roles
    })
  } catch (error) {
    console.error('Set roles error:', error)
    res.status(500).json({
      error: 'Failed to set roles',
      message: error.message
    })
  }
})

/**
 * GET /api/test/health
 * 
 * Simple health check for test helpers endpoint
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Test helpers are available',
    warning: 'These endpoints should ONLY be used in test environments'
  })
})

module.exports = router
