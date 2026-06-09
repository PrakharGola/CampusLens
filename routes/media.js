const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { nanoid } = require('nanoid')
const db = require('../db')
const { requireAuth } = require('../auth')

const router = express.Router()

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${nanoid()}${ext}`)
  }
})

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

const SCENE_TAGS = [
  'crowd', 'stage', 'outdoor', 'indoor', 'sports', 'workshop',
  'cultural', 'group', 'portrait', 'night', 'daytime', 'food',
  'trophy', 'presentation', 'event', 'campus', 'celebration'
]

function generateTagsForFile(filename) {
  const seed = filename.length
  const count = 3 + (seed % 3)
  const shuffled = [...SCENE_TAGS].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map(tag => ({
    tag,
    score: Math.round((0.7 + Math.random() * 0.3) * 100) / 100
  }))
}

function generateFaceSignature(filename) {
  let hash = 0
  for (let i = 0; i < filename.length; i++) {
    hash = ((hash << 5) - hash) + filename.charCodeAt(i)
    hash |= 0
  }
  return Array.from({ length: 8 }, (_, i) => Math.abs((hash >> i) % 100) / 100).join(',')
}

router.post('/upload', requireAuth, upload.array('files', 20), (req, res) => {
  const { albumId } = req.body
  if (!albumId) return res.status(400).json({ error: { message: 'albumId required' } })

  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(albumId)
  if (!album) return res.status(404).json({ error: { message: 'Album not found' } })

  const uploaded = []

  for (const file of req.files || []) {
    const id = nanoid()
    const fileUrl = `/uploads/${file.filename}`
    const mediaType = file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE'
    const faceSignature = mediaType === 'IMAGE' ? generateFaceSignature(file.filename) : null

    db.prepare(`
      INSERT INTO media (id, album_id, uploader_id, file_url, file_path, media_type,
        mime_type, size_bytes, original_filename, face_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, albumId, req.user.id, fileUrl, file.path, mediaType,
      file.mimetype, file.size, file.originalname, faceSignature)

    const tags = generateTagsForFile(file.filename)
    const tagStmt = db.prepare('INSERT INTO media_tags (id, media_id, tag, score) VALUES (?, ?, ?, ?)')
    for (const t of tags) tagStmt.run(nanoid(), id, t.tag, t.score)

    uploaded.push({ id, fileUrl, tags })

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nanoid(), req.user.id, 'UPLOAD_COMPLETE', 'Upload complete',
      `Your photo "${file.originalname}" is ready.`, id)
  }

  res.status(201).json({ data: { uploaded } })
})

router.get('/', (req, res) => {
  const { albumId, tag, search } = req.query
  let sql = `SELECT m.*, u.name AS uploader_name, u.avatar_url AS uploader_avatar,
    (SELECT COUNT(*) FROM likes WHERE media_id = m.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE media_id = m.id) AS comment_count
    FROM media m JOIN users u ON m.uploader_id = u.id WHERE 1=1`
  const params = []

  if (albumId) { sql += ' AND m.album_id = ?'; params.push(albumId) }
  if (tag) { sql += ' AND m.id IN (SELECT media_id FROM media_tags WHERE tag = ?)'; params.push(tag) }
  if (search) {
    sql += ` AND (m.caption LIKE ? OR m.original_filename LIKE ?
      OR m.id IN (SELECT media_id FROM media_tags WHERE tag LIKE ?))`
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  sql += ' ORDER BY m.created_at DESC LIMIT 100'
  const rows = db.prepare(sql).all(...params)

  const items = rows.map(r => ({
    ...r,
    tags: db.prepare('SELECT tag, score FROM media_tags WHERE media_id = ?').all(r.id),
    user_liked: req.user
      ? !!db.prepare('SELECT 1 FROM likes WHERE media_id = ? AND user_id = ?').get(r.id, req.user.id)
      : false,
    user_favorited: req.user
      ? !!db.prepare('SELECT 1 FROM favorites WHERE media_id = ? AND user_id = ?').get(r.id, req.user.id)
      : false
  }))

  res.json({ data: { items } })
})

router.get('/:mediaId', (req, res) => {
  const media = db.prepare(`
    SELECT m.*, u.name AS uploader_name, u.avatar_url AS uploader_avatar
    FROM media m JOIN users u ON m.uploader_id = u.id WHERE m.id = ?
  `).get(req.params.mediaId)
  if (!media) return res.status(404).json({ error: { message: 'Media not found' } })

  media.tags = db.prepare('SELECT tag, score FROM media_tags WHERE media_id = ?').all(media.id)
  media.like_count = db.prepare('SELECT COUNT(*) AS c FROM likes WHERE media_id = ?').get(media.id).c
  media.comment_count = db.prepare('SELECT COUNT(*) AS c FROM comments WHERE media_id = ?').get(media.id).c

  res.json({ data: media })
})

router.post('/:mediaId/download', (req, res) => {
  const media = db.prepare(`
    SELECT m.*, e.title AS event_title, c.name AS club_name
    FROM media m JOIN albums a ON m.album_id = a.id
    JOIN events e ON a.event_id = e.id JOIN clubs c ON e.club_id = c.id
    WHERE m.id = ?
  `).get(req.params.mediaId)

  if (!media) return res.status(404).json({ error: { message: 'Media not found' } })

  const watermark = `${media.club_name} | ${media.event_title} | ${new Date().toISOString().slice(0, 10)}`
  res.json({ data: { downloadUrl: media.file_url, watermark } })
})

module.exports = router
