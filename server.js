const express = require('express')
const cors = require('cors')
const path = require('path')
const { authOptional } = require('./auth')

const authRouter = require('./routes/auth')
const eventsRouter = require('./routes/events')
const mediaRouter = require('./routes/media')
const socialRouter = require('./routes/social')
const notificationsRouter = require('./routes/notifications')
const searchRouter = require('./routes/search')
const faceRouter = require('./routes/face')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(authOptional)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/media', mediaRouter)
app.use('/api/media', socialRouter)
app.use('/api/media', searchRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/search', searchRouter)
app.use('/api/me', faceRouter)
app.use('/api/me/favorites', socialRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: { message: err.message || 'Internal server error' } })
})

app.listen(PORT, () => {
  console.log(`CampusLens running on http://localhost:${PORT}`)
})
