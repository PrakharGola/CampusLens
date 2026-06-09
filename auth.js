const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'campuslens_dev_secret_change_me'

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function authOptional(req, _res, next) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.slice(7), JWT_SECRET)
      req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    } catch {}
  }
  next()
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: { message: 'Authentication required' } })
  }
  next()
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Insufficient permissions' } })
    }
    next()
  }
}

module.exports = { signToken, authOptional, requireAuth, requireRoles, JWT_SECRET }
