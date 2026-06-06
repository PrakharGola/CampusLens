# CampusLens Code Changes File by File

## Root

- `package.json`: project identity, Node scripts, dependency-free runtime.
- `.env.example`: environment configuration.
- `.gitignore`: local secrets, logs, build outputs, upload folders.
- `Dockerfile`: production container.
- `docker-compose.yml`: local container run.
- `.github/workflows/campuslens-ci.yml`: CI syntax and service checks.

## Frontend

- `frontend/index.html`: CampusLens app entry.
- `frontend/src/main.js`: mounts the dashboard.
- `frontend/src/styles/campuslens.css`: full visual redesign, glass panels, responsive layout.
- `frontend/src/services/campuslensApi.js`: API client, token persistence, demo login.
- `frontend/src/state/demoCampusData.js`: fallback demo product data.
- `frontend/src/state/campuslensStore.js`: state loading, derived views, fallbacks.
- `frontend/src/components/*`: modular UI sections for metrics, timeline, AI summary, heatmap, QR album sharing, highlights, gallery, leaderboard, favorites, feed, and notifications.

## Backend

- `backend/server.mjs`: starts the HTTP server.
- `backend/app.mjs`: route matching, API dispatch, static frontend serving.
- `backend/config/environment.mjs`: env-based configuration.
- `backend/middleware/auth.mjs`: bearer token user resolution.
- `backend/middleware/rateLimit.mjs`: IP rate limiting.
- `backend/middleware/audit.mjs`: audit log creation.
- `backend/middleware/errorBoundary.mjs`: error responses and monitoring capture.
- `backend/routes/*.routes.mjs`: auth, event, media, club, AI, and notification APIs.
- `backend/utils/http.mjs`: JSON parsing and response helpers.
- `backend/tests/campuslens.test.mjs`: service-level verification.

## Services

- `services/domain/campusLensSeed.mjs`: CampusLens seed entities.
- `services/domain/eventService.mjs`: event visibility, timelines, heatmaps.
- `services/domain/mediaService.mjs`: media search, upload records, likes, favorites, duplicates, personalized feed.
- `services/domain/leaderboardService.mjs`: club impact scoring.
- `services/domain/memoryService.mjs`: summaries, highlights, recommendations.
- `services/security/*`: password hashing, JWT signing/verification, RBAC.
- `services/observability/errorMonitor.mjs`: captured error records.

## AI

- `ai/sceneDetection.service.mjs`: scene labels and scene summaries.
- `ai/faceClustering.service.mjs`: face clusters and selfie matching.
- `ai/captionGenerator.service.mjs`: automatic captions.
- `ai/smartSearch.service.mjs`: semantic-style search across memory metadata.
- `ai/similarityRecommender.service.mjs`: similar image recommendations.
- `ai/qualityScoring.service.mjs`: media quality scoring and reports.

## Storage and Notifications

- `storage/objectStorage.service.mjs`: upload intent and object key planning.
- `storage/watermark.service.mjs`: role-aware watermark download plan.
- `notifications/notification.service.mjs`: notification listing and read state.
- `notifications/templates.mjs`: reusable notification copy.

## Database and Docs

- `database/schema.sql`: professional relational schema.
- `database/relationships.mmd`: ER diagram.
- `database/seed.sql`: starter seed data.
- `docs/*.md`: architecture, API, deployment, project report, UI plan, roadmap, resume summary.
