const express = require('express')
const router = express.Router()
const controller = require('../controllers/agentsController')
const { validateCreateAgent, validateUpdateAgent, validateChatRequest } = require('../middleware/validateBody')
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth')
const { checkReview } = require('../middleware/reviewMiddleware')

// Model info endpoint (no auth required)
router.get('/models', controller.getModels)

// CRUD routes
router.get('/', controller.getAll)
// Create agent with policy check
router.post('/', validateCreateAgent, requireAuth, requireRole('admin','editor'), checkReview({ itemType: 'agent', action: 'create' }), controller.create)
router.get('/:id', controller.getOne)
// Update agent with policy check
router.put('/:id', validateUpdateAgent, requireAuth, requireRole('admin','editor'), checkReview({ itemType: 'agent', action: 'update' }), controller.update)
// Delete agent with policy check
router.delete('/:id', requireAuth, requireRole('admin'), checkReview({ itemType: 'agent', action: 'delete' }), controller.remove)

// Chat routes
router.post('/:id/chat', validateChatRequest, optionalAuth, controller.chat)

// Conversation management routes
router.get('/:id/conversations', optionalAuth, controller.getConversations)
router.get('/:id/conversations/:convId', optionalAuth, controller.getConversation)
router.delete('/:id/conversations/:convId', optionalAuth, controller.deleteConversation)

module.exports = router
