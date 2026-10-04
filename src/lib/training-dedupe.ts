import { createHash } from 'node:crypto';

/**
 * canonical-v1: JSON with object keys sorted recursively by UTF-16 code unit
 * (locale independent), undefined members dropped, arrays kept in order and
 * non-finite numbers rejected. Callers hash only training content: volatile
 * fields (record ids, timestamps, correlation and provenance ids) must not be
 * part of the value, see `datasetContentFor*` in training/processing.
 */
export const TRAINING_CANONICALIZATION_VERSION = 'canonical-v1';

const byCodeUnit = ([a]: [string, unknown], [b]: [string, unknown]) => (a < b ? -1 : a > b ? 1 : 0);

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(byCodeUnit)
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('NON_FINITE_CANONICAL_NUMBER');
  return value;
}

export function canonicalTrainingJson(value: unknown) {
  const json = JSON.stringify(canonicalize(value));
  if (json === undefined) throw new Error('UNCANONICALIZABLE_TRAINING_VALUE');
  return json;
}

export function trainingContentHash(value: unknown) {
  return createHash('sha256').update(canonicalTrainingJson(value), 'utf8').digest('hex');
}

export function trainingDedupeKey(dataset: string, contentHash: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(dataset) || !/^[a-f0-9]{64}$/.test(contentHash)) {
    throw new Error('INVALID_TRAINING_DEDUPE_KEY');
  }
  return `dedupe:${TRAINING_CANONICALIZATION_VERSION}:${dataset}:${contentHash}`;
}
