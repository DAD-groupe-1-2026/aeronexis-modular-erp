const { Router } = require('express')
const { login, register, verify, getUserById } = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/authenticate')

const router = Router()

// Routes publiques
router.post('/login', login)
router.post('/register', register)

// Route interne utilisée par NGINX auth_request
router.get('/verify', verify)
router.get('/users/:id', authenticate, getUserById)

module.exports = router
