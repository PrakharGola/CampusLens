const express = require('express')
const db = require('../db')

const router = express.Router()

router.get('/media', (req, res) => {
  const q = String(req.query.q || '')
  if (!q) return res.json({ data: [] })

  const rows = db.prepare(`
    SELECT DISTINCT m.*, u.name AS uploader_name,
      (SELECT COUNT(*) FROM likes WHERE media_id = m.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE media_id = m.id) AS comment_count
    FROM media m JOIN users u ON m.uploader_id = u.id
    LEFT JOIN media_tags mt ON mt.media_id = m.id
    LEFT JOIN albums a ON m.album_id = a.id
    LEFT JOIN events e ON a.event_id = e.id
    WHERE m.caption LIKE ? OR m.original_filename LIKE ?
      OR mt.tag LIKE ? OR e.title LIKE ? OR u.name LIKE ?
    ORDER BY m.created_at DESC LIMIT 50
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)

  const items = rows.map(r => ({
    ...r,
    tags: db.prepare('SELECT tag, score FROM media_tags WHERE media_id = ?').all(r.id)
  }))

  res.json({ data: items })
})

router.get('/events', (req, res) => {
  const q = String(req.query.q || '')
  if (!q) return res.json({ data: [] })

  const rows = db.prepare(`
    SELECT e.*, c.name AS club_name FROM events e
    JOIN clubs c ON e.club_id = c.id
    WHERE e.title LIKE ? OR e.category LIKE ? OR e.description LIKE ?
    ORDER BY e.event_date DESC LIMIT 20
  `).all(`%${q}%`, `%${q}%`, `%${q}%`)

  res.json({ data: rows })
})

module.exports = router
