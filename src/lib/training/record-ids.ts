import 'server-only';
import { createHash } from 'node:crypto';
import type { GenerationTrainingEventName } from '@/lib/training/event-contract';

/**
 * Deterministic record identifiers. Every capture path derives the same id for
 * the same logical fact, so retries, double clicks and duplicate deliveries
 * collapse onto one MongoDB document through the unique {entityType, recordId}
 * index instead of creating copies.
 */

const hash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 40);

/** The prompt submission of a generation job. */
export const requestRecordId = (generationId: string) => `req:${generationId}`;

/** The produced output of a generation job (the unit the dataset worker processes). */
export const outputRecordId = (generationId: string) => `out:${generationId}`;

/** The user's verdict on a generation; one per (generation, user), updated in place. */
export const feedbackRecordId = (generationId: string) => `fb:${generationId}`;

/** Server lifecycle events happen once per generation and event name. */
export const serverEventRecordId = (eventName: GenerationTrainingEventName, generationId: string) =>
  `evt:${eventName}:${generationId}`;

/**
 * Client events are keyed by the browser's clientEventId, scoped to the user so
 * one account can never collide with (and silently no-op) another's event.
 */
export const clientEventRecordId = (userId: string, clientEventId: string) => `evt:c:${hash(`${userId}\u0000${clientEventId}`)}`;
