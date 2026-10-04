import '../support/fake-mongo-env';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';
import { FakeCollection, patchModel } from '../support/fake-mongo';
import TrainingDataRecord from '../../src/models/TrainingDataRecord';
import AIGenerationJob from '../../src/models/AIGenerationJob';
import TrainingConsentRecord, { TRAINING_CONSENT_POLICY_VERSION } from '../../src/models/TrainingConsentRecord';
import TrainingContentFingerprint from '../../src/models/TrainingContentFingerprint';
import { MemoryTrainingObjectStore, textOf } from '../../src/lib/training/object-store';
import { PermanentProcessingError, processTrainingMessage, type ProcessDeps } from '../../src/lib/training/processing';
import { createTrainingSqsMessage } from '../../src/lib/training-sqs-contract';
import { handleTrainingQueueMessage } from '../../src/lib/training/worker';
import { setTrainingMetricSink } from '../../src/lib/training/training-metrics';
import type { MediaAssetSource } from '../../src/lib/training/media-source';

const MEDIA_BUCKET = 'prompt-studio-media';
const SECRET = 'test-pseudonym-secret-with-enough-entropy-0123456789';
const png = (seed: string) => new Uint8Array(createHash('sha256').update(seed).digest());
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

let records: FakeCollection;
let jobs: FakeCollection;
let consents: FakeCollection;
let fingerprints: FakeCollection;
let restores: Array<() => void> = [];
let store: MemoryTrainingObjectStore;
let mediaObjects: Map<string, Uint8Array>;
let deps: ProcessDeps;
const now = new Date('2026-10-03T12:00:00Z');

const media: MediaAssetSource = {
  async readR2(reference) { return reference.bucket === MEDIA_BUCKET ? mediaObjects.get(reference.key) ?? null : null; },
  async fetchRemote() { return null; },
};

function grantConsent(userId = 'user_a', training = true, changedAt = new Date('2026-10-01T00:00:00Z')) {
  consents.insert({ userId, training, policyVersion: TRAINING_CONSENT_POLICY_VERSION, source: 'generate', changedAt, revokedAt: training ? null : changedAt });
}

function addGeneration(id: string, options: { userId?: string; kind?: string; prompt?: string; parent?: string | null; family?: string; bytesSeed?: string; result?: Record<string, unknown>; operationCode?: string | null; input?: Record<string, unknown> } = {}) {
  const userId = options.userId ?? 'user_a';
  const kind = options.kind ?? 'image';
  const bytes = png(options.bytesSeed ?? id);
  const key = `users/${userId}/generations/${sha(bytes)}.png`;
  mediaObjects.set(key, bytes);
  const asset = { provider: 'cloudflare-r2', bucket: MEDIA_BUCKET, key, contentType: 'image/png', contentHash: sha(bytes), bytes: bytes.byteLength };
  jobs.insert({
    _id: id, userId, kind, provider: 'google', modelId: 'gemini-image', status: 'completed', operationCode: options.operationCode ?? null,
    input: { prompt: options.prompt ?? 'a red bicycle at dawn', ...(options.input ?? {}) },
    result: options.result ?? { imageUrl: `/api/ai/jobs/${id}/asset`, asset, assets: [asset] },
  });
  const base = {
    schemaVersion: 2, userId, sessionId: 'chat_1', requestId: id, outputId: id, generationId: id,
    modality: kind === 'project' ? 'web' : kind, model: { provider: 'google', model: 'gemini-image', version: null }, parameters: { aspectRatio: '1:1' },
    consent: { training: true, version: TRAINING_CONSENT_POLICY_VERSION, capturedAt: new Date('2026-10-01T00:00:00Z'), source: 'account' },
    eligibility: { status: 'pending', reasonCodes: [], evaluatedAt: null, evaluatorVersion: 'consent-gate-v1' },
    provenance: { source: 'generate', sourceId: id, parentIds: [], correlationId: `corr-${id}` },
    relations: { parentGenerationId: options.parent ?? null, familyId: options.family ?? id },
    occurredAt: new Date('2026-10-03T10:00:00Z'),
  };
  records.insert({ ...base, entityType: 'output', recordId: `out:${id}`, assets: kind === 'image' ? [asset] : [], payload: {}, pipeline: { status: 'queued', attempts: 0, processedKeys: [] } });
  records.insert({ ...base, entityType: 'event', recordId: `evt:generation_completed:${id}`, eventName: 'generation_completed', assets: [], payload: {} });
}

function addEvent(id: string, eventName: string, generationId: string | null, parentGenerationId: string | null = null) {
  records.insert({ entityType: 'event', recordId: `evt:${id}`, userId: 'user_a', eventName, generationId, relations: { parentGenerationId, familyId: null }, payload: {} });
}

function addVerdict(generationId: string, verdict: 'positive' | 'negative') {
  records.insert({ entityType: 'feedback', recordId: `fb:${generationId}`, userId: 'user_a', generationId, payload: { verdict } });
}

const message = (id: string) => createTrainingSqsMessage({ recordId: `out:${id}`, entityType: 'output', idempotencyKey: `out:${id}:completed`, generationId: id, now });
const output = (id: string) => records.docs.find((doc) => doc.recordId === `out:${id}`)!;
const processed = () => [...store.objects.keys()].filter((key) => key.startsWith('processed/'));
const json = (key: string) => JSON.parse(textOf(store.objects.get(key)!.bytes));

beforeEach(() => {
  records = new FakeCollection([['entityType', 'recordId']]);
  jobs = new FakeCollection();
  consents = new FakeCollection();
  fingerprints = new FakeCollection([['dedupeKey'], ['dataset', 'contentHash']]);
  restores = [patchModel(TrainingDataRecord, records), patchModel(AIGenerationJob, jobs), patchModel(TrainingConsentRecord, consents), patchModel(TrainingContentFingerprint, fingerprints)];
  store = new MemoryTrainingObjectStore('prompt-studio-training-test');
  mediaObjects = new Map();
  deps = { store, media, pseudonymSecret: SECRET, now: () => now };
  setTrainingMetricSink(() => undefined);
});

afterEach(() => { for (const restore of restores) restore(); });

test('an eligible image output becomes a processed example with a copied, content-addressed asset', async () => {
  grantConsent();
  addGeneration('g1');
  addEvent('d1', 'output_downloaded', 'g1');
  addEvent('s1', 'output_saved', 'g1');
  const outcome = await processTrainingMessage(message('g1'), deps);
  assert.equal(outcome.status, 'processed');
  assert.equal(processed().length, 1);
  const envelope = json(processed()[0]);
  assert.equal(envelope.dataset, 'image-generation');
  assert.equal(envelope.schemaVersion, 2);
  assert.match(envelope.split.groupId, /^grp_[a-f0-9]{32}$/);
  assert.equal(envelope.quality.passes, true);
  assert.equal(envelope.quality.score, 0.65);
  assert.deepEqual(envelope.lineage.sourceRecordIds, ['out:g1']);
  const ref = envelope.example.outputs[0];
  assert.equal(ref.bucket, 'prompt-studio-training-test', 'outputs point at the private training bucket');
  assert.match(ref.key, /^assets\/images\/[a-f0-9]{64}\.png$/);
  assert.ok(store.objects.has(ref.key), 'asset copied');
  assert.equal(envelope.contentHash, envelope.example.exampleId);
  const serialized = JSON.stringify(envelope);
  assert.ok(!serialized.includes('user_a'), 'no user id in processed data');
  assert.ok(!serialized.includes('base64'), 'no inline binaries');
  assert.ok([...store.objects.keys()].some((key) => /^raw\/2026\/10\/03\/generations\/out-g1\/[a-f0-9]{64}\.json$/.test(key)), 'raw evidence written');
  assert.equal((output('g1').pipeline as Record<string, unknown>).status, 'processed');
  assert.equal((output('g1').eligibility as Record<string, unknown>).status, 'eligible');
});

test('the worker re-checks consent: a revoked user is skipped and earlier processed objects are removed', async () => {
  grantConsent();
  addGeneration('g1');
  await processTrainingMessage(message('g1'), deps);
  assert.equal(processed().length, 1);
  grantConsent('user_a', false, new Date('2026-10-03T11:00:00Z'));
  const outcome = await processTrainingMessage(message('g1'), deps);
  assert.deepEqual(outcome, { status: 'skipped', code: 'INELIGIBLE', processedKeys: [] });
  assert.equal(processed().length, 0);
  assert.equal((output('g1').eligibility as Record<string, unknown>).status, 'revoked');
});

test('a prompt containing a credential is rejected with metadata only', async () => {
  grantConsent();
  const secret = ['sk', '-proj-', 'abcdefghijklmnopqrstuvwxyz123456'].join('');
  addGeneration('g1', { prompt: `use my key ${secret} to draw a cat` });
  const outcome = await processTrainingMessage(message('g1'), deps);
  assert.equal(outcome.status, 'rejected');
  assert.equal(processed().length, 0);
  const rejectedKey = [...store.objects.keys()].find((key) => key.startsWith('rejected/2026/10/03/sanitization/out-g1'))!;
  const rejection = json(rejectedKey);
  assert.deepEqual(rejection.reasonCodes, ['secret_detected']);
  assert.ok(!JSON.stringify(rejection).includes(secret));
  assert.ok(![...store.objects.values()].some((object) => textOf(object.bytes).includes(secret)), 'secret never written anywhere');
});

test('PII in prompts is redacted before it reaches processed data', async () => {
  grantConsent();
  addGeneration('g1', { prompt: 'poster for ana@example.com, call +34 612 345 678' });
  await processTrainingMessage(message('g1'), deps);
  const envelope = json(processed()[0]);
  assert.equal(envelope.example.prompt, 'poster for [REDACTED_EMAIL], call [REDACTED_PHONE]');
  assert.deepEqual(envelope.sanitization.findings.map((finding: { kind: string }) => finding.kind).sort(), ['email', 'phone']);
});

test('reprocessing (retry, redelivery, new signal) converges on the same objects and is never a self-duplicate', async () => {
  grantConsent();
  addGeneration('g1');
  const first = await processTrainingMessage(message('g1'), deps);
  addEvent('d1', 'output_downloaded', 'g1');
  const second = await processTrainingMessage(message('g1'), deps);
  assert.equal(second.status, 'processed');
  assert.deepEqual(second.processedKeys, first.processedKeys);
  assert.equal(processed().length, 1);
  assert.equal(json(processed()[0]).quality.signals.downloaded, true, 'quality refreshed by the new signal');
  assert.equal(fingerprints.docs.length, 1);
});

test('identical content from a different source is a duplicate and is recorded in rejected/', async () => {
  grantConsent();
  addGeneration('g1', { bytesSeed: 'same' });
  addGeneration('g2', { bytesSeed: 'same' });
  await processTrainingMessage(message('g1'), deps);
  const outcome = await processTrainingMessage(message('g2'), deps);
  assert.equal(outcome.status, 'duplicate');
  assert.equal(processed().length, 1);
  assert.ok([...store.objects.keys()].some((key) => key.startsWith('rejected/2026/10/03/duplicate/out-g2')));
});

test('prompt optimizer jobs produce prompt-enhancement pairs (intent -> improved prompt)', async () => {
  grantConsent();
  addGeneration('t1', { kind: 'text', prompt: 'logo café', operationCode: 'prompt-optimizer.basic', input: { optimizerTier: 'basic' }, result: { text: 'Minimal vector logo for a specialty café, warm palette, flat style' } });
  addVerdict('t1', 'positive');
  await processTrainingMessage(message('t1'), deps);
  const envelope = json(processed().find((key) => key.startsWith('processed/prompt-enhancement/'))!);
  assert.equal(envelope.example.originalIntent, 'logo café');
  assert.equal(envelope.example.improvedPrompt, 'Minimal vector logo for a specialty café, warm palette, flat style');
});

test('editing a prompt yields a prompt-enhancement pair from the parent prompt to the final one', async () => {
  grantConsent();
  addGeneration('p1', { prompt: 'cat' });
  addGeneration('c1', { prompt: 'a ginger cat sleeping on a windowsill, soft morning light', parent: 'p1', family: 'p1' });
  addEvent('e1', 'prompt_edited', null, 'p1');
  addEvent('d1', 'output_downloaded', 'c1');
  await processTrainingMessage(message('c1'), deps);
  const pair = json(processed().find((key) => key.startsWith('processed/prompt-enhancement/'))!);
  assert.equal(pair.example.originalIntent, 'cat');
  assert.equal(pair.example.improvedPrompt, 'a ginger cat sleeping on a windowsill, soft morning light');
  assert.deepEqual(pair.lineage.sourceRecordIds, ['out:c1', 'out:p1']);
});

test('preference pairs need evidence: regenerate away from one output, save the next', async () => {
  grantConsent();
  addGeneration('a1');
  addGeneration('a2', { parent: 'a1', family: 'a1' });
  // No evidence yet: no pair.
  await processTrainingMessage(message('a2'), deps);
  assert.equal(processed().filter((key) => key.includes('/preference/')).length, 0);
  addEvent('r1', 'regenerate_clicked', 'a1');
  addEvent('s1', 'output_saved', 'a2');
  await processTrainingMessage(message('a2'), deps);
  const preference = processed().filter((key) => key.includes('/preference/'));
  assert.equal(preference.length, 1);
  const example = json(preference[0]).example;
  assert.equal(example.signal.type, 'saved_after_regenerate');
  assert.equal(example.chosen.outputId, 'a2');
  assert.equal(example.rejected.outputId, 'a1');
  assert.match(example.chosen.contentRef, /^assets\/images\//);
  // The image dataset example of a2 carries the selected signal.
  const image = json(processed().find((key) => key.includes('/image-generation/'))!);
  assert.equal(image.quality.signals.selected, true);
});

test('a leased record is busy, not an error; a missing source job is permanent', async () => {
  grantConsent();
  addGeneration('g1');
  output('g1').pipeline = { status: 'processing', leaseExpiresAt: new Date('2026-10-03T12:03:00Z'), processedKeys: [] };
  assert.equal((await processTrainingMessage(message('g1'), deps)).status, 'busy');
  output('g1').pipeline = { status: 'queued', processedKeys: [] };
  jobs.docs = [];
  await assert.rejects(processTrainingMessage(message('g1'), deps), (error: unknown) => error instanceof PermanentProcessingError && error.code === 'SOURCE_JOB_MISSING');
  assert.equal((output('g1').pipeline as Record<string, unknown>).status, 'failed');
});

test('non-output records (behavioural events) are acknowledged without processing', async () => {
  const outcome = await processTrainingMessage(createTrainingSqsMessage({ recordId: 'evt:x', entityType: 'event', idempotencyKey: 'evt:x', now }), deps);
  assert.equal(outcome.code, 'NOT_A_PROCESSING_UNIT');
});

test('queue handling: malformed and permanent messages are deleted, transient ones are left for redelivery', async () => {
  const deleted: string[] = [];
  const sqs = { deleteMessage: async (_url: string, handle: string) => { deleted.push(handle); return {}; }, changeMessageVisibility: async () => ({}) };
  const run = (body: string, handle: string, overrides: Partial<ProcessDeps> = {}) =>
    handleTrainingQueueMessage({ message: { MessageId: handle, ReceiptHandle: handle, Body: body }, queueUrl: 'q', sqs, deps: { ...deps, ...overrides } });

  assert.equal(await run('{not json', 'h1'), 'deleted');
  assert.equal(await run(JSON.stringify({ schemaVersion: 2, action: 'process-record', recordId: 'r', entityType: 'output', prompt: 'x' }), 'h2'), 'deleted');

  grantConsent();
  addGeneration('g1');
  jobs.docs = [];
  assert.equal(await run(JSON.stringify(message('g1')), 'h3'), 'deleted', 'permanent failure acknowledged');

  addGeneration('g2');
  const brokenStore = new MemoryTrainingObjectStore();
  brokenStore.put = async () => { throw new Error('R2 unavailable'); };
  assert.equal(await run(JSON.stringify(message('g2')), 'h4', { store: brokenStore }), 'retry');
  assert.deepEqual(deleted, ['h1', 'h2', 'h3']);
  assert.equal((output('g2').pipeline as Record<string, unknown>).status, 'queued', 'lease released for the retry');
});

test('fingerprint claims recognise their own source after a crash between claim and write', async () => {
  const { claimTrainingFingerprint } = await import('../../src/lib/training-dedupe-service');
  const contentHash = 'f'.repeat(64);
  const first = await claimTrainingFingerprint({ dataset: 'preference', sourceKey: 'k1', contentHash });
  const retry = await claimTrainingFingerprint({ dataset: 'preference', sourceKey: 'k1', contentHash });
  const other = await claimTrainingFingerprint({ dataset: 'preference', sourceKey: 'k2', contentHash });
  assert.equal(first.duplicate, false);
  assert.equal(retry.duplicate, false, 'the same source is never its own duplicate');
  assert.equal(other.duplicate, true);
  assert.deepEqual(fingerprints.docs[0].duplicateRecordIds, ['k2']);
});
