import 'server-only';
import {
  DATASET_RELEASE_FILES,
  datasetReleaseKey,
  isDatasetName,
  isDatasetVersion,
  type DatasetName,
  type DatasetReleaseFile,
} from '@/lib/dataset-object-contract';
import { artifactChecksum, type DatasetManifestV2 } from '@/lib/dataset-manifest';
import { datasetVersionsInStore } from '@/lib/datasets/release';
import { textOf, type TrainingObjectStore } from '@/lib/training/object-store';
import { emitTrainingMetric } from '@/lib/training/training-metrics';

/**
 * Read side of dataset releases. Training jobs must pin dataset + version and
 * verify checksums; these helpers enforce that:
 * - only versions with `_SUCCESS` exist for readers (partial uploads are invisible),
 * - `latest`, processed/ and other mutable prefixes are not addressable,
 * - every artifact is checked against checksums.json before it is returned,
 * - download URLs are presigned and short-lived; the bucket is never public.
 */
export class DatasetRetrievalError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'DatasetRetrievalError';
  }
}

export const MAX_DOWNLOAD_URL_SECONDS = 15 * 60;
const READABLE_ARTIFACTS = DATASET_RELEASE_FILES.filter((file) => file !== '_SUCCESS');

function assertRef(dataset: unknown, version: unknown): asserts dataset is DatasetName {
  if (!isDatasetName(dataset)) throw new DatasetRetrievalError('INVALID_DATASET_NAME');
  // `latest` and any non-pinned version fail here by construction.
  if (!isDatasetVersion(version)) throw new DatasetRetrievalError('INVALID_DATASET_VERSION');
}

async function readJson<T>(store: TrainingObjectStore, key: string): Promise<{ value: T; bytes: Uint8Array } | null> {
  const bytes = await store.get(key);
  if (!bytes) return null;
  try {
    return { value: JSON.parse(textOf(bytes)) as T, bytes };
  } catch {
    throw new DatasetRetrievalError('RELEASE_OBJECT_CORRUPT');
  }
}

/** Complete (released) versions, oldest first. Pass includeIncomplete to audit partial uploads. */
export async function listDatasetVersions(store: TrainingObjectStore, dataset: DatasetName, options: { includeIncomplete?: boolean } = {}) {
  if (!isDatasetName(dataset)) throw new DatasetRetrievalError('INVALID_DATASET_NAME');
  const versions = await datasetVersionsInStore(store, dataset);
  return options.includeIncomplete ? versions : versions.filter((item) => item.complete).map(({ version }) => ({ version, complete: true }));
}

async function successMarker(store: TrainingObjectStore, dataset: DatasetName, version: string) {
  const marker = await readJson<{ manifestSha256?: string }>(store, datasetReleaseKey(dataset, version, '_SUCCESS'));
  if (!marker) throw new DatasetRetrievalError('RELEASE_NOT_COMPLETE');
  return marker.value;
}

async function checksumsFor(store: TrainingObjectStore, dataset: DatasetName, version: string) {
  const checksums = await readJson<Record<string, string>>(store, datasetReleaseKey(dataset, version, 'checksums.json'));
  if (!checksums) throw new DatasetRetrievalError('RELEASE_CHECKSUMS_MISSING');
  return checksums.value;
}

/** The manifest of a complete release, verified against checksums.json and _SUCCESS. */
export async function getDatasetManifest(store: TrainingObjectStore, dataset: DatasetName, version: string): Promise<DatasetManifestV2> {
  assertRef(dataset, version);
  const marker = await successMarker(store, dataset, version);
  const checksums = await checksumsFor(store, dataset, version);
  const manifest = await readJson<DatasetManifestV2>(store, datasetReleaseKey(dataset, version, 'manifest.json'));
  if (!manifest) throw new DatasetRetrievalError('RELEASE_MANIFEST_MISSING');
  const digest = artifactChecksum(manifest.bytes);
  if (digest !== checksums['manifest.json'] || (marker.manifestSha256 && digest !== marker.manifestSha256)) {
    throw new DatasetRetrievalError('CHECKSUM_MISMATCH:manifest.json');
  }
  if (manifest.value.dataset !== dataset || manifest.value.version !== version) throw new DatasetRetrievalError('MANIFEST_IDENTITY_MISMATCH');
  return manifest.value;
}

/** Artifact bytes of a complete release, verified against checksums.json. */
export async function getDatasetArtifact(store: TrainingObjectStore, dataset: DatasetName, version: string, artifact: DatasetReleaseFile) {
  assertRef(dataset, version);
  if (!(READABLE_ARTIFACTS as readonly string[]).includes(artifact)) throw new DatasetRetrievalError('INVALID_DATASET_ARTIFACT');
  await successMarker(store, dataset, version);
  const bytes = await store.get(datasetReleaseKey(dataset, version, artifact));
  if (!bytes) throw new DatasetRetrievalError(`RELEASE_ARTIFACT_MISSING:${artifact}`);
  if (artifact !== 'checksums.json') {
    const checksums = await checksumsFor(store, dataset, version);
    if (artifactChecksum(bytes) !== checksums[artifact]) throw new DatasetRetrievalError(`CHECKSUM_MISMATCH:${artifact}`);
  }
  emitTrainingMetric('training_r2_operations_total', 1, { operation: 'get', stage: 'retrieve', result: 'success' });
  return bytes;
}

/**
 * Short-lived presigned GET for one artifact of a complete release. The
 * artifact is verified first, so a URL is never issued for corrupted data.
 */
export async function getDatasetDownloadUrl(store: TrainingObjectStore, dataset: DatasetName, version: string, artifact: DatasetReleaseFile, expiresInSeconds = 300) {
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > MAX_DOWNLOAD_URL_SECONDS) {
    throw new DatasetRetrievalError('INVALID_URL_EXPIRY');
  }
  await getDatasetArtifact(store, dataset, version, artifact);
  return {
    url: await store.signedGetUrl(datasetReleaseKey(dataset, version, artifact), expiresInSeconds),
    expiresInSeconds,
    sha256: (await checksumsFor(store, dataset, version))[artifact] ?? null,
  };
}

/** Full verification of a release: completeness, every checksum and manifest consistency. */
export async function verifyDatasetRelease(store: TrainingObjectStore, dataset: DatasetName, version: string) {
  assertRef(dataset, version);
  const issues: string[] = [];
  let manifest: DatasetManifestV2 | null = null;
  try {
    manifest = await getDatasetManifest(store, dataset, version);
  } catch (error) {
    issues.push(error instanceof DatasetRetrievalError ? error.code : 'MANIFEST_UNREADABLE');
  }
  const artifacts: Record<string, string> = {};
  for (const artifact of READABLE_ARTIFACTS.filter((file) => file !== 'manifest.json' && file !== 'checksums.json')) {
    try {
      artifacts[artifact] = artifactChecksum(await getDatasetArtifact(store, dataset, version, artifact));
    } catch (error) {
      issues.push(error instanceof DatasetRetrievalError ? error.code : `UNREADABLE:${artifact}`);
    }
  }
  if (manifest) {
    for (const artifact of manifest.artifacts) {
      const name = artifact.key.split('/').pop()!;
      if (artifacts[name] && artifacts[name] !== artifact.sha256) issues.push(`MANIFEST_CHECKSUM_MISMATCH:${name}`);
    }
    for (const split of ['train', 'validation', 'test'] as const) {
      const declared = manifest.counts[split];
      const bytes = issues.length ? null : await getDatasetArtifact(store, dataset, version, `${split}.jsonl`);
      if (bytes && textOf(bytes).split('\n').filter(Boolean).length !== declared) issues.push(`MANIFEST_COUNT_MISMATCH:${split}`);
    }
  }
  return { dataset, version, valid: issues.length === 0, issues, checksums: artifacts, manifest };
}
