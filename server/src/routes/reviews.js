const express = require('express')
const router = express.Router()
const controller = require('../controllers/reviewController')
const { requireAuth, requireRole } = require('../middleware/auth')

// Stats endpoint - requires reviewer role
router.get('/stats', requireAuth, requireRole('admin', 'reviewer'), controller.getStats)

// List all review items - requires reviewer role
router.get('/', requireAuth, requireRole('admin', 'reviewer'), controller.getAll)

// Get single review item - requires reviewer role
router.get('/:id', requireAuth, requireRole('admin', 'reviewer'), controller.getOne)

// Create review item - any authenticated user can submit
router.post('/', requireAuth, controller.create)

// Make review decision - requires reviewer role
router.post('/:id/decision', requireAuth, requireRole('admin', 'reviewer'), controller.makeDecision)

// Resubmit after revision - submitter or admin
router.post('/:id/resubmit', requireAuth, controller.resubmit)

// Update review item - submitter or admin
router.put('/:id', requireAuth, controller.update)

// Delete review item - admin only
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove)

module.exports = router
