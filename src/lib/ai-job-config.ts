import type { AIJobKind } from '@/models/AIGenerationJob';

export const AI_JOB_COSTS: Record<AIJobKind, { credits: number; estimatedUsd: number }> = {
  image: { credits: 1, estimatedUsd: 0.04 },
  video: { credits: 3, estimatedUsd: 0.35 },
  project: { credits: 2, estimatedUsd: 0.08 },
  vision: { credits: 1, estimatedUsd: 0.02 },
  text: { credits: 1, estimatedUsd: 0.01 },
  videoUnderstanding: { credits: 2, estimatedUsd: 0.02 },
};

export const AI_JOB_PROVIDERS: Record<AIJobKind, readonly string[]> = {
  image: ['google', 'openai', 'fal', 'replicate'],
  video: ['runway', 'veo', 'kling', 'luma', 'pika', 'hailuo', 'sora'],
  project: ['google', 'openai', 'anthropic', 'deepseek'],
  vision: ['google', 'openai', 'anthropic'],
  text: ['google', 'openai', 'anthropic', 'deepseek'],
  videoUnderstanding: ['google'],
};

export function isAIJobKind(value: unknown): value is AIJobKind {
  return (
    value === 'image' ||
    value === 'video' ||
    value === 'project' ||
    value === 'vision' ||
    value === 'text' ||
    value === 'videoUnderstanding'
  );
}

export function isProviderForKind(kind: AIJobKind, provider: string): boolean {
  return AI_JOB_PROVIDERS[kind].includes(provider);
}
