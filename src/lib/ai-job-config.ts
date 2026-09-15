import type { AIJobKind } from '@/models/AIGenerationJob';

export const AI_JOB_COSTS: Record<AIJobKind, { credits: number; estimatedUsd: number }> = {
  image: { credits: 1, estimatedUsd: 0.04 },
  video: { credits: 3, estimatedUsd: 0.35 },
  project: { credits: 2, estimatedUsd: 0.08 },
};

export const AI_JOB_PROVIDERS: Record<AIJobKind, readonly string[]> = {
  image: ['google', 'openai', 'fal', 'replicate'],
  video: ['runway', 'veo', 'kling', 'luma', 'pika', 'hailuo', 'sora'],
  project: ['google', 'openai', 'anthropic', 'deepseek'],
};

export function isAIJobKind(value: unknown): value is AIJobKind {
  return value === 'image' || value === 'video' || value === 'project';
}

export function isProviderForKind(kind: AIJobKind, provider: string): boolean {
  return AI_JOB_PROVIDERS[kind].includes(provider);
}
