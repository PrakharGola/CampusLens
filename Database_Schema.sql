-- CampusLens PostgreSQL schema
-- Designed for college clubs, event albums, AI media search, and personalized memory discovery.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE campus_role AS ENUM ('admin', 'club_lead', 'photographer', 'member', 'viewer');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'club_only');
CREATE TYPE notification_type AS ENUM ('face_match', 'liked_media', 'comment', 'album_shared', 'tagged_user');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role campus_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  short_name VARCHAR(24) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  theme_color CHAR(7) NOT NULL DEFAULT '#16a085',
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_memberships (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_role campus_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  visibility visibility_type NOT NULL DEFAULT 'club_only',
  event_date DATE NOT NULL,
  location VARCHAR(160),
  cover_media_url TEXT,
  description TEXT,
  attendance_count INTEGER NOT NULL DEFAULT 0,
  energy_score INTEGER NOT NULL DEFAULT 0 CHECK (energy_score BETWEEN 0 AND 100),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  share_token VARCHAR(80) NOT NULL UNIQUE,
  share_policy visibility_type NOT NULL DEFAULT 'club_only',
  qr_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  media_type media_type NOT NULL DEFAULT 'image',
  storage_key TEXT NOT NULL,
  public_url TEXT,
  title VARCHAR(160),
  ai_caption TEXT,
  scene_labels TEXT[] NOT NULL DEFAULT '{}',
  quality_score INTEGER NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
  perceptual_hash VARCHAR(128),
  duplicate_group_id UUID,
  captured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_tags (
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  source VARCHAR(40) NOT NULL DEFAULT 'ai',
  confidence NUMERIC(5, 4),
  PRIMARY KEY (media_id, tag_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE likes (
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (media_id, user_id)
);

CREATE TABLE favorite_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  smart_rule JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favorite_collection_media (
  collection_id UUID NOT NULL REFERENCES favorite_collections(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, media_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE face_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cluster_id UUID NOT NULL,
  embedding FLOAT8[] NOT NULL,
  bounding_box JSONB NOT NULL,
  confidence NUMERIC(5, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE event_timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  label VARCHAR(160) NOT NULL,
  mood VARCHAR(60),
  media_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE event_attendance_heatmap (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  hour_bucket SMALLINT NOT NULL CHECK (hour_bucket BETWEEN 0 AND 23),
  attendance_score INTEGER NOT NULL CHECK (attendance_score BETWEEN 0 AND 100),
  PRIMARY KEY (event_id, hour_bucket)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id UUID,
  ip_address INET,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_club_date ON events (club_id, event_date DESC);
CREATE INDEX idx_media_event_created ON media (event_id, created_at DESC);
CREATE INDEX idx_media_scene_labels ON media USING gin (scene_labels);
CREATE INDEX idx_media_quality ON media (quality_score DESC);
CREATE INDEX idx_notifications_user_read ON notifications (user_id, read_at, created_at DESC);
CREATE INDEX idx_face_embeddings_cluster ON face_embeddings (cluster_id);
CREATE INDEX idx_audit_actor_created ON audit_logs (actor_user_id, created_at DESC);
