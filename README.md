# CampusLens

AI-powered event and media management platform for campus clubs and societies.

## Features

- Event and album management
- Public and private events
- Photo and video uploads with drag-and-drop
- Bulk uploads
- Role-based access (Admin, Photographer, Club Member, Viewer)
- Likes, comments, favorites
- AI-powered auto image tagging
- Smart search across events, tags, uploaders
- Face-based personalized photo discovery (My Photos)
- Real-time notifications
- Watermarked downloads
- QR-based album sharing

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT |
| Uploads | Multer (local filesystem) |
| Frontend | Vanilla HTML + CSS + JS |
| AI Tagging | Built-in heuristic tagger |

## Getting Started

```bash
npm install
npm run seed
npm start
```

Open [localhost](http://localhost:4000)

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@campuslens.dev | campus123 |
| Photographer | photo@campuslens.dev | campus123 |
| Member | member@campuslens.dev | campus123 |

## Architecture

```
Browser → Express API → SQLite
                     → Local /uploads folder
                     → Built-in AI tagger
```

## License

MIT
