import type { GenerationJobErrorCategory } from './generation-job-state';

const RETRYABLE_CATEGORIES = new Set<GenerationJobErrorCategory>([
  'timeout',
  'rate_limit_or_quota',
  'provider_unavailable',
]);

const BASE_DELAY_MS = 60_000;
const MAX_DELAY_MS = 30 * 60_000;
const JITTER_RATIO = 0.2;

export type GenerationRetryDecision =
  | { action: 'retry'; retryable: true; delayMs: number; nextAttemptAt: Date }
  | { action: 'dead_letter'; retryable: boolean; delayMs: null; nextAttemptAt: null };

export function isRetryableGenerationError(category: GenerationJobErrorCategory): boolean {
  return RETRYABLE_CATEGORIES.has(category);
}

export function generationRetryDecision(input: {
  category: GenerationJobErrorCategory;
  attempt: number;
  maxAttempts: number;
  now?: Date;
  random?: () => number;
}): GenerationRetryDecision {
  const retryable = isRetryableGenerationError(input.category);
  if (!retryable || input.attempt >= input.maxAttempts) {
    return { action: 'dead_letter', retryable, delayMs: null, nextAttemptAt: null };
  }

  const exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.max(0, input.attempt - 1));
  const random = Math.min(1, Math.max(0, (input.random ?? Math.random)()));
  const jitter = Math.round(exponential * JITTER_RATIO * (random * 2 - 1));
  const delayMs = Math.max(BASE_DELAY_MS, exponential + jitter);
  const now = input.now ?? new Date();
  return { action: 'retry', retryable: true, delayMs, nextAttemptAt: new Date(now.getTime() + delayMs) };
}
