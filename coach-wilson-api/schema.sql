-- Coach Wilson - D1 schema
-- Run once: wrangler d1 execute coach-wilson-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL DEFAULT '',
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',   -- free | bronze | prata | ouro
  google_id TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);

-- Site CMS (key/value). Migration: migrations/002_site_content.sql
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Existing D1 databases: run once
-- ALTER TABLE users ADD COLUMN google_id TEXT;
-- wrangler d1 execute coach-wilson-db --remote --file=./migrations/002_site_content.sql

