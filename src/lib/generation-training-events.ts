import 'server-only';
import { randomUUID } from 'node:crypto';
import TrainingDataRecord from '@/models/TrainingDataRecord';
import { trainingEligibilityFromConsent } from '@/lib/training-consent';

export const GENERATION_TRAINING_EVENTS = [
  'prompt_submitted',
  'generation_started',
  'generation_completed',
  'generation_failed',
  'output_viewed',
  'output_saved',
  'output_downloaded',
  'regenerate_clicked',
  'prompt_edited',
  'feedback_positive',
  'feedback_negative',
  'added_to_queue',
] as const;

export type GenerationTrainingEventName = (typeof GENERATION_TRAINING_EVENTS)[number];

type Consent = {
  training: boolean;
  version: string;
  capturedAt: Date;
  source: 'account' | 'generate' | 'feedback' | 'other';
};

export async function recordGenerationTrainingEvent(input: {
  eventName: GenerationTrainingEventName;
  userId: string;
  jobId?: string | null;
  sessionId?: string | null;
  requestId?: string | null;
  outputId?: string | null;
  modality?: 'image' | 'video' | 'web' | 'text' | 'vision' | 'project' | null;
  provider?: string | null;
  modelId?: string | null;
  correlationId?: string | null;
  parameters?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  consent?: Consent | null;
  occurredAt?: Date;
  clientEventId?: string | null;
}) {
  const occurredAt = input.occurredAt ?? new Date();
  const recordId = input.clientEventId?.trim() || randomUUID();
  const consent = input.consent ?? {
    training: false,
    version: 'not-captured',
    capturedAt: occurredAt,
    source: 'other' as const,
  };

  return TrainingDataRecord.updateOne(
    { entityType: 'event', recordId },
    {
      $setOnInsert: {
        schemaVersion: 1,
        entityType: 'event',
        recordId,
        userId: input.userId,
        sessionId: input.sessionId ?? null,
        requestId: input.requestId ?? input.jobId ?? null,
        outputId: input.outputId ?? null,
        modality: input.modality ?? null,
        model: input.provider
          ? { provider: input.provider, model: input.modelId ?? null, version: null }
          : null,
        parameters: input.parameters ?? {},
        consent,
        eligibility: trainingEligibilityFromConsent(consent, occurredAt),
        provenance: {
          source: 'generate',
          sourceId: input.jobId ?? null,
          parentIds: [],
          correlationId: input.correlationId ?? null,
        },
        assets: [],
        payload: {
          eventName: input.eventName,
          ...(input.payload ?? {}),
        },
        occurredAt,
        createdAt: occurredAt,
        updatedAt: occurredAt,
      },
    },
    { upsert: true },
  );
}

/** Training telemetry is best-effort and must never break a generation request. */
export function recordGenerationTrainingEventBestEffort(
  input: Parameters<typeof recordGenerationTrainingEvent>[0],
) {
  void recordGenerationTrainingEvent(input).catch((error) => {
    console.warn('[training-data] event capture failed', {
      eventName: input.eventName,
      jobId: input.jobId ?? null,
      error: error instanceof Error ? error.message : 'unknown',
    });
  });
}
