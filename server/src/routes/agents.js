const express = require('express')
const router = express.Router()
const controller = require('../controllers/agentsController')
const { validateCreateAgent, validateUpdateAgent, validateChatRequest } = require('../middleware/validateBody')
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth')

// Model info endpoint (no auth required)
router.get('/models', controller.getModels)

// CRUD routes
router.get('/', controller.getAll)
router.post('/', validateCreateAgent, requireAuth, requireRole('admin','editor'), controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', validateUpdateAgent, requireAuth, requireRole('admin','editor'), controller.update)
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove)

// Chat routes
router.post('/:id/chat', validateChatRequest, optionalAuth, controller.chat)

// Conversation management routes
router.get('/:id/conversations', optionalAuth, controller.getConversations)
router.get('/:id/conversations/:convId', optionalAuth, controller.getConversation)
router.delete('/:id/conversations/:convId', optionalAuth, controller.deleteConversation)

module.exports = router
