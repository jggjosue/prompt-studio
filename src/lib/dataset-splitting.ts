import { createHash } from 'node:crypto';

export const DATASET_SPLIT_VERSION = 'split-v1';
export const DATASET_SPLIT_SEED = 'prompt-studio-dataset-split-v1';
export type DatasetSplit = 'train' | 'validation' | 'test';
export const DEFAULT_SPLIT_RATIOS = { train: 0.90, validation: 0.05, test: 0.05 } as const;

export function stableSplitGroupKey(input: {
  userGroupId?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
  sourceGroupId?: string | null;
  exampleId: string;
}) {
  // Prefer the broadest stable identity available so related examples cannot leak across splits.
  const value = input.userGroupId || input.sessionId || input.requestId || input.sourceGroupId || input.exampleId;
  const kind = input.userGroupId ? 'user' : input.sessionId ? 'session' : input.requestId ? 'request' : input.sourceGroupId ? 'source' : 'example';
  if (!value?.trim()) throw new Error('DATASET_SPLIT_GROUP_KEY_REQUIRED');
  return `${kind}:${value.trim()}`;
}

export function assignDatasetSplit(groupKey: string, options?: {
  seed?: string;
  ratios?: { train: number; validation: number; test: number };
}): DatasetSplit {
  const seed = options?.seed ?? DATASET_SPLIT_SEED;
  const ratios = options?.ratios ?? DEFAULT_SPLIT_RATIOS;
  const total = ratios.train + ratios.validation + ratios.test;
  if (![ratios.train, ratios.validation, ratios.test].every((v) => Number.isFinite(v) && v >= 0) || Math.abs(total - 1) > 1e-9) {
    throw new Error('INVALID_DATASET_SPLIT_RATIOS');
  }
  if (!groupKey.trim() || !seed.trim()) throw new Error('DATASET_SPLIT_KEY_OR_SEED_REQUIRED');
  const digest = createHash('sha256').update(`${DATASET_SPLIT_VERSION}\0${seed}\0${groupKey}`).digest();
  const bucket = digest.readUInt32BE(0) / 0x1_0000_0000;
  if (bucket < ratios.train) return 'train';
  if (bucket < ratios.train + ratios.validation) return 'validation';
  return 'test';
}

export function splitDatasetExamples<T>(examples: T[], groupKey: (example: T) => string) {
  const result: Record<DatasetSplit, T[]> = { train: [], validation: [], test: [] };
  for (const example of examples) result[assignDatasetSplit(groupKey(example))].push(example);
  return result;
}
