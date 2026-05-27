/**
 * Middleware d'authentification — lit le header X-User injecté par NGINX
 * après validation du JWT via auth_request → auth-service /auth/verify.
 */
function authenticate(req, res, next) {
  const xUser = req.headers['x-user']
  if (!xUser) {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Identité non transmise par le gateway' },
    })
  }
  try {
    req.user = JSON.parse(xUser)
    next()
  } catch {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Header X-User invalide' },
    })
  }
}

module.exports = { authenticate }
