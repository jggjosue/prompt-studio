import 'server-only';
import { randomUUID } from 'node:crypto';
import {
  assetKey,
  processedKey,
  rawEvidenceKey,
  rejectedKey,
  type DatasetName,
} from '@/lib/dataset-object-contract';
import { buildGenerationDatasetExample, type GenerationAssetRef, type GenerationDatasetModality } from '@/lib/datasets/generation';
import { buildPreferenceExample, type PreferenceCandidate } from '@/lib/datasets/preference';
import { buildPromptEnhancementExample } from '@/lib/datasets/prompt-enhancement';
import { resolveAuthoritativeTrainingConsent } from '@/lib/training-consent';
import type { TrainingAssetReference, TrainingEntityType } from '@/lib/training-data-contract';
import { TRAINING_CANONICALIZATION_VERSION, canonicalTrainingJson } from '@/lib/training-dedupe';
import { claimTrainingFingerprint } from '@/lib/training-dedupe-service';
import { TRAINING_QUALITY_VERSION, calculateTrainingQuality, type TrainingQualityResult } from '@/lib/training-quality';
import { TRAINING_SANITIZER_VERSION, sanitizeTrainingValue, type SanitizerFinding } from '@/lib/training-sanitizer';
import type { TrainingSqsMessage } from '@/lib/training-sqs-contract';
import { trainingAssetsFromJobResult } from '@/lib/training/capture';
import type { MediaAssetSource } from '@/lib/training/media-source';
import { normalizeTrainingModality } from '@/lib/training/modalities';
import { sha256Hex, type TrainingObjectStore } from '@/lib/training/object-store';
import {
  isPromptOptimizerJob,
  isSelectedAfterRegenerate,
  outputSignals,
  preferencePairs,
  qualitySignals,
  resultHtml,
  resultText,
  type FamilyMember,
  type OutputSignals,
  type SignalEvent,
} from '@/lib/training/processing-rules';
import { splitGroupIdForUser } from '@/lib/training/pseudonym';
import { outputRecordId } from '@/lib/training/record-ids';
import { emitTrainingMetric, metricReason } from '@/lib/training/training-metrics';
import { PROCESSED_EXAMPLE_SCHEMA_VERSION, SPLIT_GROUP_VERSION, TRAINING_PIPELINE_VERSION } from '@/lib/training/versions';
import AIGenerationJob from '@/models/AIGenerationJob';
import TrainingDataRecord from '@/models/TrainingDataRecord';

/**
 * Dataset worker: turns one eligible output record into processed examples.
 *
 *   lease → consent/eligibility (authoritative) → load sources → build
 *   candidates → sanitize → validate → copy assets → dedupe → quality →
 *   write processed/ → raw evidence → re-check revocation → record state
 *
 * Idempotency: the record lease prevents concurrent processing; processed
 * keys are derived from the logical example, assets and raw evidence are
 * content-addressed, and fingerprint claims recognise their own source. A
 * redelivered or retried message converges on the same objects.
 */

export type ProcessOutcome =
  | { status: 'processed' | 'skipped' | 'rejected' | 'duplicate'; code: string | null; processedKeys: string[] }
  /** Another worker holds the lease; leave the message for redelivery. */
  | { status: 'busy'; code: 'RECORD_LEASED'; processedKeys: [] };

export class PermanentProcessingError extends Error {
  readonly permanent = true;
  constructor(public readonly code: string) {
    super(code);
  }
}

export type ProcessDeps = {
  store: TrainingObjectStore;
  media: MediaAssetSource;
  pseudonymSecret: string;
  now?: () => Date;
  leaseMs?: number;
  env?: NodeJS.ProcessEnv;
};

const LIMITS = { prompt: 20_000, text: 20_000, html: 2 * 1024 * 1024, image: 40 * 1024 * 1024, video: 250 * 1024 * 1024 };
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
};

type LeanRecord = {
  recordId: string;
  entityType: TrainingEntityType;
  userId: string;
  sessionId: string | null;
  generationId?: string | null;
  modality: string | null;
  model: { provider: string; model: string | null; version: string | null } | null;
  parameters: Record<string, unknown>;
  consent: { training: boolean; version: string; capturedAt: Date };
  eligibility: { status: string };
  provenance: { correlationId: string | null };
  assets: TrainingAssetReference[];
  relations?: { parentGenerationId: string | null; familyId: string | null } | null;
  pipeline?: { processedKeys?: string[]; leaseToken?: string | null } | null;
  occurredAt: Date;
};

type LeanJob = {
  _id: unknown;
  userId: string;
  kind: string;
  operationCode?: string | null;
  input?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  status: string;
};

type Candidate = {
  dataset: DatasetName;
  /** Stable identity of the logical example; decides its processed key. */
  sourceKey: string;
  sourceRecordIds: string[];
  generationIds: string[];
  content: Record<string, unknown>;
  quality: TrainingQualityResult;
  /** Builds the dataset example from the sanitized content and copied assets. */
  build: (content: Record<string, unknown>) => Promise<{ example: Record<string, unknown> & { exampleId: string } } | { rejectCode: string }>;
};

type Rejection = { type: 'sanitization' | 'validation' | 'duplicate'; dataset: DatasetName; reasonCodes: string[]; findings: SanitizerFinding[] };

const exampleKeyFor = (dataset: DatasetName, sourceKey: string) => sha256Hex(`${dataset}\u0000${sourceKey}`).slice(0, 40);

function generationDatasetFor(modality: string | null): { dataset: DatasetName; modality: GenerationDatasetModality } | null {
  switch (normalizeTrainingModality(modality)) {
    case 'image': return { dataset: 'image-generation', modality: 'image' };
    case 'video': return { dataset: 'video-generation', modality: 'video' };
    case 'web': return { dataset: 'web-generation', modality: 'web' };
    default: return null;
  }
}

async function loadSignals(generationIds: string[]) {
  const events = await TrainingDataRecord.find({
    entityType: 'event',
    $or: [{ generationId: { $in: generationIds } }, { 'relations.parentGenerationId': { $in: generationIds } }],
  }).select('eventName generationId relations').lean<Array<{ eventName?: string | null; generationId?: string | null; relations?: { parentGenerationId?: string | null } | null }>>();
  const feedback = await TrainingDataRecord.find({ entityType: 'feedback', generationId: { $in: generationIds } })
    .select('generationId payload').lean<Array<{ generationId?: string | null; payload?: { verdict?: string } }>>();
  const signalEvents: SignalEvent[] = events.map((event) => ({
    eventName: event.eventName ?? null,
    generationId: event.generationId ?? null,
    parentGenerationId: event.relations?.parentGenerationId ?? null,
  }));
  const verdicts = new Map(feedback.map((item) => [item.generationId ?? '', item.payload?.verdict === 'positive' ? 'positive' as const : item.payload?.verdict === 'negative' ? 'negative' as const : null]));
  return (generationId: string): OutputSignals => outputSignals(generationId, signalEvents, verdicts.get(generationId) ?? null);
}

export async function processTrainingMessage(message: TrainingSqsMessage, deps: ProcessDeps): Promise<ProcessOutcome> {
  const now = deps.now ?? (() => new Date());
  const started = Date.now();
  if (message.entityType !== 'output') {
    emitTrainingMetric('training_records_skipped_total', 1, { entity_type: message.entityType, reason: 'not_a_processing_unit' });
    return { status: 'skipped', code: 'NOT_A_PROCESSING_UNIT', processedKeys: [] };
  }

  // 1. Lease the record (one worker at a time; expired leases can be taken over).
  const leaseToken = randomUUID();
  const leaseUntil = new Date(now().getTime() + (deps.leaseMs ?? 5 * 60_000));
  const record = await TrainingDataRecord.findOneAndUpdate(
    {
      entityType: message.entityType,
      recordId: message.recordId,
      $or: [{ 'pipeline.status': { $ne: 'processing' } }, { 'pipeline.leaseExpiresAt': { $lt: now() } }],
    },
    { $set: { 'pipeline.status': 'processing', 'pipeline.leaseToken': leaseToken, 'pipeline.leaseExpiresAt': leaseUntil }, $inc: { 'pipeline.attempts': 1 } },
    { new: true },
  ).lean<LeanRecord>();
  if (!record) {
    const exists = await TrainingDataRecord.exists({ entityType: message.entityType, recordId: message.recordId });
    if (!exists) {
      emitTrainingMetric('training_records_skipped_total', 1, { entity_type: 'output', reason: 'record_not_found' });
      return { status: 'skipped', code: 'RECORD_NOT_FOUND', processedKeys: [] };
    }
    return { status: 'busy', code: 'RECORD_LEASED', processedKeys: [] };
  }
  const previousKeys = record.pipeline?.processedKeys ?? [];
  const finish = async (status: 'processed' | 'skipped' | 'rejected' | 'duplicate' | 'failed', code: string | null, keys: string[], extra: Record<string, unknown> = {}) => {
    await TrainingDataRecord.updateOne(
      { entityType: record.entityType, recordId: record.recordId, 'pipeline.leaseToken': leaseToken },
      { $set: { 'pipeline.status': status, 'pipeline.lastCode': code, 'pipeline.processedKeys': keys, 'pipeline.processedAt': now(), 'pipeline.leaseToken': null, 'pipeline.leaseExpiresAt': null, updatedAt: now(), ...extra } },
    );
    emitTrainingMetric('training_processing_latency_ms', Date.now() - started, { entity_type: 'output' });
  };
  const removeKeys = async (keys: string[]) => {
    for (const key of keys) await deps.store.delete(key).catch(() => undefined);
  };

  try {
    // 2. Consent: record snapshot AND authoritative state now. Never trust only the capture time.
    const authoritative = await resolveAuthoritativeTrainingConsent(record.userId);
    if (!record.consent?.training || !['pending', 'eligible'].includes(record.eligibility?.status) || !authoritative.training) {
      const status = authoritative.training || !record.consent?.training ? 'ineligible' : 'revoked';
      await removeKeys(previousKeys);
      await finish('skipped', 'INELIGIBLE', [], {
        eligibility: { status, reasonCodes: [authoritative.training ? 'record_not_eligible' : 'training_consent_missing_or_revoked'], evaluatedAt: now(), evaluatorVersion: 'worker-eligibility-v1' },
      });
      emitTrainingMetric('training_records_skipped_total', 1, { entity_type: 'output', stage: 'eligibility', reason: 'ineligible' });
      return { status: 'skipped', code: 'INELIGIBLE', processedKeys: [] };
    }

    // 3. Sources (operational data, read only after consent passed).
    const generationId = record.generationId ?? message.generationId ?? null;
    if (!generationId) throw new PermanentProcessingError('GENERATION_ID_MISSING');
    const job = await AIGenerationJob.findOne({ _id: generationId, userId: record.userId })
      .select('userId kind operationCode input result status').lean<LeanJob>();
    if (!job || job.status !== 'completed') throw new PermanentProcessingError('SOURCE_JOB_MISSING');
    const prompt = typeof job.input?.prompt === 'string' ? job.input.prompt.trim() : '';

    const familyId = record.relations?.familyId ?? generationId;
    const familyOutputs = await TrainingDataRecord.find({ entityType: 'output', 'relations.familyId': familyId, userId: record.userId })
      .select('recordId generationId relations eligibility consent model assets modality').lean<LeanRecord[]>();
    const familyGenerationIds = [...new Set([generationId, ...familyOutputs.map((item) => item.generationId).filter((id): id is string => Boolean(id))])];
    const signalsFor = await loadSignals(familyGenerationIds);
    const family: FamilyMember[] = familyGenerationIds.map((id) => ({
      generationId: id,
      parentGenerationId: id === generationId ? record.relations?.parentGenerationId ?? null : familyOutputs.find((item) => item.generationId === id)?.relations?.parentGenerationId ?? null,
      signals: signalsFor(id),
    }));
    const self = family.find((member) => member.generationId === generationId)!;
    const selfQualitySignals = qualitySignals(self.signals, isSelectedAfterRegenerate(self, family));
    const splitGroupId = splitGroupIdForUser(record.userId, deps.pseudonymSecret);
    const occurredAt = new Date(record.occurredAt).toISOString();

    // 4. Candidate examples supported by this output.
    const candidates: Candidate[] = [];
    const generation = generationDatasetFor(record.modality);
    if (generation && prompt) {
      const quality = calculateTrainingQuality(generation.dataset, selfQualitySignals, deps.env);
      candidates.push({
        dataset: generation.dataset,
        sourceKey: record.recordId,
        sourceRecordIds: [record.recordId],
        generationIds: [generationId],
        content: generation.modality === 'web' ? { prompt, html: resultHtml(job.result) } : { prompt },
        quality,
        build: async (content) => {
          const outputs = await copyOutputs(generation.modality, record, job, content, deps);
          if ('rejectCode' in outputs) return outputs;
          const example = buildGenerationDatasetExample({
            modality: generation.modality,
            recordId: record.recordId,
            requestId: generationId,
            outputId: generationId,
            occurredAt,
            payload: { prompt: content.prompt },
            model: record.model,
            parameters: record.parameters ?? {},
            assets: outputs.refs,
            quality,
          }, { applyQualityGate: false });
          return example ? { example } : { rejectCode: 'INVALID_GENERATION_EXAMPLE' };
        },
      });
    }
    if (isPromptOptimizerJob(job) && prompt) {
      const improved = resultText(job.result);
      const quality = calculateTrainingQuality('prompt-enhancement', selfQualitySignals, deps.env);
      candidates.push({
        dataset: 'prompt-enhancement',
        sourceKey: `optimizer:${record.recordId}`,
        sourceRecordIds: [record.recordId],
        generationIds: [generationId],
        content: { originalIntent: prompt, improvedPrompt: improved },
        quality,
        build: async (content) => {
          const example = buildPromptEnhancementExample({
            recordId: record.recordId, requestId: generationId, outputId: generationId, modality: 'text', occurredAt,
            payload: { originalIntent: content.originalIntent, improvedPrompt: content.improvedPrompt }, quality,
          }, { applyQualityGate: false });
          return example ? { example } : { rejectCode: 'INVALID_PROMPT_ENHANCEMENT_PAIR' };
        },
      });
    }
    const parentGenerationId = record.relations?.parentGenerationId ?? null;
    if (parentGenerationId && prompt) {
      const parentJob = await AIGenerationJob.findOne({ _id: parentGenerationId, userId: record.userId }).select('input').lean<LeanJob>();
      const parentPrompt = typeof parentJob?.input?.prompt === 'string' ? parentJob.input.prompt.trim() : '';
      if (parentPrompt && parentPrompt !== prompt) {
        const quality = calculateTrainingQuality('prompt-enhancement', selfQualitySignals, deps.env);
        candidates.push({
          dataset: 'prompt-enhancement',
          sourceKey: `edit:${parentGenerationId}:${generationId}`,
          sourceRecordIds: [outputRecordId(parentGenerationId), record.recordId],
          generationIds: [parentGenerationId, generationId],
          content: { originalIntent: parentPrompt, improvedPrompt: prompt },
          quality,
          build: async (content) => {
            const example = buildPromptEnhancementExample({
              recordId: record.recordId, requestId: generationId, outputId: generationId,
              modality: normalizeTrainingModality(record.modality), occurredAt,
              payload: { originalIntent: content.originalIntent, improvedPrompt: content.improvedPrompt }, quality,
            }, { applyQualityGate: false });
            if (example) example.provenance.sourceRecordIds = [outputRecordId(parentGenerationId), record.recordId].sort();
            return example ? { example } : { rejectCode: 'INVALID_PROMPT_ENHANCEMENT_PAIR' };
          },
        });
      }
    }
    for (const pair of preferencePairs(family)) {
      if (pair.chosen !== generationId && pair.rejected !== generationId) continue;
      const members = [pair.chosen, pair.rejected];
      const memberRecords = members.map((id) => (id === generationId ? record : familyOutputs.find((item) => item.generationId === id)));
      // Both sides must be eligible outputs of the same consenting user.
      if (memberRecords.some((item) => !item || !item.consent?.training || !['pending', 'eligible'].includes(item.eligibility?.status))) continue;
      const jobs = await AIGenerationJob.find({ _id: { $in: members }, userId: record.userId }).select('kind input result status').lean<LeanJob[]>();
      const jobById = new Map(jobs.map((item) => [String(item._id), item]));
      const chosenJob = jobById.get(pair.chosen);
      const rejectedJob = jobById.get(pair.rejected);
      if (!chosenJob || !rejectedJob) continue;
      const rootPrompt = typeof chosenJob.input?.prompt === 'string' ? chosenJob.input.prompt.trim() : prompt;
      const quality = calculateTrainingQuality('preference', qualitySignals(signalsFor(pair.chosen), true), deps.env);
      const textual = normalizeTrainingModality(record.modality) === 'text';
      candidates.push({
        dataset: 'preference',
        sourceKey: `preference:${pair.chosen}:${pair.rejected}`,
        sourceRecordIds: members.map(outputRecordId).sort(),
        generationIds: members,
        content: textual
          ? { context: rootPrompt, chosenText: resultText(chosenJob.result), rejectedText: resultText(rejectedJob.result) }
          : { context: rootPrompt },
        quality,
        build: async (content) => {
          const candidateFor = async (id: string, job: LeanJob, text: unknown): Promise<PreferenceCandidate | { rejectCode: string }> => {
            const member = memberRecords[members.indexOf(id)]!;
            if (textual) return { outputId: id, contentRef: null, modelId: member.model?.model ?? null, content: String(text ?? ''), contentHash: sha256Hex(String(text ?? '')) };
            const media = generationDatasetFor(member.modality);
            if (!media) return { rejectCode: 'UNSUPPORTED_PREFERENCE_MODALITY' };
            const copied = await copyOutputs(media.modality, member, job, {}, deps);
            if ('rejectCode' in copied) return copied;
            return { outputId: id, contentRef: copied.refs[0].key, modelId: member.model?.model ?? null, content: null, contentHash: copied.refs[0].contentHash };
          };
          const chosen = await candidateFor(pair.chosen, chosenJob, content.chosenText);
          if ('rejectCode' in chosen) return chosen;
          const rejected = await candidateFor(pair.rejected, rejectedJob, content.rejectedText);
          if ('rejectCode' in rejected) return rejected;
          const example = buildPreferenceExample({
            requestId: familyId, context: String(content.context ?? ''), chosen, rejected, signalType: pair.signalType,
            eventIds: members.map((id) => `signals:${id}`), sourceRecordIds: members.map(outputRecordId), occurredAt,
          });
          return example ? { example } : { rejectCode: 'INVALID_PREFERENCE_PAIR' };
        },
      });
    }

    // 5-9. Per candidate: sanitize, validate, build (copies assets), dedupe, write.
    const produced: Array<{ dataset: DatasetName; key: string; contentHash: string; passes: boolean }> = [];
    const rejections: Rejection[] = [];
    let duplicates = 0;
    for (const candidate of candidates) {
      const sanitized = sanitizeTrainingValue(candidate.content, { maxBytes: LIMITS.html + 64 * 1024 });
      if (!sanitized.accepted) {
        rejections.push({ type: 'sanitization', dataset: candidate.dataset, reasonCodes: sanitized.reasonCodes, findings: sanitized.findings });
        emitTrainingMetric('training_records_rejected_total', 1, { dataset: candidate.dataset, stage: 'sanitize', reason: metricReason(sanitized.reasonCodes[0]) });
        continue;
      }
      const content = sanitized.value as Record<string, unknown>;
      const invalid = validateContent(candidate.dataset, content);
      if (invalid) {
        rejections.push({ type: 'validation', dataset: candidate.dataset, reasonCodes: [invalid], findings: [] });
        emitTrainingMetric('training_records_rejected_total', 1, { dataset: candidate.dataset, stage: 'validate', reason: metricReason(invalid) });
        continue;
      }
      const built = await candidate.build(content);
      if ('rejectCode' in built) {
        rejections.push({ type: 'validation', dataset: candidate.dataset, reasonCodes: [built.rejectCode], findings: [] });
        emitTrainingMetric('training_records_rejected_total', 1, { dataset: candidate.dataset, stage: 'validate', reason: metricReason(built.rejectCode) });
        continue;
      }
      // The example id is a canonical-v1 hash of training content only (no ids or timestamps).
      const contentHash = built.example.exampleId;
      const exampleKey = exampleKeyFor(candidate.dataset, candidate.sourceKey);
      const claim = await claimTrainingFingerprint({ dataset: candidate.dataset, sourceKey: exampleKey, contentHash });
      if (claim.duplicate) {
        duplicates += 1;
        rejections.push({ type: 'duplicate', dataset: candidate.dataset, reasonCodes: ['duplicate_content'], findings: [] });
        emitTrainingMetric('training_records_duplicate_total', 1, { dataset: candidate.dataset });
        continue;
      }
      if (!candidate.quality.passes) emitTrainingMetric('training_quality_rejected_total', 1, { dataset: candidate.dataset });
      const key = processedKey({ dataset: candidate.dataset, pipelineVersion: TRAINING_PIPELINE_VERSION, exampleKey });
      const envelope = {
        schemaVersion: PROCESSED_EXAMPLE_SCHEMA_VERSION,
        dataset: candidate.dataset,
        exampleKey,
        contentHash,
        versions: {
          pipeline: TRAINING_PIPELINE_VERSION,
          sanitizer: TRAINING_SANITIZER_VERSION,
          canonicalization: TRAINING_CANONICALIZATION_VERSION,
          quality: TRAINING_QUALITY_VERSION,
          splitGroup: SPLIT_GROUP_VERSION,
          datasetSchema: (built.example as { schemaVersion?: number }).schemaVersion ?? 1,
        },
        quality: candidate.quality,
        split: { groupId: splitGroupId, strategy: 'user' as const },
        lineage: {
          sourceRecordIds: [...new Set(candidate.sourceRecordIds)].sort(),
          generationIds: [...new Set(candidate.generationIds)].sort(),
          correlationId: record.provenance?.correlationId ?? null,
          occurredAt,
          processedAt: now().toISOString(),
        },
        // Kinds and paths only; never the matched values.
        sanitization: { findings: sanitized.findings },
        example: built.example,
      };
      await deps.store.put(key, JSON.stringify(envelope), {
        contentType: 'application/json',
        metadata: { dataset: candidate.dataset, pipelineVersion: TRAINING_PIPELINE_VERSION, contentHash, qualityScore: String(candidate.quality.score) },
      });
      produced.push({ dataset: candidate.dataset, key, contentHash, passes: candidate.quality.passes });
      emitTrainingMetric('training_examples_written_total', 1, { dataset: candidate.dataset });
    }

    // Rejected objects: metadata only, one per record and rejection type.
    for (const type of ['sanitization', 'validation', 'duplicate'] as const) {
      const items = rejections.filter((item) => item.type === type);
      if (!items.length) continue;
      await deps.store.put(rejectedKey({ date: now(), type, recordId: record.recordId }), JSON.stringify({
        schemaVersion: 1,
        recordId: record.recordId,
        entityType: record.entityType,
        type,
        datasets: [...new Set(items.map((item) => item.dataset))].sort(),
        reasonCodes: [...new Set(items.flatMap((item) => item.reasonCodes))].sort(),
        findings: items.flatMap((item) => item.findings.map(({ kind, path, action }) => ({ kind, path, action }))),
        sanitizerVersion: TRAINING_SANITIZER_VERSION,
        rejectedAt: now().toISOString(),
      }), { contentType: 'application/json', metadata: { rejected: 'true' } });
    }

    // Raw evidence of this decision (ids, versions and hashes; no content), content-addressed and immutable.
    const evidence = {
      schemaVersion: 1,
      recordId: record.recordId,
      entityType: record.entityType,
      splitGroupId,
      consentVersion: authoritative.version,
      eligibility: 'eligible',
      signals: self.signals,
      produced,
      rejected: rejections.map((item) => ({ type: item.type, dataset: item.dataset, reasonCodes: item.reasonCodes })),
      versions: { pipeline: TRAINING_PIPELINE_VERSION, sanitizer: TRAINING_SANITIZER_VERSION, quality: TRAINING_QUALITY_VERSION },
      processedAt: now().toISOString(),
    };
    const evidenceJson = canonicalTrainingJson(evidence);
    await deps.store.put(rawEvidenceKey({ date: now(), kind: 'generations', recordId: record.recordId, evidenceHash: sha256Hex(evidenceJson) }), evidenceJson, {
      contentType: 'application/json', ifNoneMatch: true,
    });

    const keys = produced.map((item) => item.key);
    await removeKeys(previousKeys.filter((key) => !keys.includes(key)));

    // Consent may have been revoked while we were working: undo our writes if so.
    const latest = await resolveAuthoritativeTrainingConsent(record.userId);
    const current = await TrainingDataRecord.findOne({ entityType: record.entityType, recordId: record.recordId }).select('eligibility').lean<{ eligibility: { status: string } }>();
    if (!latest.training || current?.eligibility?.status === 'revoked') {
      await removeKeys(keys);
      await finish('skipped', 'REVOKED_DURING_PROCESSING', [], {
        eligibility: { status: 'revoked', reasonCodes: ['training_consent_revoked'], evaluatedAt: now(), evaluatorVersion: 'worker-eligibility-v1' },
      });
      return { status: 'skipped', code: 'REVOKED_DURING_PROCESSING', processedKeys: [] };
    }

    const status = produced.length ? 'processed' : duplicates && duplicates === rejections.length ? 'duplicate' : rejections.length ? 'rejected' : 'skipped';
    const code = produced.length ? null : rejections[0]?.reasonCodes[0] ?? (candidates.length ? null : 'NO_DATASET_FOR_OUTPUT');
    await finish(status, code, keys, {
      eligibility: { status: 'eligible', reasonCodes: [], evaluatedAt: now(), evaluatorVersion: 'worker-eligibility-v1' },
    });
    emitTrainingMetric(
      status === 'processed' ? 'training_records_processed_total' : status === 'skipped' ? 'training_records_skipped_total' : status === 'duplicate' ? 'training_records_duplicate_total' : 'training_records_rejected_total',
      1,
      { entity_type: 'output' },
    );
    return { status, code, processedKeys: keys };
  } catch (error) {
    if (error instanceof PermanentProcessingError) {
      await finish('failed', error.code, previousKeys);
      emitTrainingMetric('training_records_failed_total', 1, { entity_type: 'output', reason: metricReason(error.code) });
      throw error;
    }
    // Transient: release the lease so a redelivery can retry immediately.
    await TrainingDataRecord.updateOne(
      { entityType: record.entityType, recordId: record.recordId, 'pipeline.leaseToken': leaseToken },
      { $set: { 'pipeline.status': 'queued', 'pipeline.leaseToken': null, 'pipeline.leaseExpiresAt': null, 'pipeline.lastCode': `TRANSIENT:${error instanceof Error ? error.name : 'Error'}` } },
    ).catch(() => undefined);
    throw error;
  }
}

function validateContent(dataset: DatasetName, content: Record<string, unknown>): string | null {
  const text = (key: string) => (typeof content[key] === 'string' ? (content[key] as string) : '');
  switch (dataset) {
    case 'image-generation':
    case 'video-generation':
      return !text('prompt') ? 'EMPTY_PROMPT' : text('prompt').length > LIMITS.prompt ? 'PROMPT_TOO_LONG' : null;
    case 'web-generation':
      if (!text('prompt')) return 'EMPTY_PROMPT';
      if (!text('html')) return 'NO_HTML_OUTPUT';
      return new TextEncoder().encode(text('html')).byteLength > LIMITS.html ? 'HTML_TOO_LARGE' : null;
    case 'prompt-enhancement':
      if (!text('originalIntent') || !text('improvedPrompt')) return 'EMPTY_PROMPT_PAIR';
      if (text('originalIntent').trim() === text('improvedPrompt').trim()) return 'UNCHANGED_PROMPT';
      return text('originalIntent').length > LIMITS.prompt || text('improvedPrompt').length > LIMITS.text ? 'PROMPT_TOO_LONG' : null;
    case 'preference':
      if (!text('context')) return 'EMPTY_CONTEXT';
      if ('chosenText' in content && (!text('chosenText') || !text('rejectedText'))) return 'EMPTY_PREFERENCE_TEXT';
      return null;
    default:
      return 'UNKNOWN_DATASET';
  }
}

/**
 * Copies the output artifacts into the training bucket under content-addressed
 * keys and returns references. Never inlines bytes. Web pages are stored from
 * the sanitized HTML, so secrets in generated markup never reach the bucket.
 */
async function copyOutputs(
  modality: GenerationDatasetModality,
  record: Pick<LeanRecord, 'assets'>,
  job: LeanJob,
  sanitizedContent: Record<string, unknown>,
  deps: ProcessDeps,
): Promise<{ refs: GenerationAssetRef[] } | { rejectCode: string }> {
  const put = async (kind: 'images' | 'videos' | 'web', bytes: Uint8Array, contentType: string): Promise<GenerationAssetRef> => {
    const contentHash = sha256Hex(bytes);
    const key = assetKey({ kind, contentHash, extension: kind === 'web' ? 'html' : EXTENSIONS[contentType] ?? 'bin' });
    await deps.store.put(key, bytes, { contentType, ifNoneMatch: true });
    return { provider: 'cloudflare-r2', bucket: deps.store.bucket, key, contentType, contentHash, bytes: bytes.byteLength };
  };

  if (modality === 'web') {
    const html = typeof sanitizedContent.html === 'string' ? sanitizedContent.html : '';
    if (!html) {
      // Called for a preference candidate: sanitize the page now.
      const sanitized = sanitizeTrainingValue({ html: resultHtml(job.result) }, { maxBytes: LIMITS.html + 64 * 1024 });
      if (!sanitized.accepted) return { rejectCode: 'ARTIFACT_FAILED_SANITIZATION' };
      const clean = (sanitized.value as { html: string }).html;
      if (!clean) return { rejectCode: 'NO_HTML_OUTPUT' };
      return { refs: [await put('web', new TextEncoder().encode(clean), 'text/html')] };
    }
    return { refs: [await put('web', new TextEncoder().encode(html), 'text/html')] };
  }

  const references = record.assets?.length ? record.assets : trainingAssetsFromJobResult(job.result);
  const wanted = modality === 'image' ? /^image\// : /^video\//;
  const refs: GenerationAssetRef[] = [];
  for (const reference of references) {
    if (reference.contentType && !wanted.test(reference.contentType)) continue;
    const bytes = await deps.media.readR2(reference);
    if (!bytes) return { rejectCode: 'ASSET_UNAVAILABLE' };
    if (reference.contentHash && /^[a-f0-9]{64}$/.test(reference.contentHash) && reference.contentHash !== sha256Hex(bytes)) {
      return { rejectCode: 'ASSET_HASH_MISMATCH' };
    }
    if (bytes.byteLength > (modality === 'image' ? LIMITS.image : LIMITS.video)) return { rejectCode: 'ASSET_TOO_LARGE' };
    const contentType = reference.contentType ?? (modality === 'image' ? 'image/png' : 'video/mp4');
    refs.push(await put(modality === 'image' ? 'images' : 'videos', bytes, contentType));
  }
  if (!refs.length && modality === 'video') {
    const url = typeof job.result?.videoUrl === 'string' ? job.result.videoUrl : '';
    if (url.startsWith('https://')) {
      const remote = await deps.media.fetchRemote(url, LIMITS.video);
      if (remote) {
        const contentType = remote.contentType?.split(';')[0].trim() || 'video/mp4';
        if (wanted.test(contentType)) refs.push(await put('videos', remote.bytes, contentType));
      }
    }
  }
  return refs.length ? { refs } : { rejectCode: 'NO_OUTPUT_ASSET' };
}
