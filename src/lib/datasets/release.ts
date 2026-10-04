import 'server-only';
import { randomUUID } from 'node:crypto';
import {
  DATASET_RELEASE_FILES,
  datasetManifestIndexKey,
  datasetReleaseKey,
  datasetVersionNumber,
  isDatasetName,
  isDatasetVersion,
  processedPrefix,
  type DatasetName,
} from '@/lib/dataset-object-contract';
import { artifactChecksum, buildDatasetManifest, sortedDigest, type DatasetManifestV2 } from '@/lib/dataset-manifest';
import { assignDatasetSplit, stableSplitGroupKey, type DatasetSplit } from '@/lib/dataset-splitting';
import { DATASET_VALIDATION_VERSION, validateDatasetRelease } from '@/lib/dataset-validation';
import { renderDatasetCard } from '@/lib/datasets/dataset-card';
import { resolveAuthoritativeTrainingConsent } from '@/lib/training-consent';
import { qualityThreshold } from '@/lib/training-quality';
import { textOf, type TrainingObjectStore } from '@/lib/training/object-store';
import { pseudonymSecretFingerprint } from '@/lib/training/pseudonym';
import { emitTrainingMetric } from '@/lib/training/training-metrics';
import { PROCESSED_EXAMPLE_SCHEMA_VERSION, TRAINING_PIPELINE_VERSION } from '@/lib/training/versions';
import TrainingDataRecord from '@/models/TrainingDataRecord';
import { TrainingDataRevocation } from '@/models/TrainingDataRevocation';

/**
 * Builds and publishes an immutable dataset release:
 *
 *   1 locate processed examples      8 leakage validation
 *   2 re-validate consent/eligibility 9 checksums
 *   3 dedupe on content hash         10 manifest + dataset card
 *   4 quality threshold              11 upload (conditional creates)
 *   5 build rows                     12 verify every object by checksum
 *   6 deterministic split            13 _SUCCESS, written last
 *   7 JSONL
 *
 * A release is valid only when `_SUCCESS` exists. Every object is created with
 * If-None-Match, so an existing version can never be overwritten, and the
 * version must be greater than every existing one (complete or partial).
 */
export const DATASET_RELEASE_JOB_VERSION = 'release-v2';

const DATASET_SCHEMA_VERSIONS: Record<DatasetName, number> = {
  'prompt-enhancement': 1, preference: 1, 'image-generation': 1, 'video-generation': 1, 'web-generation': 1,
};

export class DatasetReleaseError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'DatasetReleaseError';
  }
}

type ProcessedEnvelope = {
  schemaVersion: number;
  dataset: string;
  exampleKey: string;
  contentHash: string;
  quality: { version: string; score: number };
  split: { groupId: string };
  lineage: { sourceRecordIds: string[]; occurredAt: string };
  example: Record<string, unknown> & { exampleId: string; quality?: Record<string, unknown> };
};

export type ReleaseResult = {
  dataset: DatasetName;
  version: string;
  keys: string[];
  counts: DatasetManifestV2['counts'];
  manifestSha256: string;
};

/** Versions present under datasets/{dataset}/, with whether each has _SUCCESS. */
export async function datasetVersionsInStore(store: TrainingObjectStore, dataset: DatasetName) {
  const keys = await store.list(`datasets/${dataset}/`);
  const versions = new Map<string, boolean>();
  for (const key of keys) {
    const [, , version, file] = key.split('/');
    if (!isDatasetVersion(version)) continue;
    versions.set(version, versions.get(version) === true || file === '_SUCCESS');
  }
  return [...versions.entries()].map(([version, complete]) => ({ version, complete })).sort((a, b) => (a.version < b.version ? -1 : 1));
}

async function loadProcessed(store: TrainingObjectStore, dataset: DatasetName) {
  const prefix = processedPrefix(dataset, TRAINING_PIPELINE_VERSION);
  const envelopes: ProcessedEnvelope[] = [];
  let malformed = 0;
  for (const key of await store.list(prefix)) {
    if (!key.endsWith('.json')) continue;
    const bytes = await store.get(key);
    try {
      const envelope = JSON.parse(textOf(bytes ?? new Uint8Array())) as ProcessedEnvelope;
      if (envelope.schemaVersion !== PROCESSED_EXAMPLE_SCHEMA_VERSION || envelope.dataset !== dataset || !envelope.example?.exampleId || !envelope.split?.groupId) {
        malformed += 1;
        continue;
      }
      envelopes.push(envelope);
    } catch {
      malformed += 1;
    }
  }
  return { prefix, envelopes, malformed };
}

/**
 * Release-time eligibility, independent of what the worker decided: the
 * source records must still exist and be eligible, their owners must have
 * valid training consent now, and no revocation may name them or their owner.
 */
export async function eligibleSources(recordIds: string[]) {
  const records: Array<{ recordId: string; userId: string; consent?: { training?: boolean }; eligibility?: { status?: string } }> = [];
  for (let index = 0; index < recordIds.length; index += 500) {
    records.push(...await TrainingDataRecord.find({ entityType: 'output', recordId: { $in: recordIds.slice(index, index + 500) } })
      .select('recordId userId consent eligibility').lean<typeof records>());
  }
  const userIds = [...new Set(records.map((record) => record.userId))];
  const consent = new Map<string, boolean>();
  for (const userId of userIds) consent.set(userId, (await resolveAuthoritativeTrainingConsent(userId)).training);
  const revoked = new Set<string>();
  const revokedUsers = new Set<string>();
  for (let index = 0; index < recordIds.length; index += 500) {
    const revocations = await TrainingDataRevocation.find({
      $or: [{ sourceRecordIds: { $in: recordIds.slice(index, index + 500) } }, { userId: { $in: userIds } }],
    }).select('sourceRecordIds userId').lean<Array<{ sourceRecordIds?: string[]; userId?: string | null }>>();
    for (const revocation of revocations) {
      for (const id of revocation.sourceRecordIds ?? []) revoked.add(id);
      if (revocation.userId) revokedUsers.add(revocation.userId);
    }
  }
  const eligible = new Set<string>();
  const revokedSources = new Set<string>();
  for (const record of records) {
    const isRevoked = revoked.has(record.recordId) || revokedUsers.has(record.userId) || record.eligibility?.status === 'revoked' || consent.get(record.userId) === false;
    if (isRevoked) revokedSources.add(record.recordId);
    else if (record.consent?.training === true && ['pending', 'eligible'].includes(record.eligibility?.status ?? '')) eligible.add(record.recordId);
  }
  return { eligible, revokedSources };
}

export async function runDatasetRelease(input: {
  dataset: DatasetName;
  version: string;
  store: TrainingObjectStore;
  pseudonymSecret: string;
  supersedes?: string | null;
  allowEmpty?: boolean;
  now?: () => Date;
  env?: NodeJS.ProcessEnv;
  buildId?: string;
}): Promise<ReleaseResult> {
  const started = Date.now();
  const now = input.now ?? (() => new Date());
  const { dataset, version, store } = input;
  try {
    if (!isDatasetName(dataset)) throw new DatasetReleaseError('INVALID_DATASET_NAME');
    if (!isDatasetVersion(version)) throw new DatasetReleaseError('INVALID_DATASET_VERSION');

    // Immutability and monotonic versions: never reuse or go below an existing version.
    const existing = await datasetVersionsInStore(store, dataset);
    if (existing.some((item) => item.version === version)) throw new DatasetReleaseError('DATASET_VERSION_EXISTS');
    const highest = existing.at(-1)?.version;
    if (highest && datasetVersionNumber(version) <= datasetVersionNumber(highest)) throw new DatasetReleaseError(`DATASET_VERSION_NOT_INCREASING:${highest}`);
    if (input.supersedes && !existing.some((item) => item.version === input.supersedes && item.complete)) {
      throw new DatasetReleaseError('SUPERSEDED_VERSION_NOT_FOUND');
    }

    // 1. Locate processed examples.
    const { prefix, envelopes, malformed } = await loadProcessed(store, dataset);
    const filters: Array<{ name: string; dropped: number }> = [{ name: 'processed-schema', dropped: malformed }];

    // 2. Re-validate consent and eligibility at release time.
    const sourceIds = [...new Set(envelopes.flatMap((envelope) => envelope.lineage.sourceRecordIds))];
    const { eligible, revokedSources } = await eligibleSources(sourceIds);
    const eligibleEnvelopes = envelopes.filter((envelope) => envelope.lineage.sourceRecordIds.every((id) => eligible.has(id)));
    filters.push({ name: 'consent-eligibility', dropped: envelopes.length - eligibleEnvelopes.length });

    // 3. Dedupe on the canonical content hash (first by example key wins, deterministically).
    const byHash = new Map<string, ProcessedEnvelope>();
    for (const envelope of [...eligibleEnvelopes].sort((a, b) => (a.exampleKey < b.exampleKey ? -1 : 1))) {
      if (!byHash.has(envelope.contentHash)) byHash.set(envelope.contentHash, envelope);
    }
    const deduped = [...byHash.values()];
    filters.push({ name: 'content-dedupe', dropped: eligibleEnvelopes.length - deduped.length });

    // 4. Quality threshold in force for this release.
    const threshold = qualityThreshold(dataset, input.env);
    const passing = deduped.filter((envelope) => envelope.quality.score >= threshold);
    filters.push({ name: 'quality-threshold', dropped: deduped.length - passing.length });
    if (!passing.length && !input.allowEmpty) throw new DatasetReleaseError('NO_ELIGIBLE_EXAMPLES');

    // 5-7. Rows, deterministic split by pseudonymous user group, JSONL.
    const splits: Record<DatasetSplit, Array<Record<string, unknown>>> = { train: [], validation: [], test: [] };
    for (const envelope of passing) {
      const row = {
        ...envelope.example,
        quality: { version: envelope.quality.version, score: envelope.quality.score, threshold },
        splitGroupId: envelope.split.groupId,
      };
      splits[assignDatasetSplit(stableSplitGroupKey({ userGroupId: envelope.split.groupId, exampleId: envelope.example.exampleId }))].push(row);
    }
    const jsonl = (rows: Array<Record<string, unknown>>) => {
      const sorted = [...rows].sort((a, b) => (String(a.exampleId) < String(b.exampleId) ? -1 : 1));
      return sorted.map((row) => JSON.stringify(row)).join('\n') + (sorted.length ? '\n' : '');
    };
    const files: Record<string, string> = {
      'train.jsonl': jsonl(splits.train),
      'validation.jsonl': jsonl(splits.validation),
      'test.jsonl': jsonl(splits.test),
    };

    const occurred = passing.map((envelope) => envelope.lineage.occurredAt).filter(Boolean).sort();
    const releasedSources = passing.flatMap((envelope) => envelope.lineage.sourceRecordIds);
    const counts = {
      candidates: envelopes.length + malformed,
      eligible: eligibleEnvelopes.length,
      deduplicated: deduped.length,
      total: passing.length,
      train: splits.train.length,
      validation: splits.validation.length,
      test: splits.test.length,
    };
    const builtAt = now().toISOString();
    const parentVersions = [...new Set([...(input.supersedes ? [input.supersedes] : []), ...(existing.filter((item) => item.complete).map((item) => item.version).slice(-1))])];
    const cardContext = { dataset, version, builtAt, counts, filters, threshold, parentVersions, splitRatios: { train: 0.9, validation: 0.05, test: 0.05 } };

    // 9-10. Checksums, dataset card, manifest. checksums.json covers everything but itself.
    files['DATASET_CARD.md'] = renderDatasetCard(cardContext);
    const checksums = Object.fromEntries(Object.entries(files).map(([name, content]) => [name, artifactChecksum(content)]));
    const manifest = buildDatasetManifest({
      dataset,
      version,
      datasetSchemaVersion: DATASET_SCHEMA_VERSIONS[dataset],
      builtAt,
      buildId: input.buildId ?? input.env?.GIT_COMMIT_SHA?.trim().slice(0, 40) ?? randomUUID(),
      releaseJobVersion: DATASET_RELEASE_JOB_VERSION,
      source: { windowStart: occurred[0] ?? null, windowEnd: occurred.at(-1) ?? null, prefixes: [prefix] },
      counts,
      filters,
      qualityThreshold: threshold,
      checksums,
      artifacts: (['train.jsonl', 'validation.jsonl', 'test.jsonl'] as const).map((name) => ({
        key: datasetReleaseKey(dataset, version, name),
        bytes: new TextEncoder().encode(files[name]).byteLength,
        sha256: checksums[name],
        records: files[name].split('\n').filter(Boolean).length,
      })),
      lineage: {
        parentVersions,
        sourcePrefixes: [prefix],
        sourceRecordsDigest: sortedDigest(releasedSources),
        sourceRecordCount: new Set(releasedSources).size,
        revocationSnapshotDigest: sortedDigest(revokedSources),
        revokedExcluded: revokedSources.size,
        pseudonymSecretFingerprint: pseudonymSecretFingerprint(input.pseudonymSecret),
      },
      validationVersion: DATASET_VALIDATION_VERSION,
    });
    files['manifest.json'] = `${JSON.stringify(manifest, null, 2)}\n`;
    files['checksums.json'] = `${JSON.stringify({ ...checksums, 'manifest.json': artifactChecksum(files['manifest.json']) }, null, 2)}\n`;

    // 8. Leakage, duplicate, count and checksum validation before anything is uploaded.
    const validation = validateDatasetRelease({ files: files as Parameters<typeof validateDatasetRelease>[0]['files'] });
    if (!validation.valid) throw new DatasetReleaseError(`DATASET_VALIDATION_FAILED:${[...new Set(validation.issues.map((issue) => issue.code))].join(',')}`);

    // 11. Upload with conditional creates, _SUCCESS excluded.
    const keys: string[] = [];
    for (const name of DATASET_RELEASE_FILES.filter((file) => file !== '_SUCCESS')) {
      const key = datasetReleaseKey(dataset, version, name);
      const result = await store.put(key, files[name], {
        contentType: name.endsWith('.jsonl') ? 'application/x-ndjson' : name.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'application/json',
        ifNoneMatch: true,
        metadata: { dataset, version, sha256: name === 'checksums.json' ? '' : artifactChecksum(files[name]) },
      });
      if (!result.created) throw new DatasetReleaseError(`RELEASE_OBJECT_EXISTS:${name}`);
      keys.push(key);
    }

    // 12. Read every object back and verify its checksum.
    for (const name of DATASET_RELEASE_FILES.filter((file) => file !== '_SUCCESS')) {
      const bytes = await store.get(datasetReleaseKey(dataset, version, name));
      if (!bytes || artifactChecksum(bytes) !== artifactChecksum(files[name])) throw new DatasetReleaseError(`RELEASE_VERIFICATION_FAILED:${name}`);
    }
    await store.put(datasetManifestIndexKey(dataset, version), files['manifest.json'], { contentType: 'application/json', ifNoneMatch: true });

    // 13. _SUCCESS last: only now does the release exist for readers.
    const manifestSha256 = artifactChecksum(files['manifest.json']);
    const success = await store.put(datasetReleaseKey(dataset, version, '_SUCCESS'), `${JSON.stringify({ dataset, version, manifestSha256, completedAt: now().toISOString() })}\n`, {
      contentType: 'application/json', ifNoneMatch: true,
    });
    if (!success.created) throw new DatasetReleaseError('RELEASE_OBJECT_EXISTS:_SUCCESS');
    keys.push(datasetReleaseKey(dataset, version, '_SUCCESS'));

    emitTrainingMetric('dataset_examples_total', counts.total, { dataset });
    emitTrainingMetric('dataset_release_success_total', 1, { dataset });
    return { dataset, version, keys, counts, manifestSha256 };
  } catch (error) {
    emitTrainingMetric('dataset_release_failure_total', 1, { dataset: isDatasetName(dataset) ? dataset : undefined });
    throw error;
  } finally {
    emitTrainingMetric('dataset_release_duration_ms', Date.now() - started, { dataset: isDatasetName(dataset) ? dataset : undefined });
  }
}

/** Next free version for a dataset (v000001 when none exist). */
export async function nextDatasetVersion(store: TrainingObjectStore, dataset: DatasetName) {
  const highest = (await datasetVersionsInStore(store, dataset)).at(-1)?.version;
  const next = highest ? datasetVersionNumber(highest) + 1 : 1;
  return `v${String(next).padStart(6, '0')}`;
}
