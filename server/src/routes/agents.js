const express = require('express')
const router = express.Router()
const controller = require('../controllers/agentsController')
const { validateCreateAgent, validateUpdateAgent, validateChatRequest } = require('../middleware/validateBody')
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth')
const { checkReview } = require('../middleware/reviewMiddleware')

// Conditionally apply review middleware (disabled in test environment)
const applyReviewCheck = (options) => {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_REVIEW_CHECKS === 'true') {
    return (req, res, next) => next() // No-op middleware in tests
  }
  return checkReview(options)
}

// Model info endpoint (no auth required)
router.get('/models', controller.getModels)

// CRUD routes
router.get('/', controller.getAll)
// Create agent with policy check (disabled in test env)
router.post('/', validateCreateAgent, requireAuth, requireRole('admin','editor'), applyReviewCheck({ itemType: 'agent', action: 'create' }), controller.create)
router.get('/:id', controller.getOne)
// Update agent with policy check (disabled in test env)
router.put('/:id', validateUpdateAgent, requireAuth, requireRole('admin','editor'), applyReviewCheck({ itemType: 'agent', action: 'update' }), controller.update)
// Delete agent with policy check (disabled in test env)
router.delete('/:id', requireAuth, requireRole('admin'), applyReviewCheck({ itemType: 'agent', action: 'delete' }), controller.remove)

// Chat routes
router.post('/:id/chat', validateChatRequest, optionalAuth, controller.chat)

// Conversation management routes
router.get('/:id/conversations', optionalAuth, controller.getConversations)
router.get('/:id/conversations/:convId', optionalAuth, controller.getConversation)
router.delete('/:id/conversations/:convId', optionalAuth, controller.deleteConversation)

module.exports = router
