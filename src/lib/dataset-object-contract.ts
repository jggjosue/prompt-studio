import { createHash } from 'node:crypto';

export const DATASET_RELEASE_SCHEMA_VERSION = 1 as const;
export const DATASET_NAMES = [
  'prompt-enhancement',
  'preference',
  'image-generation',
  'video-generation',
  'web-generation',
] as const;
export type DatasetName = (typeof DATASET_NAMES)[number];

export const DATASET_SPLIT_FILES = {
  train: 'train.jsonl',
  validation: 'validation.jsonl',
  test: 'test.jsonl',
} as const;

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const VERSION = /^v\d{6}$/;
const HASH = /^[a-f0-9]{64}$/;

export function datasetVersion(sequence: number) {
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 999999) {
    throw new Error('DATASET_VERSION_OUT_OF_RANGE');
  }
  return `v${String(sequence).padStart(6, '0')}`;
}

export function datasetReleasePrefix(dataset: DatasetName, version: string) {
  if (!DATASET_NAMES.includes(dataset) || !VERSION.test(version)) throw new Error('INVALID_DATASET_RELEASE_KEY');
  return `datasets/${dataset}/${version}/`;
}

export function datasetReleaseKey(dataset: DatasetName, version: string, file: string) {
  if (!['train.jsonl', 'validation.jsonl', 'test.jsonl', 'manifest.json', 'checksums.json', 'DATASET_CARD.md', 'LICENSES.json'].includes(file)) {
    throw new Error('INVALID_DATASET_RELEASE_FILE');
  }
  return `${datasetReleasePrefix(dataset, version)}${file}`;
}

export function rawGenerationKey(input: { date: Date; recordId: string; contentHash: string }) {
  if (!SAFE_ID.test(input.recordId) || !HASH.test(input.contentHash)) throw new Error('INVALID_RAW_OBJECT_KEY');
  const yyyy = input.date.getUTCFullYear();
  const mm = String(input.date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(input.date.getUTCDate()).padStart(2, '0');
  return `raw/${yyyy}/${mm}/${dd}/generations/${input.contentHash.slice(0, 2)}/${input.recordId}.json`;
}

export function assetKey(input: { kind: 'images' | 'videos' | 'audio'; contentHash: string; extension: string }) {
  if (!HASH.test(input.contentHash)) throw new Error('INVALID_ASSET_HASH');
  const extension = input.extension.toLowerCase().replace(/^\./, '');
  if (!/^[a-z0-9]{1,10}$/.test(extension)) throw new Error('INVALID_ASSET_EXTENSION');
  return `assets/${input.kind}/sha256/${input.contentHash.slice(0, 2)}/${input.contentHash}.${extension}`;
}

export function processedKey(input: { dataset: DatasetName; pipelineVersion: string; recordId: string }) {
  if (!SAFE_ID.test(input.pipelineVersion) || !SAFE_ID.test(input.recordId)) throw new Error('INVALID_PROCESSED_OBJECT_KEY');
  return `processed/${input.dataset}/${input.pipelineVersion}/${input.recordId}.json`;
}

export function sha256(value: string | Uint8Array) {
  return createHash('sha256').update(value).digest('hex');
}

export interface DatasetReleaseManifestV1 {
  schemaVersion: typeof DATASET_RELEASE_SCHEMA_VERSION;
  dataset: DatasetName;
  version: string;
  buildId: string;
  builtAt: string;
  sourceWindow: { from: string; to: string };
  pipelineVersion: string;
  recordCounts: { train: number; validation: number; test: number; total: number };
  checksums: Record<string, string>;
  lineage: Array<{ source: string; revision: string | null; records: number }>;
}
