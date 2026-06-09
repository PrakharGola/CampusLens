const express = require('express')
const { nanoid } = require('nanoid')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

router.post('/:mediaId/likes', requireAuth, (req, res) => {
  const media = db.prepare('SELECT uploader_id FROM media WHERE id = ?').get(req.params.mediaId)
  if (!media) return res.status(404).json({ error: { message: 'Media not found' } })

  const existing = db.prepare('SELECT id FROM likes WHERE media_id = ? AND user_id = ?')
    .get(req.params.mediaId, req.user.id)

  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id)
  } else {
    db.prepare('INSERT INTO likes (id, media_id, user_id) VALUES (?, ?, ?)')
      .run(nanoid(), req.params.mediaId, req.user.id)

    if (media.uploader_id !== req.user.id) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message, entity_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(nanoid(), media.uploader_id, 'LIKE', 'New like',
        'Someone liked your photo.', req.params.mediaId)
    }
  }

  const count = db.prepare('SELECT COUNT(*) AS c FROM likes WHERE media_id = ?')
    .get(req.params.mediaId).c
  res.json({ data: { liked: !existing, count } })
})

router.post('/:mediaId/favorite', requireAuth, (req, res) => {
  const existing = db.prepare('SELECT id FROM favorites WHERE media_id = ? AND user_id = ?')
    .get(req.params.mediaId, req.user.id)

  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id)
  } else {
    db.prepare('INSERT INTO favorites (id, media_id, user_id) VALUES (?, ?, ?)')
      .run(nanoid(), req.params.mediaId, req.user.id)
  }

  res.json({ data: { favorited: !existing } })
})

router.get('/:mediaId/comments', (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, u.name AS user_name, u.avatar_url AS user_avatar
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.media_id = ? ORDER BY c.created_at ASC
  `).all(req.params.mediaId)
  res.json({ data: rows })
})

router.post('/:mediaId/comments', requireAuth, (req, res) => {
  const { body } = req.body || {}
  if (!body || !body.trim()) {
    return res.status(400).json({ error: { message: 'Comment body required' } })
  }

  const media = db.prepare('SELECT uploader_id FROM media WHERE id = ?').get(req.params.mediaId)
  if (!media) return res.status(404).json({ error: { message: 'Media not found' } })

  const id = nanoid()
  db.prepare('INSERT INTO comments (id, media_id, user_id, body) VALUES (?, ?, ?, ?)')
    .run(id, req.params.mediaId, req.user.id, body.trim())

  if (media.uploader_id !== req.user.id) {
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nanoid(), media.uploader_id, 'COMMENT', 'New comment',
      'Someone commented on your photo.', req.params.mediaId)
  }

  const comment = db.prepare(`
    SELECT c.*, u.name AS user_name, u.avatar_url AS user_avatar
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(id)
  res.status(201).json({ data: comment })
})

router.get('/favorites', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT m.*, u.name AS uploader_name,
      (SELECT COUNT(*) FROM likes WHERE media_id = m.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE media_id = m.id) AS comment_count
    FROM favorites f JOIN media m ON f.media_id = m.id
    JOIN users u ON m.uploader_id = u.id
    WHERE f.user_id = ? ORDER BY f.created_at DESC
  `).all(req.user.id)

  const items = rows.map(r => ({
    ...r,
    tags: db.prepare('SELECT tag, score FROM media_tags WHERE media_id = ?').all(r.id),
    user_liked: !!db.prepare('SELECT 1 FROM likes WHERE media_id = ? AND user_id = ?').get(r.id, req.user.id),
    user_favorited: true
  }))

  res.json({ data: { items } })
})

module.exports = router
