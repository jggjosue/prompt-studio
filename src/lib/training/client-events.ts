/**
 * Browser side of training-event capture for /generate.
 *
 * - Events follow the v2 contract (event-contract.ts) and carry ids and small
 *   enums only: never prompt text, never keystrokes.
 * - Nothing is sent unless the user has opted in to training; the server
 *   enforces the same rule independently.
 * - Sending is fire-and-forget through navigator.sendBeacon (survives page
 *   unloads) with a keepalive fetch fallback. Failures are swallowed: telemetry
 *   must never affect the generation UI.
 */
import {
  TRAINING_EVENT_SCHEMA_VERSION,
  type ClientTrainingEvent,
  type ClientTrainingEventName,
  type TrainingEventPayload,
} from '@/lib/training/event-contract';
import type { TrainingModality } from '@/lib/training/modalities';

const ENDPOINT = '/api/ai/training-events';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || null;

let consentGranted = false;

/** Set from the consent state loaded by the /generate page. */
export function setTrainingConsentGranted(granted: boolean) {
  consentGranted = granted;
}

export function isTrainingConsentGranted() {
  return consentGranted;
}

/** Context attached to the next generation request (consumed once). */
export type GenerationTrainingContext = { sessionId: string | null; parentGenerationId: string | null };
let pendingContext: GenerationTrainingContext = { sessionId: null, parentGenerationId: null };

export function setPendingGenerationTrainingContext(context: Partial<GenerationTrainingContext>) {
  pendingContext = { ...pendingContext, ...context };
}

/**
 * Returns the `trainingContext` body field for POST /api/ai/jobs and clears the
 * parent link so it applies to exactly one generation. The session persists.
 */
export function takeGenerationTrainingContext() {
  const context = { ...pendingContext, appVersion: APP_VERSION };
  pendingContext = { ...pendingContext, parentGenerationId: null };
  return context;
}

function newEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function send(body: string) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
    }
    void fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true, credentials: 'same-origin' }).catch(() => undefined);
  } catch {
    // Never surface telemetry errors.
  }
}

export function trackTrainingEvent(input: {
  eventName: ClientTrainingEventName;
  generationId?: string | null;
  parentGenerationId?: string | null;
  sessionId?: string | null;
  modality?: TrainingModality | null;
  payload?: TrainingEventPayload;
}) {
  if (!consentGranted || typeof window === 'undefined') return;
  const event: ClientTrainingEvent = {
    schemaVersion: TRAINING_EVENT_SCHEMA_VERSION,
    clientEventId: newEventId(),
    eventName: input.eventName,
    occurredAt: new Date().toISOString(),
    sessionId: input.sessionId ?? pendingContext.sessionId,
    generationId: input.generationId ?? null,
    parentGenerationId: input.parentGenerationId ?? null,
    modality: input.modality ?? null,
    appVersion: APP_VERSION,
    payload: input.payload ?? {},
  };
  send(JSON.stringify(event));
}

/** Maps chat modes to training modalities for client events. */
export function trainingModalityForChatMode(mode: string): TrainingModality | null {
  switch (mode) {
    case 'image': return 'image';
    case 'video': return 'video';
    case 'project': return 'web';
    case 'text': return 'text';
    case 'vision':
    case 'videoUnderstanding': return 'multimodal';
    default: return null;
  }
}
