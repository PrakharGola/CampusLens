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
  filename: (_req, file, cb) => cb(null, `selfie_${nanoid()}${path.extname(file.originalname)}`)
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

function generateFaceSignature(filename) {
  let hash = 0
  for (let i = 0; i < filename.length; i++) {
    hash = ((hash << 5) - hash) + filename.charCodeAt(i)
    hash |= 0
  }
  return Array.from({ length: 8 }, (_, i) => Math.abs((hash >> i) % 100) / 100).join(',')
}

function similarity(a, b) {
  if (!a || !b) return 0
  const va = a.split(',').map(Number)
  const vb = b.split(',').map(Number)
  if (va.length !== vb.length) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < va.length; i++) {
    dot += va[i] * vb[i]
    magA += va[i] ** 2
    magB += vb[i] ** 2
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0
}

router.post('/face-profile', requireAuth, upload.single('selfie'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'Selfie required' } })

  const signature = generateFaceSignature(req.file.filename)
  db.prepare('UPDATE users SET face_signature = ?, avatar_url = ? WHERE id = ?')
    .run(signature, `/uploads/${req.file.filename}`, req.user.id)

  res.json({ data: { saved: true, avatarUrl: `/uploads/${req.file.filename}` } })
})

router.get('/face-matches', requireAuth, (req, res) => {
  const user = db.prepare('SELECT face_signature FROM users WHERE id = ?').get(req.user.id)
  if (!user?.face_signature) {
    return res.status(404).json({ error: { message: 'Upload a selfie first.' } })
  }

  const allMedia = db.prepare(`
    SELECT m.*, u.name AS uploader_name,
      (SELECT COUNT(*) FROM likes WHERE media_id = m.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE media_id = m.id) AS comment_count
    FROM media m JOIN users u ON m.uploader_id = u.id
    WHERE m.face_signature IS NOT NULL
  `).all()

  const matched = allMedia
    .map(m => ({ media: m, score: similarity(user.face_signature, m.face_signature) }))
    .filter(x => x.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(x => ({
      ...x.media,
      match_score: Math.round(x.score * 100) / 100,
      tags: db.prepare('SELECT tag, score FROM media_tags WHERE media_id = ?').all(x.media.id)
    }))

  res.json({ data: matched })
})

module.exports = router
