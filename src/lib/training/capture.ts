import 'server-only';
import { after } from 'next/server';
import { getAIModelConfig } from '@/lib/ai-credit-config';
import connectToDatabase from '@/lib/mongoose';
import { getR2BucketName } from '@/lib/r2-storage';
import { resolveAuthoritativeTrainingConsent, trainingEligibilityFromConsent } from '@/lib/training-consent';
import {
  TRAINING_DATA_SCHEMA_VERSION,
  type TrainingAssetReference,
  type TrainingConsentSnapshot,
  type TrainingEntityType,
  type TrainingPipelineState,
} from '@/lib/training-data-contract';
import {
  OUTPUT_SIGNAL_EVENTS,
  TRAINING_EVENT_SCHEMA_VERSION,
  type ClientTrainingEvent,
  type GenerationTrainingEventName,
} from '@/lib/training/event-contract';
import { trainingModalityForJobKind } from '@/lib/training/modalities';
import { clientEventRecordId, feedbackRecordId, outputRecordId, requestRecordId, serverEventRecordId } from '@/lib/training/record-ids';
import { emitTrainingMetric } from '@/lib/training/training-metrics';
import { enqueueTrainingRecord } from '@/lib/training/training-queue';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';
import TrainingDataRecord from '@/models/TrainingDataRecord';

/**
 * Server-side capture of /generate activity into TrainingDataRecord.
 *
 * Boundaries:
 * - Capture stores identifiers and small metadata only. Prompt and output
 *   content stay on the AIGenerationJob (operational data) and are read by the
 *   dataset worker after it re-validates consent.
 * - No consent at submission time means no training record at all. Data
 *   created before consent is never eligible, so storing it would only add
 *   privacy surface.
 * - Every function here is safe to call fire-and-forget: they never throw into
 *   the generation request. Use the `*BestEffort` wrappers on request paths.
 */

export type TrainingCaptureContext = {
  sessionId: string | null;
  parentGenerationId: string | null;
  appVersion: string | null;
};

type JobLike = Pick<IAIGenerationJob, 'userId' | 'kind' | 'provider' | 'modelId' | 'correlationId' | 'operationCode' | 'promptVersionNumber' | 'projectId' | 'result' | 'status'> & {
  _id: unknown;
  input?: Record<string, unknown> | null;
  completedAt?: Date | null;
  createdAt?: Date;
};

const ID = /^[A-Za-z0-9_-]{1,120}$/;
const OBJECT_ID = /^[a-f0-9]{24}$/i;
const APP_VERSION = /^[A-Za-z0-9._+-]{1,64}$/;

/** Validates the optional `trainingContext` the /generate client sends with a job. */
export function parseTrainingCaptureContext(value: unknown): TrainingCaptureContext {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const id = (raw: unknown, pattern = ID) => (typeof raw === 'string' && pattern.test(raw) ? raw : null);
  return {
    sessionId: id(input.sessionId),
    parentGenerationId: id(input.parentGenerationId, OBJECT_ID),
    appVersion: id(input.appVersion, APP_VERSION),
  };
}

export function serverAppVersion(env: Record<string, string | undefined> = process.env): string | null {
  const value = env.APP_VERSION?.trim() || env.VERCEL_GIT_COMMIT_SHA?.trim().slice(0, 12) || env.GIT_COMMIT_SHA?.trim().slice(0, 12);
  return value && APP_VERSION.test(value) ? value : null;
}

function generationIdOf(job: JobLike) {
  return String(job._id);
}

function modelSnapshot(job: JobLike) {
  if (!job.provider) return null;
  const config = job.modelId ? getAIModelConfig(job.provider, job.modelId) : null;
  return {
    provider: job.provider,
    model: job.modelId ?? null,
    // The concrete API model id is the most precise version we know.
    version: config?.modelId && config.modelId !== job.modelId ? config.modelId : null,
  };
}

/** Non-content generation parameters worth keeping for datasets. */
function generationParameters(job: JobLike) {
  const input = job.input ?? {};
  const pick = (key: string) => {
    const value = input[key];
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
  };
  const parameters: Record<string, unknown> = {
    operationCode: job.operationCode ?? null,
    promptVersionNumber: job.promptVersionNumber ?? null,
    hasProject: Boolean(job.projectId),
  };
  for (const key of ['aspectRatio', 'imageResolution', 'resolution', 'quality', 'style', 'videoDurationSeconds', 'videoResolution', 'videoAudio', 'optimizerTier', 'textTier', 'websiteTier', 'thinkingLevel', 'seed', 'temperature']) {
    const value = pick(key);
    if (value !== undefined) parameters[key] = value;
  }
  return parameters;
}

/** R2 references recorded on a completed job result; never inline bytes. */
export function trainingAssetsFromJobResult(result: unknown, bucket = getR2BucketName()): TrainingAssetReference[] {
  if (!result || typeof result !== 'object') return [];
  const value = result as Record<string, unknown>;
  const references: TrainingAssetReference[] = [];
  const candidates = Array.isArray(value.assets) ? value.assets : value.asset ? [value.asset] : [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const asset = candidate as Record<string, unknown>;
    if (asset.provider !== 'cloudflare-r2' || typeof asset.key !== 'string' || typeof asset.bucket !== 'string') continue;
    references.push({
      provider: 'cloudflare-r2',
      bucket: asset.bucket,
      key: asset.key,
      contentType: typeof asset.contentType === 'string' ? asset.contentType : null,
      contentHash: typeof asset.contentHash === 'string' ? asset.contentHash : null,
      bytes: typeof asset.bytes === 'number' ? asset.bytes : null,
    });
  }
  if (!references.length && typeof value.imageKey === 'string') {
    references.push({ provider: 'cloudflare-r2', bucket, key: value.imageKey, contentType: null, contentHash: null, bytes: null });
  }
  return references;
}

function pipelineState(status: TrainingPipelineState['status'], lastCode: string | null = null): TrainingPipelineState {
  return { status, enqueuedAt: null, attempts: 0, leaseToken: null, leaseExpiresAt: null, processedAt: null, lastCode, processedKeys: [] };
}

type RequestRecordLean = {
  consent: TrainingConsentSnapshot;
  sessionId: string | null;
  relations?: { parentGenerationId: string | null; familyId: string | null } | null;
  appVersion?: string | null;
};

async function requestRecordFor(userId: string, generationId: string) {
  return TrainingDataRecord.findOne({ entityType: 'request', recordId: requestRecordId(generationId), userId })
    .select('consent sessionId relations appVersion eligibility')
    .lean<RequestRecordLean & { eligibility: { status: string } }>();
}

async function writeEventRecord(input: {
  recordId: string;
  eventName: GenerationTrainingEventName;
  userId: string;
  job: JobLike | null;
  consent: TrainingConsentSnapshot;
  sessionId: string | null;
  relations: { parentGenerationId: string | null; familyId: string | null } | null;
  clientEventId: string | null;
  occurredAt: Date;
  receivedAt: Date;
  appVersion: string | null;
  payload: Record<string, unknown>;
  source: 'client' | 'server';
}) {
  const generationId = input.job ? generationIdOf(input.job) : null;
  const result = await TrainingDataRecord.updateOne(
    { entityType: 'event', recordId: input.recordId },
    {
      $setOnInsert: {
        schemaVersion: TRAINING_DATA_SCHEMA_VERSION,
        entityType: 'event',
        recordId: input.recordId,
        userId: input.userId,
        sessionId: input.sessionId,
        requestId: generationId,
        outputId: generationId,
        generationId,
        modality: input.job ? trainingModalityForJobKind(input.job.kind) : null,
        model: input.job ? modelSnapshot(input.job) : null,
        parameters: {},
        consent: input.consent,
        eligibility: trainingEligibilityFromConsent({ ...input.consent, source: 'account' }, input.receivedAt),
        provenance: { source: 'generate', sourceId: generationId, parentIds: [], correlationId: input.job?.correlationId ?? null },
        assets: [],
        payload: { schemaVersion: TRAINING_EVENT_SCHEMA_VERSION, ...input.payload },
        eventName: input.eventName,
        clientEventId: input.clientEventId,
        relations: input.relations,
        occurredAt: input.occurredAt,
        receivedAt: input.receivedAt,
        appVersion: input.appVersion,
        // Behavioural events are evidence for outputs, not examples themselves.
        pipeline: pipelineState('skipped', 'BEHAVIOURAL_EVENT'),
        createdAt: input.receivedAt,
        updatedAt: input.receivedAt,
      },
    },
    { upsert: true },
  );
  const inserted = result.upsertedCount > 0;
  if (inserted) emitTrainingMetric('training_events_captured_total', 1, { source: input.source, entity_type: 'event' });
  return inserted;
}

async function requeueOutput(generationId: string, reason: string) {
  const record = await TrainingDataRecord.findOne({ entityType: 'output', recordId: outputRecordId(generationId) })
    .select('recordId entityType generationId provenance.correlationId eligibility.status')
    .lean<{ recordId: string; entityType: TrainingEntityType; generationId?: string | null; provenance?: { correlationId?: string | null }; eligibility?: { status?: string } }>();
  if (!record || !['pending', 'eligible'].includes(record.eligibility?.status ?? '')) return false;
  const result = await enqueueTrainingRecord({
    recordId: record.recordId,
    entityType: record.entityType,
    generationId: record.generationId ?? generationId,
    correlationId: record.provenance?.correlationId ?? null,
  }, reason);
  return result.enqueued;
}

/** prompt_submitted: the request record plus its event. */
export async function captureGenerationRequest(job: JobLike, context: TrainingCaptureContext, now = new Date()) {
  await connectToDatabase();
  const consent = await resolveAuthoritativeTrainingConsent(job.userId);
  if (!consent.training) return { captured: false as const, reason: 'NO_TRAINING_CONSENT' };
  const generationId = generationIdOf(job);
  let relations: { parentGenerationId: string | null; familyId: string | null } = { parentGenerationId: null, familyId: generationId };
  if (context.parentGenerationId && context.parentGenerationId !== generationId) {
    // Only link to a parent the same user owns.
    const parentOwned = await AIGenerationJob.exists({ _id: context.parentGenerationId, userId: job.userId });
    if (parentOwned) {
      const parentRequest = await requestRecordFor(job.userId, context.parentGenerationId);
      relations = {
        parentGenerationId: context.parentGenerationId,
        familyId: parentRequest?.relations?.familyId ?? context.parentGenerationId,
      };
    }
  }
  const snapshot: TrainingConsentSnapshot = { ...consent, source: 'account' };
  const appVersion = context.appVersion ?? serverAppVersion();
  const occurredAt = job.createdAt ?? now;
  await TrainingDataRecord.updateOne(
    { entityType: 'request', recordId: requestRecordId(generationId) },
    {
      $setOnInsert: {
        schemaVersion: TRAINING_DATA_SCHEMA_VERSION,
        entityType: 'request',
        recordId: requestRecordId(generationId),
        userId: job.userId,
        sessionId: context.sessionId,
        requestId: generationId,
        outputId: null,
        generationId,
        modality: trainingModalityForJobKind(job.kind),
        model: modelSnapshot(job),
        parameters: generationParameters(job),
        consent: snapshot,
        eligibility: trainingEligibilityFromConsent(consent, now),
        provenance: { source: 'generate', sourceId: generationId, parentIds: relations.parentGenerationId ? [relations.parentGenerationId] : [], correlationId: job.correlationId ?? null },
        assets: [],
        // Reference only: the prompt is read from the job by the worker after re-checking consent.
        payload: { jobKind: job.kind, promptRef: { collection: 'ai_generation_jobs', id: generationId, field: 'input.prompt' } },
        eventName: 'prompt_submitted',
        clientEventId: null,
        relations,
        occurredAt,
        receivedAt: now,
        appVersion,
        // Requests are processed together with their output.
        pipeline: pipelineState('skipped', 'AWAITING_OUTPUT'),
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  await writeEventRecord({
    recordId: serverEventRecordId('prompt_submitted', generationId),
    eventName: 'prompt_submitted', userId: job.userId, job, consent: snapshot, sessionId: context.sessionId, relations,
    clientEventId: null, occurredAt, receivedAt: now, appVersion, payload: {}, source: 'server',
  });
  return { captured: true as const, relations };
}

/** generation_started / generation_completed / generation_failed. */
export async function captureGenerationLifecycle(job: JobLike, eventName: 'generation_started' | 'generation_completed' | 'generation_failed', now = new Date()) {
  await connectToDatabase();
  const generationId = generationIdOf(job);
  const request = await requestRecordFor(job.userId, generationId);
  // No request record means the user had not consented when submitting.
  if (!request) return { captured: false as const, reason: 'NO_REQUEST_RECORD' };
  const appVersion = request.appVersion ?? serverAppVersion();
  const relations = request.relations ?? null;
  await writeEventRecord({
    recordId: serverEventRecordId(eventName, generationId),
    eventName, userId: job.userId, job, consent: request.consent, sessionId: request.sessionId, relations,
    clientEventId: null, occurredAt: now, receivedAt: now, appVersion, payload: {}, source: 'server',
  });
  if (eventName !== 'generation_completed') return { captured: true as const };
  if (request.eligibility?.status === 'revoked' || request.eligibility?.status === 'ineligible') return { captured: true as const };

  const outputId = outputRecordId(generationId);
  await TrainingDataRecord.updateOne(
    { entityType: 'output', recordId: outputId },
    {
      $setOnInsert: {
        schemaVersion: TRAINING_DATA_SCHEMA_VERSION,
        entityType: 'output',
        recordId: outputId,
        userId: job.userId,
        sessionId: request.sessionId,
        requestId: generationId,
        outputId: generationId,
        generationId,
        modality: trainingModalityForJobKind(job.kind),
        model: modelSnapshot(job),
        parameters: generationParameters(job),
        consent: request.consent,
        eligibility: trainingEligibilityFromConsent({ ...request.consent, source: 'account' }, now),
        provenance: { source: 'generate', sourceId: generationId, parentIds: [requestRecordId(generationId)], correlationId: job.correlationId ?? null },
        assets: trainingAssetsFromJobResult(job.result),
        payload: { jobKind: job.kind, resultRef: { collection: 'ai_generation_jobs', id: generationId, field: 'result' } },
        eventName: 'generation_completed',
        clientEventId: null,
        relations,
        occurredAt: job.completedAt ?? now,
        receivedAt: now,
        appVersion,
        pipeline: pipelineState('captured'),
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
  await enqueueTrainingRecord({ recordId: outputId, entityType: 'output', generationId, correlationId: job.correlationId ?? null }, 'completed');
  return { captured: true as const };
}

export class TrainingCaptureError extends Error {
  constructor(public readonly code: 'GENERATION_NOT_FOUND') {
    super(code);
  }
}

/** Events posted by the /generate UI. */
export async function captureClientTrainingEvent(userId: string, event: ClientTrainingEvent, now = new Date()) {
  await connectToDatabase();
  let job: JobLike | null = null;
  if (event.generationId) {
    if (!OBJECT_ID.test(event.generationId)) throw new TrainingCaptureError('GENERATION_NOT_FOUND');
    job = await AIGenerationJob.findOne({ _id: event.generationId, userId })
      .select('userId kind provider modelId correlationId operationCode promptVersionNumber projectId status')
      .lean<JobLike>();
    if (!job) throw new TrainingCaptureError('GENERATION_NOT_FOUND');
  }
  let consent: TrainingConsentSnapshot;
  let relations: { parentGenerationId: string | null; familyId: string | null } | null = null;
  let sessionId = event.sessionId ?? null;
  if (job) {
    const request = await requestRecordFor(userId, generationIdOf(job));
    if (!request) return { captured: false as const, reason: 'NO_REQUEST_RECORD' };
    consent = request.consent;
    relations = request.relations ?? null;
    sessionId = request.sessionId ?? sessionId;
  } else {
    const current = await resolveAuthoritativeTrainingConsent(userId);
    if (!current.training) return { captured: false as const, reason: 'NO_TRAINING_CONSENT' };
    consent = { ...current, source: 'account' };
  }
  if (event.parentGenerationId) {
    const parentOwned = OBJECT_ID.test(event.parentGenerationId) && await AIGenerationJob.exists({ _id: event.parentGenerationId, userId });
    relations = { parentGenerationId: parentOwned ? event.parentGenerationId : null, familyId: relations?.familyId ?? null };
  }
  const inserted = await writeEventRecord({
    recordId: clientEventRecordId(userId, event.clientEventId),
    eventName: event.eventName, userId, job, consent, sessionId, relations,
    clientEventId: event.clientEventId, occurredAt: new Date(event.occurredAt), receivedAt: now,
    appVersion: event.appVersion ?? null, payload: event.payload ?? {}, source: 'client',
  });
  // A new behavioural signal changes the quality of the output it refers to and,
  // for regenerate/edit, of the parent output that was passed over.
  if (inserted && job && (OUTPUT_SIGNAL_EVENTS as readonly string[]).includes(event.eventName)) {
    await requeueOutput(generationIdOf(job), `signal-${event.clientEventId}`);
    if (relations?.parentGenerationId) await requeueOutput(relations.parentGenerationId, `signal-${event.clientEventId}`);
  }
  return { captured: true as const, duplicate: !inserted };
}

/** The user's verdict from POST /api/ai/jobs/[id]/feedback. The latest verdict wins. */
export async function captureGenerationFeedback(job: JobLike, input: { useful: boolean; reason: string | null }, now = new Date()) {
  await connectToDatabase();
  const generationId = generationIdOf(job);
  const request = await requestRecordFor(job.userId, generationId);
  if (!request) return { captured: false as const, reason: 'NO_REQUEST_RECORD' };
  await TrainingDataRecord.updateOne(
    { entityType: 'feedback', recordId: feedbackRecordId(generationId) },
    {
      $set: {
        payload: { verdict: input.useful ? 'positive' : 'negative', reason: input.reason },
        eventName: input.useful ? 'feedback_positive' : 'feedback_negative',
        occurredAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        schemaVersion: TRAINING_DATA_SCHEMA_VERSION,
        entityType: 'feedback',
        recordId: feedbackRecordId(generationId),
        userId: job.userId,
        sessionId: request.sessionId,
        requestId: generationId,
        outputId: generationId,
        generationId,
        modality: trainingModalityForJobKind(job.kind),
        model: modelSnapshot(job),
        parameters: {},
        consent: request.consent,
        eligibility: trainingEligibilityFromConsent({ ...request.consent, source: 'account' }, now),
        provenance: { source: 'feedback', sourceId: generationId, parentIds: [outputRecordId(generationId)], correlationId: job.correlationId ?? null },
        assets: [],
        clientEventId: null,
        relations: request.relations ?? null,
        receivedAt: now,
        appVersion: request.appVersion ?? serverAppVersion(),
        pipeline: pipelineState('skipped', 'BEHAVIOURAL_EVENT'),
        createdAt: now,
      },
    },
    { upsert: true },
  );
  await writeEventRecord({
    recordId: `${serverEventRecordId(input.useful ? 'feedback_positive' : 'feedback_negative', generationId)}:${now.getTime()}`,
    eventName: input.useful ? 'feedback_positive' : 'feedback_negative',
    userId: job.userId, job, consent: request.consent, sessionId: request.sessionId, relations: request.relations ?? null,
    clientEventId: null, occurredAt: now, receivedAt: now, appVersion: request.appVersion ?? null,
    payload: input.reason ? { reason: input.reason } : {}, source: 'server',
  });
  await requeueOutput(generationId, `feedback-${now.getTime()}`);
  return { captured: true as const };
}

function logCaptureFailure(stage: string, error: unknown) {
  emitTrainingMetric('training_events_rejected_total', 1, { stage: 'capture', reason: stage });
  // Stage and error class only: never ids, prompts or provider messages.
  console.warn('[training-data] capture failed', { stage, error: error instanceof Error ? error.name : 'unknown' });
}

/**
 * Runs capture after the response is sent. Inside a request, `after()` keeps
 * the serverless invocation alive until the task settles; outside one (cron
 * runners, workers) it throws, and the task simply runs detached.
 */
function runAfterResponse(stage: string, task: () => Promise<unknown>) {
  const guarded = () => task().catch((error) => logCaptureFailure(stage, error));
  try {
    after(guarded);
  } catch {
    void guarded();
  }
}

/** Request-path wrappers: never awaited by callers, never throw. */
export function captureGenerationRequestBestEffort(job: JobLike, context: TrainingCaptureContext) {
  runAfterResponse('request', () => captureGenerationRequest(job, context));
}

export function captureGenerationLifecycleBestEffort(job: JobLike, eventName: 'generation_started' | 'generation_completed' | 'generation_failed') {
  runAfterResponse(eventName, () => captureGenerationLifecycle(job, eventName));
}

export function captureGenerationFeedbackBestEffort(job: JobLike, input: { useful: boolean; reason: string | null }) {
  runAfterResponse('feedback', () => captureGenerationFeedback(job, input));
}
