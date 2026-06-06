

# CampusLens — AI-Powered Event Memories Platform

CampusLens is a modern full-stack event and media management platform designed for college clubs, societies, and campus communities.

It helps organizers manage events, curate media intelligently, and deliver personalized memory experiences using AI-powered discovery, smart albums, and engagement analytics.

---

# ✨ Features

## 📸 Smart Event Media Management

* Create and manage event albums
* Upload and organize event photos/videos
* QR-based album sharing
* Event timeline view
* Smart favourite collections

## 🤖 AI-Powered Experiences

* Personalized memory feed
* AI-generated event summaries
* Scene detection and captioning
* Face clustering and photo discovery
* Duplicate photo detection
* Media quality scoring

## 📊 Analytics & Engagement

* Club leaderboard
* Attendance heatmaps
* Event engagement insights
* Media activity tracking

## 🔐 Security & Reliability

* JWT-style authentication
* Role-based access control (RBAC)
* API rate limiting
* Audit logging
* Error monitoring
* Production-ready backend structure

## 🐳 Deployment & DevOps

* Docker support
* CI workflow ready
* Modular architecture
* Scalable folder structure

---

# 🧪 Demo Accounts

All demo accounts use the password:

```bash
campus123
```

| Role         | Email                                                 |
| ------------ | ----------------------------------------------------- |
| Admin        | [admin@campuslens.dev](mailto:admin@campuslens.dev)   |
| Club Lead    | [lead@campuslens.dev](mailto:lead@campuslens.dev)     |
| Photographer | [photo@campuslens.dev](mailto:photo@campuslens.dev)   |
| Member       | [member@campuslens.dev](mailto:member@campuslens.dev) |

---

# 🚀 Getting Started

## Prerequisites

* Node.js (v18+ recommended)
* npm

No external runtime dependencies are required.

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd CIG_Project
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open the app in your browser:

```bash
http://localhost:4177
```

---

# 📁 Project Structure

```bash
.
├── ai/                  # AI services: captions, clustering, quality scoring
├── backend/             # API routes, middleware, authentication
├── database/            # SQL schema, ER diagrams, seed data
├── docs/                # Architecture, reports, deployment docs
├── frontend/            # Dashboard UI and client-side logic
├── notifications/       # Notification templates and services
├── services/            # Security, observability, shared services
├── storage/             # Media storage and watermark planning
├── Dockerfile
└── docker-compose.yml
```

---

# 🧠 AI Modules

CampusLens includes modular AI-oriented services for:

* Face clustering
* Scene recognition
* Smart media search
* Caption generation
* Quality assessment
* Personalized feed recommendations

These services are designed to work in restricted academic/lab environments with minimal setup requirements.

---

# 🛠️ Available Scripts

Run development server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Run project checks:

```bash
npm run check
```

---

# 📚 Documentation

The `/docs` folder includes:

* Architecture Documentation
* API Documentation
* Database Schema
* Deployment Guide
* Project Report
* Feature Roadmap
* UI Redesign Plan

---

# 🐳 Docker Support

Run using Docker:

```bash
docker-compose up --build
```

---

# 🎯 Project Goals

CampusLens aims to solve common campus media management challenges:

* Scattered event photos
* Difficult media discovery
* Low member engagement
* Poor archival systems
* Lack of personalized experiences

By combining event management with AI-assisted media organization, CampusLens creates a centralized digital memory platform for campus communities.

---

# 🔮 Future Enhancements

* Real-time collaboration
* AI-generated event highlight reels
* OCR-based poster/event extraction
* Cross-club discovery feed
* Mobile application support
* Cloud object storage integration
* Advanced recommendation engine

---

# 👨‍💻 Tech Philosophy

CampusLens intentionally minimizes third-party runtime dependencies to ensure:

* Easy deployment
* Compatibility with restricted lab systems
* Faster onboarding
* Simpler maintenance
* Better portability

---

# 📄 License

This project is intended for academic, educational, and portfolio purposes.
