CampusLens - MVP

A compact, production-ready MVP of CampusLens: a campus-event and media management platform with simple authentication, event and album management, media uploads, social interactions, AI tagging, basic face-based discovery, and downloadable watermarked media. This version is designed for rapid submission and local development.

Table of Contents
• Overview
• What’s Included
• Architecture & Tech Stack
• Getting Started
• Project Structure
• Database Schema (SQLite)
• API Reference (Endpoints)
• Frontend Overview
• AI & Face Matching (Lite)
• Development & Testing
• Deployment
• Contributing
• License
• Contact

Overview

CampusLens MVP is a compact, self-contained platform to demonstrate core problem-solution fit for an Event & Media Management platform. It includes:

• Event and album management with public/private visibility
• Local file uploads with drag-and-drop (simulated via standard input)
• Social interactions: likes, comments, and favorites
• Lightweight AI tagging (heuristic)
• Simple, consent-based face matching (signature-based)
• Watermark metadata for downloads
• SQLite-based local database (no external services)
• Minimal front-end (vanilla JS) to illustrate workflows

This version emphasizes clarity, portability, and speed to deliver a holistic, demo-ready submission today.

What’s Included
• Single-stack Node.js backend (Express)
• SQLite database (via better-sqlite3)
• Local file uploads (uploads/ folder)
• Minimal API layer with JWT authentication
• Simple frontend (public/index.html, public/app.js, public/styles.css)
• Seed script to populate sample data
• Lightweight AI stubs for tagging and face-matching

Notes:
• This is a pragmatic MVP, not a full production-grade system.
• No AWS/Azure/GCP dependencies required for this version.
• Frontend is vanilla JS for quick demonstration; you can swap in a framework later if needed.

Architecture & Tech Stack
• Backend: Node.js with Express
• Database: SQLite (via better-sqlite3)
• Authentication: JWT
• Storage: Local filesystem (uploads/ directory)
• AI: Lightweight heuristic tagging and signature-based face matching (no external AI service)
• Frontend: Vanilla HTML/CSS/JS
• Packaging: Minimal dependencies for quick setup

Getting Started
Install dependencies
   - npm install

Seed the database
   - npm run seed

Start the server
   - npm start

Open the app
   - http://localhost:4000

Notes:
• If you changed the default port, update the server startup accordingly.
• Seed user accounts:
  - Admin: admin@campuslens.dev / campus123
  - Photographer: photo@campuslens.dev / campus123
  - Member: member@campuslens.dev / campus123

Project Structure
• Root
  - server.js
  - seed.js
  - db.js
  - auth.js
  - routes/
    - auth.js
    - events.js
    - media.js
    - social.js
    - notifications.js
    - search.js
    - face.js
  - uploads/.gitkeep
  - public/
    - index.html
    - styles.css
    - app.js

How to map to your actual repo:
• Preserve the exact file paths when you paste into GitHub.
• If you already have files with the same paths, merge carefully, prioritizing the final content from this README’s reference.

Database Schema (SQLite)
• Users: id, name, email, passwordhash, role, avatarurl, createdat
• Clubs: id, name, description
• Events: id, clubid, title, category, venue, eventdate, visibility, coverimageurl
• Albums: id, eventid, title, description
• Media: id, albumid, uploaderid, fileurl, filepath, mediatype, mimetype, sizebytes, originalfilename, caption, facesignature
• Media Tags: id, mediaid, tag, score
• Likes: id, mediaid, userid
• Comments: id, mediaid, userid, body, createdat
• Favorites: id, mediaid, userid
• Notifications: id, userid, type, title, message, isread, entityid, created_at

Note: This is a simplified, flat schema designed for rapid development.

API Reference (Endpoints)
• Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me

• Clubs (basic)
  - POST /api/clubs
  - GET /api/clubs
  - GET /api/clubs/:clubId

• Events
  - GET /api/events
  - POST /api/events
  - GET /api/events/:eventId
  - PATCH /api/events/:eventId
  - DELETE /api/events/:eventId

• Albums
  - GET /api/events/:eventId/albums
  - POST /api/events/:eventId/albums

• Media (upload, list, detail)
  - POST /api/media/upload/initiate
  - POST /api/media/upload/complete
  - GET /api/media
  - GET /api/media/:mediaId
  - DELETE /api/media/:mediaId

• Social
  - POST /api/media/:mediaId/likes
  - POST /api/media/:mediaId/favorite
  - GET /api/media/:mediaId/comments
  - POST /api/media/:mediaId/comments
  - (Note: This MVP uses a compact social surface)

• Notifications
  - GET /api/notifications
  - PATCH /api/notifications/:id/read
  - PATCH /api/notifications/read-all

• Search
  - GET /api/search/media
  - GET /api/search/events

• Face (My Photos)
  - POST /api/me/face-profile
  - GET /api/me/face-matches

• Downloads
  - POST /api/media/:mediaId/download

• Share
  - POST /api/events/:eventId/share
  - GET /api/share/:token

• Health
  - GET /api/health

Frontend Overview
• Public, minimal UI wired to backend
• Basic navigation and routing simulated with simple JS
• Upload zone supports drag-and-drop
• Media cards render basic metadata and actions
• No heavy frontend framework required for this MVP

If you want, I can tailor this README to:
• Your exact file layout
• Specific endpoints you implemented
• Any branding or project naming you’re using
• A quick-start shell script for Linux/macOS or Windows

Would you like me to adapt this to your actual repo structure or adjust for a specific hosting/docker setup?
