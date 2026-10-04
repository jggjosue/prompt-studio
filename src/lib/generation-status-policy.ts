import { canonicalGenerationState, isTerminalGenerationJobState, type PersistedGenerationJobState } from '@/lib/generation-job-state';

/**
 * Adaptive client polling (#838). Clients read `pollAfterMs` from the status
 * API instead of hammering it every second: short for fast image jobs, long
 * and growing for video renders, null once the job is terminal. A queued job
 * waiting for a backoff/poll delivery is not polled before that instant.
 */

const SECOND = 1000;

const BASE_BY_KIND: Record<string, { min: number; max: number }> = {
  image: { min: 1.5 * SECOND, max: 5 * SECOND },
  vision: { min: 1.5 * SECOND, max: 5 * SECOND },
  text: { min: 1 * SECOND, max: 4 * SECOND },
  project: { min: 2 * SECOND, max: 8 * SECOND },
  videoUnderstanding: { min: 3 * SECOND, max: 10 * SECOND },
  video: { min: 5 * SECOND, max: 30 * SECOND },
};

export function recommendedPollAfterMs(
  job: { kind: string; status: PersistedGenerationJobState; createdAt?: Date | null; startedAt?: Date | null; nextAttemptAt?: Date | null },
  now: Date = new Date(),
): number | null {
  const state = canonicalGenerationState(job.status);
  if (isTerminalGenerationJobState(state)) return null;
  const { min, max } = BASE_BY_KIND[job.kind] ?? { min: 2 * SECOND, max: 10 * SECOND };
  const since = (job.startedAt ?? job.createdAt ?? now).getTime();
  const elapsed = Math.max(0, now.getTime() - since);
  // Grow linearly from min to max over the first two minutes of work.
  let delay = Math.round(min + (max - min) * Math.min(1, elapsed / (120 * SECOND)));
  if (state === 'queued' && job.nextAttemptAt) {
    const wait = job.nextAttemptAt.getTime() - now.getTime();
    if (wait > delay) delay = Math.min(wait, 5 * 60 * SECOND);
  }
  return Math.max(min, delay);
}
