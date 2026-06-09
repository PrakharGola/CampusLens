const express = require('express')
const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')
const db = require('../db')
const { signToken, requireAuth } = require('../auth')

const router = express.Router()

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ error: { message: 'Name, email, and password (min 6 chars) required' } })
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: { message: 'Email already registered' } })

  const id = nanoid()
  const passwordHash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
    id, name, email, passwordHash, 'VIEWER'
  )

  const user = { id, name, email, role: 'VIEWER' }
  res.status(201).json({ data: { user, token: signToken(user) } })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password required' } })
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: { message: 'Invalid email or password' } })
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role, avatarUrl: row.avatar_url }
  res.json({ data: { user, token: signToken(user) } })
})

router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?').get(req.user.id)
  if (!row) return res.status(404).json({ error: { message: 'User not found' } })
  res.json({ data: { id: row.id, name: row.name, email: row.email, role: row.role, avatarUrl: row.avatar_url } })
})

module.exports = router
