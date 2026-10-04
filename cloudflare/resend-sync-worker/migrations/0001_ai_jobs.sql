-- Cloudflare-native queue state for the AI Worker migration.
-- MongoDB remains the source of truth until the cutover is complete.
CREATE TABLE IF NOT EXISTS ai_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT,
  input_json TEXT NOT NULL,
  result_json TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_attempt_at INTEGER NOT NULL DEFAULT (unixepoch()),
  lease_expires_at INTEGER,
  lock_token TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  progress_message TEXT,
  last_error TEXT,
  credits_state TEXT,
  credit_cost REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS ai_jobs_ready_idx
  ON ai_jobs (status, next_attempt_at, lease_expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS ai_jobs_user_idempotency_idx
  ON ai_jobs (user_id, idempotency_key);
