# CampusLens Deployment Guide

## Environment

Copy `.env.example` to `.env` and update values:

```bash
PORT=4177
JWT_SECRET=replace-with-a-long-random-secret
PUBLIC_APP_URL=http://localhost:4177
STORAGE_PROVIDER=local
STORAGE_BUCKET=campuslens-dev-media
```

## Local Run

```bash
npm start
```

## Docker Run

```bash
docker compose up --build
```

CampusLens will be available at [http://localhost:4177](http://localhost:4177).

## Production Notes

- Replace the in-memory seed store with PostgreSQL using `database/schema.sql`.
- Replace local upload intents with S3 signed uploads.
- Use a managed secret store for `JWT_SECRET`.
- Send captured errors to a real monitoring provider using `ERROR_MONITORING_DSN`.
- Put the Node server behind a reverse proxy with TLS.
- Configure object lifecycle rules for original media, thumbnails, and watermarked downloads.

## CI/CD

The workflow in `.github/workflows/campuslens-ci.yml` runs:

```bash
npm run check
npm test
```

For a hosted deployment, add build and deploy jobs after the verify job.
