export const EXPERIMENT_PROVIDERS = ['google', 'openai'] as const;
export const experimentRunKey = (label: 'A'|'B', provider: string) => `${label}-${provider}`;

export function outputUrl(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  const value = result as Record<string, unknown>;
  for (const key of ['url', 'imageUrl', 'outputUrl']) if (typeof value[key] === 'string') return value[key] as string;
  const media = value.media;
  if (media && typeof media === 'object' && typeof (media as Record<string, unknown>).url === 'string') return (media as Record<string, unknown>).url as string;
  return null;
}

export function experimentMetrics(job: { createdAt: Date|string; completedAt?: Date|string|null; estimatedCostUsd: number; result?: unknown }) {
  const durationMs = job.completedAt ? Math.max(0, new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) : null;
  const evaluation = job.result && typeof job.result === 'object' ? (job.result as Record<string, unknown>).evaluation : null;
  const scores = evaluation && typeof evaluation === 'object' ? evaluation as Record<string, unknown> : {};
  const bounded = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
  return { durationMs, costUsd: job.estimatedCostUsd, fidelity: bounded(scores.fidelity), quality: bounded(scores.quality) };
}

