import { artifactChecksum } from '@/lib/dataset-manifest';
import { stableSplitGroupKey } from '@/lib/dataset-splitting';

/** validation-v2: leakage uses the same group priority as the splitter (user pseudonym first). */
export const DATASET_VALIDATION_VERSION = 'validation-v2';
export type SplitName = 'train' | 'validation' | 'test';

type Row = Record<string, any>;
type ValidationIssue = { code: string; split?: SplitName; line?: number; detail?: string };

function parseJsonl(name: SplitName, content: string, issues: ValidationIssue[]) {
  const rows: Row[] = [];
  for (const [index, line] of content.split('\n').entries()) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('not-object');
      rows.push(row);
    } catch {
      issues.push({ code: 'INVALID_JSONL', split: name, line: index + 1 });
    }
  }
  return rows;
}

/** Same priority as stableSplitGroupKey: user pseudonym > session > request > source > example. */
function groupKey(row: Row) {
  const sourceGroupId = row.provenance?.sourceRecordId
    ?? (Array.isArray(row.provenance?.sourceRecordIds) ? row.provenance.sourceRecordIds[0] : null);
  try {
    return stableSplitGroupKey({
      userGroupId: typeof row.splitGroupId === 'string' ? row.splitGroupId : null,
      sessionId: typeof row.provenance?.sessionId === 'string' ? row.provenance.sessionId : null,
      requestId: typeof row.provenance?.requestId === 'string' ? row.provenance.requestId : null,
      sourceGroupId: typeof sourceGroupId === 'string' ? sourceGroupId : null,
      exampleId: typeof row.exampleId === 'string' ? row.exampleId : '',
    });
  } catch {
    return null;
  }
}

export function validateDatasetRelease(input: {
  files: { 'train.jsonl': string; 'validation.jsonl': string; 'test.jsonl': string; 'manifest.json': string; 'checksums.json': string; 'DATASET_CARD.md'?: string };
  maxDuplicateRate?: number;
}) {
  const issues: ValidationIssue[] = [];
  const splits = {
    train: parseJsonl('train', input.files['train.jsonl'], issues),
    validation: parseJsonl('validation', input.files['validation.jsonl'], issues),
    test: parseJsonl('test', input.files['test.jsonl'], issues),
  };
  const seenExamples = new Set<string>();
  let duplicateCount = 0;
  const groups = new Map<string, SplitName>();
  for (const [split, rows] of Object.entries(splits) as [SplitName, Row[]][]) {
    for (const [index, row] of rows.entries()) {
      if (!Number.isInteger(row.schemaVersion) || !row.exampleId || typeof row.exampleId !== 'string') {
        issues.push({ code: 'REQUIRED_FIELDS_MISSING', split, line: index + 1 });
      }
      if (seenExamples.has(row.exampleId)) duplicateCount++;
      else seenExamples.add(row.exampleId);
      const key = groupKey(row);
      if (!key) issues.push({ code: 'SPLIT_GROUP_KEY_MISSING', split, line: index + 1 });
      else if (groups.has(key) && groups.get(key) !== split) issues.push({ code: 'SPLIT_LEAKAGE', split, line: index + 1, detail: key });
      else groups.set(key, split);
      if (Array.isArray(row.outputs)) {
        for (const asset of row.outputs) {
          if (asset?.provider !== 'cloudflare-r2' || !asset?.bucket || !asset?.key || 'body' in asset || 'data' in asset) {
            issues.push({ code: 'INVALID_ASSET_REFERENCE', split, line: index + 1 });
          }
        }
      }
    }
  }
  const total = splits.train.length + splits.validation.length + splits.test.length;
  const duplicateRate = total ? duplicateCount / total : 0;
  if (duplicateRate > (input.maxDuplicateRate ?? 0)) issues.push({ code: 'DUPLICATE_RATE_EXCEEDED', detail: String(duplicateRate) });
  let manifest: any = null;
  let checksums: any = null;
  try { manifest = JSON.parse(input.files['manifest.json']); } catch { issues.push({ code: 'INVALID_MANIFEST_JSON' }); }
  try { checksums = JSON.parse(input.files['checksums.json']); } catch { issues.push({ code: 'INVALID_CHECKSUMS_JSON' }); }
  if (manifest) {
    if (manifest.counts?.train !== splits.train.length || manifest.counts?.validation !== splits.validation.length || manifest.counts?.test !== splits.test.length || manifest.counts?.total !== total) {
      issues.push({ code: 'MANIFEST_COUNT_MISMATCH' });
    }
  }
  if (checksums) {
    for (const file of ['train.jsonl', 'validation.jsonl', 'test.jsonl', 'manifest.json', 'DATASET_CARD.md'] as const) {
      const content = input.files[file];
      if (content === undefined) continue;
      if (checksums[file] !== artifactChecksum(content)) issues.push({ code: 'CHECKSUM_MISMATCH', detail: file });
    }
  }
  return { version: DATASET_VALIDATION_VERSION, valid: issues.length === 0, total, duplicateRate, issues };
}

export function assertValidDatasetRelease(input: Parameters<typeof validateDatasetRelease>[0]) {
  const result = validateDatasetRelease(input);
  if (!result.valid) throw new Error(`DATASET_VALIDATION_FAILED:${result.issues.map((i) => i.code).join(',')}`);
  return result;
}
