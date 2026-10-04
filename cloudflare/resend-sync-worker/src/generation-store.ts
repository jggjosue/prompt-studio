export type CloudflareGenerationJob = {
  id: string;
  userId: string;
  idempotencyKey: string;
  kind: string;
  provider: string;
  modelId: string | null;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  status: string;
  attempts: number;
  maxAttempts: number;
  progress: number;
  progressMessage: string | null;
  lastError: string | null;
  lockToken: string | null;
};

type D1JobRow = {
  id: string;
  user_id: string;
  idempotency_key: string;
  kind: string;
  provider: string;
  model_id: string | null;
  input_json: string;
  result_json: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
  progress: number;
  progress_message: string | null;
  last_error: string | null;
  lock_token: string | null;
};

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const mapJob = (row: D1JobRow): CloudflareGenerationJob => ({
  id: row.id,
  userId: row.user_id,
  idempotencyKey: row.idempotency_key,
  kind: row.kind,
  provider: row.provider,
  modelId: row.model_id,
  input: parseJson(row.input_json, {}),
  result: parseJson(row.result_json, null),
  status: row.status,
  attempts: row.attempts,
  maxAttempts: row.max_attempts,
  progress: row.progress,
  progressMessage: row.progress_message,
  lastError: row.last_error,
  lockToken: row.lock_token,
});

/**
 * Claims one ready job atomically. This is the D1 equivalent of the Mongo
 * lease/claim operation and is intentionally small so provider execution can
 * be layered on top without bringing mongoose into the Worker.
 */
export async function claimNextGenerationJob(
  db: D1Database,
  owner: string,
  leaseSeconds = 300,
): Promise<CloudflareGenerationJob | null> {
  const now = Math.floor(Date.now() / 1000);
  const leaseExpiresAt = now + leaseSeconds;
  const lockToken = `${owner}:${crypto.randomUUID()}`;
  const candidate = await db.prepare(`
    SELECT id, user_id, idempotency_key, kind, provider, model_id, input_json, result_json,
           status, attempts, max_attempts, progress, progress_message,
           last_error, lock_token
    FROM ai_jobs
    WHERE (status = 'queued' OR status = 'retrying')
      AND next_attempt_at <= ?
      AND (lease_expires_at IS NULL OR lease_expires_at < ?)
    ORDER BY next_attempt_at ASC, created_at ASC
    LIMIT 1
  `).bind(now, now).first<D1JobRow>();

  if (!candidate) return null;

  const claimed = await db.prepare(`
    UPDATE ai_jobs
    SET status = 'processing',
        attempts = attempts + 1,
        lock_token = ?,
        lease_expires_at = ?,
        updated_at = ?
    WHERE id = ?
      AND (status = 'queued' OR status = 'retrying')
      AND next_attempt_at <= ?
      AND (lease_expires_at IS NULL OR lease_expires_at < ?)
  `).bind(lockToken, leaseExpiresAt, now, candidate.id, now, now).run();

  if (!claimed.meta.changes) return null;
  return mapJob({ ...candidate, status: 'processing', attempts: candidate.attempts + 1, lock_token: lockToken });
}

export async function updateGenerationJob(
  db: D1Database,
  jobId: string,
  lockToken: string,
  patch: { status?: string; progress?: number; progressMessage?: string; result?: Record<string, unknown>; lastError?: string | null },
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE ai_jobs
    SET status = COALESCE(?, status),
        progress = COALESCE(?, progress),
        progress_message = COALESCE(?, progress_message),
        result_json = COALESCE(?, result_json),
        last_error = ?,
        updated_at = ?,
        completed_at = CASE WHEN ? IN ('completed', 'failed', 'dead_letter') THEN ? ELSE completed_at END
    WHERE id = ? AND lock_token = ?
  `).bind(
    patch.status ?? null,
    patch.progress ?? null,
    patch.progressMessage ?? null,
    patch.result ? JSON.stringify(patch.result) : null,
    patch.lastError ?? null,
    now,
    patch.status ?? '',
    now,
    jobId,
    lockToken,
  ).run();
}
