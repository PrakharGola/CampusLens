const express = require('express')
const { nanoid } = require('nanoid')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

router.get('/', (req, res) => {
  const { category, search } = req.query
  let sql = `SELECT e.*, c.name AS club_name, c.logo_url AS club_logo,
    (SELECT COUNT(*) FROM albums WHERE event_id = e.id) AS album_count
    FROM events e JOIN clubs c ON e.club_id = c.id WHERE 1=1`
  const params = []

  if (!req.user) {
    sql += ` AND e.visibility = 'PUBLIC'`
  }
  if (category && category !== 'All') {
    sql += ' AND e.category = ?'
    params.push(category)
  }
  if (search) {
    sql += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.category LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  sql += ' ORDER BY e.event_date DESC'
  const rows = db.prepare(sql).all(...params)
  res.json({ data: rows })
})

router.get('/:eventId', (req, res) => {
  const event = db.prepare(`
    SELECT e.*, c.name AS club_name, c.description AS club_description, c.logo_url AS club_logo
    FROM events e JOIN clubs c ON e.club_id = c.id WHERE e.id = ?
  `).get(req.params.eventId)

  if (!event) return res.status(404).json({ error: { message: 'Event not found' } })
  if (event.visibility === 'PRIVATE' && !req.user) {
    return res.status(403).json({ error: { message: 'Login required for private event' } })
  }

  const albums = db.prepare(`
    SELECT a.*, (SELECT COUNT(*) FROM media WHERE album_id = a.id) AS media_count
    FROM albums a WHERE event_id = ? ORDER BY created_at ASC
  `).all(req.params.eventId)

  res.json({ data: { ...event, albums } })
})

router.post('/', requireAuth, (req, res) => {
  const { clubId, title, description, category, venue, eventDate, visibility, coverImageUrl } = req.body || {}
  if (!clubId || !title || !category || !eventDate) {
    return res.status(400).json({ error: { message: 'clubId, title, category, eventDate required' } })
  }

  const id = nanoid()
  db.prepare(`
    INSERT INTO events (id, club_id, title, description, category, venue, event_date, visibility, cover_image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, clubId, title, description || null, category, venue || null, eventDate,
    visibility || 'PUBLIC', coverImageUrl || null)

  const albumId = nanoid()
  db.prepare('INSERT INTO albums (id, event_id, title, description) VALUES (?, ?, ?, ?)').run(
    albumId, id, 'Main Album', 'Primary event album'
  )

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id)
  res.status(201).json({ data: event })
})

router.get('/:eventId/albums', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, (SELECT COUNT(*) FROM media WHERE album_id = a.id) AS media_count
    FROM albums a WHERE event_id = ? ORDER BY created_at ASC
  `).all(req.params.eventId)
  res.json({ data: rows })
})

router.post('/:eventId/albums', requireAuth, (req, res) => {
  const { title, description } = req.body || {}
  if (!title) return res.status(400).json({ error: { message: 'Title required' } })

  const id = nanoid()
  db.prepare('INSERT INTO albums (id, event_id, title, description) VALUES (?, ?, ?, ?)').run(
    id, req.params.eventId, title, description || null
  )
  res.status(201).json({ data: db.prepare('SELECT * FROM albums WHERE id = ?').get(id) })
})

router.get('/clubs/list', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM events WHERE club_id = c.id) AS event_count
    FROM clubs c ORDER BY name ASC
  `).all()
  res.json({ data: rows })
})

module.exports = router
