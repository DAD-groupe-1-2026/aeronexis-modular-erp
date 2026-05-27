const { Router } = require('express')
const { login, register, verify } = require('../controllers/auth.controller')

const router = Router()

// Routes publiques
router.post('/login', login)
router.post('/register', register)

// Route interne utilisée par NGINX auth_request
router.get('/verify', verify)

module.exports = router
