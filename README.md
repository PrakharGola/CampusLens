# CIG_Project
# CampusLens - AI-Powered Event Memories Platform

CampusLens is a full-stack event and media management platform for college clubs and societies. It helps organizers create event albums, discover photos through AI signals, share memories with QR album links, and give members a personalized feed of moments they appear in.

## What Changed

This workspace was empty, so CampusLens has been scaffolded as a fresh product implementation inspired by the supplied Event & Media Management problem statement. The codebase uses new domain naming, modular folders, a redesigned UI, a professional database schema, production-readiness scaffolding, and AI-oriented services.

## Highlights

- Event Timeline View for each campus event
- Memory Highlights Generator
- AI Event Summary
- QR Album Sharing
- Club Leaderboard
- Event Attendance Heatmap
- Smart Favourite Collections
- Duplicate Photo Detector
- Media Quality Scoring
- Personalized Memory Feed
- JWT-style authentication, RBAC, rate limiting, audit logs, and error monitoring
- Docker and CI workflow support

## Demo Login

All demo accounts use password `campus123`.

| Role | Email |
| --- | --- |
| Admin | `admin@campuslens.dev` |
| Club Lead | `lead@campuslens.dev` |
| Photographer | `photo@campuslens.dev` |
| Member | `member@campuslens.dev` |

## Run Locally

```bash
npm start
```

Open [http://localhost:4177](http://localhost:4177).

The project intentionally avoids third-party runtime dependencies, so it can run in restricted lab environments with only Node.js installed.

## Folder Structure

```text
.
├── ai/                  # Scene detection, face clustering, captions, search, quality scoring
├── backend/             # HTTP API, routes, middleware, auth, rate limiting
├── database/            # SQL schema, seed data, ER diagram
├── docs/                # Architecture, API, deployment, report, roadmap
├── frontend/            # CampusLens dashboard UI
├── notifications/       # Notification service and templates
├── services/            # Domain, security, and observability services
├── storage/             # Object storage and watermark planning
├── Dockerfile
└── docker-compose.yml
```

## Useful Commands

```bash
npm run check
npm test
npm start
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Schema](database/schema.sql)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Report](docs/PROJECT_REPORT.md)
- [Feature Roadmap](docs/FEATURE_ROADMAP.md)
- [UI Redesign Plan](docs/UI_REDESIGN.md)
- [Code Changes](docs/CODE_CHANGES.md)
