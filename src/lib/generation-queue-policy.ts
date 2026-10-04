export type GenerationQueueMode = 'qstash' | 'cloudflare-queue' | 'cron-recovery';

const enabled = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export function generationQueueMode(env: NodeJS.ProcessEnv = process.env): GenerationQueueMode {
  if (enabled(env.AI_QUEUE_KILL_SWITCH)) return 'cron-recovery';
  if (!enabled(env.AI_QUEUE_DISPATCH_ENABLED)) return 'cron-recovery';
  const backend = env.CF_QUEUE_DISPATCH_BACKEND?.trim().toLowerCase();
  return backend === 'cloudflare-queue' ? 'cloudflare-queue' : 'qstash';
}

export function boundedQueueNumber(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

export function queueConfiguration(env: NodeJS.ProcessEnv = process.env) {
  const mode = generationQueueMode(env);

  const missing =
    mode === 'qstash'
      ? ['QSTASH_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY'].filter(
          (name) => !env[name]?.trim(),
        )
      : mode === 'cloudflare-queue'
        ? ['CF_QUEUE_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_AI_JOBS_QUEUE_ID'].filter(
            (name) => !env[name]?.trim(),
          )
        : [];

  return {
    mode,
    ready: (mode === 'qstash' || mode === 'cloudflare-queue') && missing.length === 0,
    missing,
    parallelism: boundedQueueNumber(env.AI_QUEUE_PARALLELISM, 3, 100),
    ratePerMinute: boundedQueueNumber(env.AI_QUEUE_RATE_PER_MINUTE, 30, 10_000),
  };
}
