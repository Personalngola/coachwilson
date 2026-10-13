-- Add Google OAuth support
ALTER TABLE users ADD COLUMN google_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
