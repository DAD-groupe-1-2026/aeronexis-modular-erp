const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * POST /auth/login
 * Body: { email, password }
 * Retourne: { status, data: { token, user } }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'failure',
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Email et mot de passe requis' },
      })
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        status: 'failure',
        data: null,
        error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' },
      })
    }

    const valid = await user.isValidPassword(password)
    if (!valid) {
      return res.status(401).json({
        status: 'failure',
        data: null,
        error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' },
      })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role, 
        siteName: user.siteName,
        firstName: user.firstName,
        lastName: user.lastName 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    )

    return res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          siteName: user.siteName,
        },
      },
    })
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      data: null,
      error: { code: 'SERVER_ERROR', message: err.message },
    })
  }
}

/**
 * POST /auth/register
 * Body: { firstName, lastName, email, password, role? }
 * Retourne: { status, data: { user } }
 */
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: 'failure',
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Tous les champs sont requis' },
      })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({
        status: 'failure',
        data: null,
        error: { code: 'CONFLICT', message: 'Cet email est déjà utilisé' },
      })
    }

    // Le modèle User applique le hash via hooks Sequelize (beforeCreate/beforeUpdate).
    const user = await User.create({ firstName, lastName, email, passwordHash: password, role })

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          siteName: user.siteName,
        },
      },
    })
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      data: null,
      error: { code: 'SERVER_ERROR', message: err.message },
    })
  }
}

/**
 * GET /auth/users/:id
 * Route protégée utilisée pour enrichir l'affichage (userId -> profil).
 */
async function getUserById(req, res) {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({
        status: 'failure',
        data: null,
        error: { code: 'NOT_FOUND', message: 'Utilisateur introuvable' },
      })
    }

    return res.json({
      status: 'success',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        siteName: user.siteName,
      },
    })
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      data: null,
      error: { code: 'SERVER_ERROR', message: err.message },
    })
  }
}

/**
 * GET /auth/verify
 * Utilisé par NGINX auth_request pour valider le JWT avant de router.
 * Retourne 200 + header X-User si valide, 401 sinon.
 */
function verify(req, res) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).end()
  }
  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    res.set('X-User', JSON.stringify(payload))
    return res.status(200).end()
  } catch {
    return res.status(401).end()
  }
}

module.exports = { login, register, verify, getUserById }
