const jwt = require('jsonwebtoken')

/**
 * Contrôleur de résolution — Middleware JWT pour les routes protégées.
 * Vérifie le token Bearer et attache le payload à req.user.
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Token manquant' },
    })
  }

  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Token invalide ou expiré' },
    })
  }
}

module.exports = { authenticate }
