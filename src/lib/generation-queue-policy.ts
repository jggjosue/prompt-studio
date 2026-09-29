export type GenerationQueueMode = 'qstash' | 'cron-recovery';

const enabled = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export function generationQueueMode(env: NodeJS.ProcessEnv = process.env): GenerationQueueMode {
  if (enabled(env.AI_QUEUE_KILL_SWITCH)) return 'cron-recovery';
  return enabled(env.AI_QUEUE_DISPATCH_ENABLED) ? 'qstash' : 'cron-recovery';
}

export function boundedQueueNumber(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

export function queueConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const mode = generationQueueMode(env);
  const missing = mode === 'qstash'
    ? ['QSTASH_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY']
      .filter(name => !env[name]?.trim())
    : [];

  return {
    mode,
    ready: mode === 'qstash' && missing.length === 0,
    missing,
    parallelism: boundedQueueNumber(env.AI_QUEUE_PARALLELISM, 3, 100),
    ratePerMinute: boundedQueueNumber(env.AI_QUEUE_RATE_PER_MINUTE, 30, 10_000),
  };
}
