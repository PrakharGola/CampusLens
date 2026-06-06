# CampusLens API Documentation

Base URL: `/api`

Responses use this shape:

```json
{
  "data": {}
}
```

Errors use this shape:

```json
{
  "error": {
    "message": "Human-readable error"
  }
}
```

## Auth

### `POST /auth/login`

Request:

```json
{
  "email": "member@campuslens.dev",
  "password": "campus123"
}
```

Returns a signed token and safe user profile.

### `GET /auth/me`

Requires `Authorization: Bearer <token>`.

Returns the current CampusLens user.

## Events

### `GET /events`

Lists events visible to the current role. Public events are visible anonymously; private events require club membership or admin-level access.

### `POST /events`

Requires permission `event:manage`.

Creates a new CampusLens event and album.

### `GET /events/:eventId`

Returns event metadata, club details, album details, media counts, likes, and average quality.

### `GET /events/:eventId/timeline`

Returns timeline items for Event Timeline View.

### `GET /events/:eventId/heatmap`

Returns hourly attendance heatmap buckets.

## Media

### `GET /media?eventId=&q=`

Lists media visible to the current user. Supports event filtering and smart text search.

### `POST /media/upload-intent`

Requires permission `media:upload`.

Creates a storage upload intent.

### `POST /media/upload`

Requires permission `media:upload`.

Creates a media record with AI-ready metadata.

### `POST /media/:mediaId/like`

Adds a like.

### `POST /media/:mediaId/favorite`

Adds the item to a smart favorite collection.

### `GET /media/duplicates`

Returns duplicate photo detector groups.

### `GET /media/favorites/smart`

Returns AI-grouped favorite collections for the signed-in user.

### `GET /media/feed/personalized`

Returns media where the signed-in user appears or uploaded content.

## AI

### `POST /ai/search`

Runs smart semantic search over event names, scenes, tags, captions, and club names.

### `GET /ai/events/:eventId/summary`

Returns an AI event summary.

### `GET /ai/events/:eventId/highlights`

Returns generated memory highlights.

### `GET /ai/media/:mediaId/recommendations`

Returns similar image recommendations.

### `GET /ai/face-clusters`

Returns detected face clusters.

### `GET /ai/quality-report`

Returns media quality scoring results.

## Clubs

### `GET /clubs`

Lists clubs and societies.

### `GET /clubs/leaderboard`

Returns the CampusLens Club Leaderboard.

## Notifications

### `GET /notifications`

Requires authentication. Returns real-time style memory notifications.

### `POST /notifications/:notificationId/read`

Marks a notification as read.
