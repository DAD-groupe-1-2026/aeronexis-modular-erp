// Middleware qui lit le header X-User injecté par NGINX après validation JWT
function authenticate(req, res, next) {
  const userHeader = req.get('X-User')
  if (!userHeader) {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Missing user context from gateway' },
    })
  }

  try {
    req.user = JSON.parse(userHeader)
    next()
  } catch (err) {
    return res.status(401).json({
      status: 'failure',
      data: null,
      error: { code: 'INVALID_USER_CONTEXT', message: 'Malformed user header' },
    })
  }
}

module.exports = { authenticate }
