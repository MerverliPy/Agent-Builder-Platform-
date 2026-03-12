const express = require('express')
const router = express.Router()
const controller = require('../controllers/agentsController')
const { validateCreateAgent, validateUpdateAgent } = require('../middleware/validateBody')
const { requireAuth, requireRole } = require('../middleware/auth')

router.get('/', controller.getAll)
router.post('/', validateCreateAgent, requireAuth, requireRole('admin','editor'), controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', validateUpdateAgent, requireAuth, requireRole('admin','editor'), controller.update)
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove)

module.exports = router
