const bcrypt = require('bcryptjs')
const { nanoid } = require('nanoid')
const db = require('./db')

console.log('Seeding database...')

db.exec(`
  DELETE FROM notifications;
  DELETE FROM favorites;
  DELETE FROM comments;
  DELETE FROM likes;
  DELETE FROM media_tags;
  DELETE FROM media;
  DELETE FROM albums;
  DELETE FROM events;
  DELETE FROM clubs;
  DELETE FROM users;
`)

const passwordHash = bcrypt.hashSync('campus123', 10)

const adminId = nanoid()
const photoId = nanoid()
const memberId = nanoid()

const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
insertUser.run(adminId, 'Platform Admin', 'admin@campuslens.dev', passwordHash, 'ADMIN')
insertUser.run(photoId, 'Event Photographer', 'photo@campuslens.dev', passwordHash, 'PHOTOGRAPHER')
insertUser.run(memberId, 'Club Member', 'member@campuslens.dev', passwordHash, 'CLUB_MEMBER')

const clubs = [
  { id: nanoid(), name: 'Photography Club', description: 'Visual storytelling and event coverage' },
  { id: nanoid(), name: 'Robotics Club', description: 'Building autonomous machines' },
  { id: nanoid(), name: 'Cultural Society', description: 'Music, dance, and arts' }
]

const insertClub = db.prepare('INSERT INTO clubs (id, name, description) VALUES (?, ?, ?)')
clubs.forEach(c => insertClub.run(c.id, c.name, c.description))

const events = [
  { title: 'Annual Cultural Fest', category: 'Cultural', venue: 'Main Auditorium', clubId: clubs[2].id,
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800' },
  { title: 'TechFest 2026', category: 'Technical', venue: 'Innovation Lab', clubId: clubs[1].id,
    cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
  { title: 'Photo Walk Heritage', category: 'Outdoor', venue: 'Old City', clubId: clubs[0].id,
    cover: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800' },
  { title: 'AI Workshop', category: 'Workshop', venue: 'Lab Block A', clubId: clubs[1].id,
    cover: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800' },
  { title: 'Sports Day', category: 'Sports', venue: 'Main Ground', clubId: clubs[2].id,
    cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800' },
  { title: 'Inter-College Battle', category: 'Cultural', venue: 'Open Air Theater', clubId: clubs[2].id,
    cover: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800' }
]

const insertEvent = db.prepare(`INSERT INTO events
  (id, club_id, title, description, category, venue, event_date, visibility, cover_image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
const insertAlbum = db.prepare('INSERT INTO albums (id, event_id, title, description) VALUES (?, ?, ?, ?)')
const insertMedia = db.prepare(`INSERT INTO media
  (id, album_id, uploader_id, file_url, file_path, media_type, mime_type, size_bytes, original_filename, caption, face_signature)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
const insertTag = db.prepare('INSERT INTO media_tags (id, media_id, tag, score) VALUES (?, ?, ?, ?)')

  const sampleImages = [
  'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800',
  'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'
]

const tagPool = ['crowd', 'stage', 'outdoor', 'indoor', 'cultural', 'group', 'portrait', 'event', 'campus', 'celebration']

events.forEach((ev, idx) => {
  const eventId = nanoid()
  const date = new Date()
  date.setDate(date.getDate() - idx * 7)
  insertEvent.run(eventId, ev.clubId, ev.title, `Coverage of ${ev.title}`, ev.category,
    ev.venue, date.toISOString(), idx % 4 === 3 ? 'PRIVATE' : 'PUBLIC', ev.cover)

  const albumId = nanoid()
  insertAlbum.run(albumId, eventId, 'Main Album', 'Primary highlights')

  for (let i = 0; i < 4; i++) {
    const mediaId = nanoid()
    const imgUrl = sampleImages[Math.floor(Math.random() * sampleImages.length)]
    const signature = Array.from({ length: 8 }, () => Math.random().toFixed(2)).join(',')

    insertMedia.run(mediaId, albumId, idx % 2 === 0 ? photoId : memberId,
      imgUrl, imgUrl, 'IMAGE', 'image/jpeg', 250000, `photo_${i}.jpg`,
      `${ev.title} highlight ${i + 1}`, signature)

    const tags = [...tagPool].sort(() => 0.5 - Math.random()).slice(0, 3)
    tags.forEach(t => insertTag.run(nanoid(), mediaId, t, 0.7 + Math.random() * 0.3))
  }
})

console.log('Seed complete.')
console.log('Login as: admin@campuslens.dev / campus123')
