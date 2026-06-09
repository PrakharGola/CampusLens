const express = require('express')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

router.get('/', requireAuth, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id)

  const unreadCount = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(req.user.id).c

  res.json({ data: { notifications, unreadCount } })
})

router.patch('/:notificationId/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
    .run(req.params.notificationId, req.user.id)
  res.json({ data: { updated: true } })
})

router.patch('/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ data: { updated: true } })
})

module.exports = router
