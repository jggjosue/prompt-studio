import { createHash } from 'node:crypto';

/**
 * Object key conventions for the private training bucket.
 *
 *   raw/YYYY/MM/DD/{generations|feedback|events}/{recordId}/{evidenceHash}.json
 *   assets/{images|videos|audio|web}/{sha256}.{ext}
 *   processed/{dataset}/{pipelineVersion}/{exampleKey}.json
 *   datasets/{dataset}/{vNNNNNN}/{train,validation,test}.jsonl, manifest.json,
 *     checksums.json, DATASET_CARD.md, _SUCCESS
 *   manifests/{dataset}/{vNNNNNN}.json
 *   rejected/YYYY/MM/DD/{type}/{recordId}.json
 *
 * Raw evidence and assets are content-addressed, so a retry writes the same key
 * and conditional creates make them immutable. Releases are immutable by
 * version; `latest` is not a valid version.
 */
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

/** Files of a release, in upload order. `_SUCCESS` is always written last. */
export const DATASET_RELEASE_FILES = [
  'train.jsonl',
  'validation.jsonl',
  'test.jsonl',
  'manifest.json',
  'checksums.json',
  'DATASET_CARD.md',
  '_SUCCESS',
] as const;
export type DatasetReleaseFile = (typeof DATASET_RELEASE_FILES)[number];

export const RAW_EVIDENCE_KINDS = ['generations', 'feedback', 'events'] as const;
export const ASSET_KINDS = ['images', 'videos', 'audio', 'web'] as const;
export const REJECTION_TYPES = ['sanitization', 'validation', 'duplicate'] as const;

const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;
const RECORD_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const VERSION = /^v\d{6}$/;
const HASH = /^[a-f0-9]{64}$/;

export function isDatasetName(value: unknown): value is DatasetName {
  return typeof value === 'string' && (DATASET_NAMES as readonly string[]).includes(value);
}

export function isDatasetVersion(value: unknown): value is string {
  return typeof value === 'string' && VERSION.test(value);
}

export function datasetVersion(sequence: number) {
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 999999) {
    throw new Error('DATASET_VERSION_OUT_OF_RANGE');
  }
  return `v${String(sequence).padStart(6, '0')}`;
}

export function datasetVersionNumber(version: string) {
  if (!VERSION.test(version)) throw new Error('INVALID_DATASET_VERSION');
  return Number(version.slice(1));
}

export function datasetReleasePrefix(dataset: DatasetName, version: string) {
  if (!DATASET_NAMES.includes(dataset) || !VERSION.test(version)) throw new Error('INVALID_DATASET_RELEASE_KEY');
  return `datasets/${dataset}/${version}/`;
}

export function datasetReleaseKey(dataset: DatasetName, version: string, file: string) {
  if (!(DATASET_RELEASE_FILES as readonly string[]).includes(file)) throw new Error('INVALID_DATASET_RELEASE_FILE');
  return `${datasetReleasePrefix(dataset, version)}${file}`;
}

/** Copy of the manifest outside the release prefix, for browsing lineage. */
export function datasetManifestIndexKey(dataset: DatasetName, version: string) {
  if (!DATASET_NAMES.includes(dataset) || !VERSION.test(version)) throw new Error('INVALID_DATASET_RELEASE_KEY');
  return `manifests/${dataset}/${version}.json`;
}

function datePath(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

/** Record ids contain ':' (e.g. out:<id>); keys use '-' so they stay URL and path safe. */
export function recordIdKeySegment(recordId: string) {
  if (!RECORD_ID.test(recordId)) throw new Error('INVALID_RECORD_ID');
  return recordId.replace(/:/g, '-');
}

export function rawEvidenceKey(input: { date: Date; kind: (typeof RAW_EVIDENCE_KINDS)[number]; recordId: string; evidenceHash: string }) {
  if (!RAW_EVIDENCE_KINDS.includes(input.kind) || !HASH.test(input.evidenceHash)) throw new Error('INVALID_RAW_OBJECT_KEY');
  return `raw/${datePath(input.date)}/${input.kind}/${recordIdKeySegment(input.recordId)}/${input.evidenceHash}.json`;
}

export function assetKey(input: { kind: (typeof ASSET_KINDS)[number]; contentHash: string; extension: string }) {
  if (!ASSET_KINDS.includes(input.kind)) throw new Error('INVALID_ASSET_KIND');
  if (!HASH.test(input.contentHash)) throw new Error('INVALID_ASSET_HASH');
  const extension = input.extension.toLowerCase().replace(/^\./, '');
  if (!/^[a-z0-9]{1,10}$/.test(extension)) throw new Error('INVALID_ASSET_EXTENSION');
  return `assets/${input.kind}/${input.contentHash}.${extension}`;
}

export function processedKey(input: { dataset: DatasetName; pipelineVersion: string; exampleKey: string }) {
  if (!DATASET_NAMES.includes(input.dataset) || !SAFE_ID.test(input.pipelineVersion) || !SAFE_ID.test(input.exampleKey)) {
    throw new Error('INVALID_PROCESSED_OBJECT_KEY');
  }
  return `processed/${input.dataset}/${input.pipelineVersion}/${input.exampleKey}.json`;
}

export function processedPrefix(dataset: DatasetName, pipelineVersion: string) {
  if (!DATASET_NAMES.includes(dataset) || !SAFE_ID.test(pipelineVersion)) throw new Error('INVALID_PROCESSED_OBJECT_KEY');
  return `processed/${dataset}/${pipelineVersion}/`;
}

export function rejectedKey(input: { date: Date; type: (typeof REJECTION_TYPES)[number]; recordId: string }) {
  if (!REJECTION_TYPES.includes(input.type)) throw new Error('INVALID_REJECTION_TYPE');
  return `rejected/${datePath(input.date)}/${input.type}/${recordIdKeySegment(input.recordId)}.json`;
}

export function sha256(value: string | Uint8Array) {
  return createHash('sha256').update(value).digest('hex');
}
