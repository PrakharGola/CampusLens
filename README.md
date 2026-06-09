# 📸 CampusLens

A lightweight **Campus Event & Media Management Platform** built with **Node.js, Express, and SQLite**.
It supports event publishing, media uploads, social interactions, and basic AI-style tagging — designed as a fast, demo-ready MVP.

---

## 🚀 Features

### 🔐 Authentication

* JWT-based login system
* Role-based access:

  * Admin
  * Photographer
  * Club Member

### 🎉 Events & Clubs

* Create and manage clubs
* Organize events under clubs
* Public / Private event visibility
* Event cover images

### 🖼️ Media System

* Album-based media organization
* Image uploads (local storage)
* Media captions and metadata
* Download-ready media URLs

### ❤️ Social Features

* Like media posts
* Comment system
* Favorites system

### 🏷️ Tagging System

* Auto-generated tags (heuristic-based)
* Tag scoring system

### 👤 Face Signature (Mock AI)

* Stores lightweight face signature vector
* Enables simple “my photos” matching (demo version)

---

## 🧱 Tech Stack

* **Backend:** Node.js + Express
* **Database:** SQLite (better-sqlite3)
* **Auth:** JWT
* **Storage:** Local filesystem (`uploads/`)
* **Frontend:** Vanilla HTML, CSS, JavaScript
* **AI Features:** Lightweight heuristic tagging + mock face signatures

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/PrakharGola/CampusLens.git
cd CampusLens
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Seed database

```bash
node seed.js
```

---

### 4. Start server

```bash
node server.js
```

---

### 5. Open in browser

```
http://localhost:4000
```

---

## 🔑 Default Login Accounts

| Role         | Email                                                 | Password  |
| ------------ | ----------------------------------------------------- | --------- |
| Admin        | [admin@campuslens.dev](mailto:admin@campuslens.dev)   | campus123 |
| Photographer | [photo@campuslens.dev](mailto:photo@campuslens.dev)   | campus123 |
| Member       | [member@campuslens.dev](mailto:member@campuslens.dev) | campus123 |

---

## 📁 Project Structure

```
CampusLens/
│
├── server.js
├── db.js
├── seed.js
├── auth.js
│
├── routes/
│   ├── auth.js
│   ├── events.js
│   ├── media.js
│   ├── social.js
│   ├── search.js
│   ├── notifications.js
│   └── face.js
│
├── uploads/
│
└── public/
    ├── index.html
    ├── app.js
    └── styles.css
```

---

## 🗄️ Database Schema (Simplified)

* **users** → authentication + roles
* **clubs** → campus clubs
* **events** → events under clubs
* **albums** → event albums
* **media** → uploaded images
* **media_tags** → AI-style tags
* **likes** → user likes
* **comments** → user comments
* **favorites** → saved media
* **notifications** → system alerts

---

## 🔌 API Overview

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Events

* `GET /api/events`
* `POST /api/events`
* `GET /api/events/:id`

### Media

* `GET /api/media`
* `POST /api/media/upload/initiate`
* `POST /api/media/upload/complete`

### Social

* `POST /api/media/:id/likes`
* `POST /api/media/:id/comments`
* `POST /api/media/:id/favorite`

### Search

* `GET /api/search/media`
* `GET /api/search/events`

### Face Matching (Mock)

* `POST /api/me/face-profile`
* `GET /api/me/face-matches`

---

## 🧪 Development Notes

* Uses SQLite for zero-config setup
* All media stored locally in `/uploads`
* Seed script resets database each run
* Face matching is **mock logic (not real AI)**

---

## 🌐 Deployment

### Recommended (Production-ready)

#### Backend Hosting:

* Render
* Railway

#### Frontend:

* Same server (Express static hosting)
  OR
* Vercel (if separated later)

---

### Important for Deployment

Update server port handling:

```js
const PORT = process.env.PORT || 4000
```

---

## ⚠️ Limitations (MVP)

* No cloud storage (uses local uploads)
* No real AI model (only simulated tagging)
* SQLite not suitable for large scale
* Face matching is heuristic only

---

## 📌 Future Improvements

* PostgreSQL migration
* AWS S3 media storage
* Real AI tagging model
* React frontend upgrade
* Mobile app version
* WebSocket notifications

---

## 👨‍💻 Author

**Prakhar Gola**
GitHub: [https://github.com/PrakharGola](https://github.com/PrakharGola)

---

## 📄 License

MIT License — free to use for learning and development.

