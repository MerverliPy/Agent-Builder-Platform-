const express = require('express')
const router = express.Router()
const controller = require('../controllers/authController')
const { requireAuth } = require('../middleware/auth')

router.post('/login', controller.login)
// optional register for development/testing
router.post('/register', controller.register)
router.get('/me', requireAuth, controller.me)
router.post('/change-password', requireAuth, controller.changePassword)

module.exports = router
