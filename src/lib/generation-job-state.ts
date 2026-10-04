export const GENERATION_JOB_TYPES = ['image', 'video', 'web', 'text', 'vision', 'videoUnderstanding'] as const;
export type GenerationJobType = typeof GENERATION_JOB_TYPES[number];

export const GENERATION_JOB_STATES = [
  'queued',
  'processing',
  'uploading',
  'finalizing',
  'completed',
  'failed',
  'dead_letter',
  'cancelled',
] as const;
export type GenerationJobState = typeof GENERATION_JOB_STATES[number];
export type PersistedGenerationJobState = GenerationJobState | 'retrying';
export type LegacyGenerationJobKind = 'image' | 'video' | 'project';
/**
 * The six job kinds the queue can actually run. Declared here instead of
 * importing `AIJobKind` because the model already imports this module; the two
 * unions are kept structurally identical on purpose.
 */
export type GenerationJobKind = LegacyGenerationJobKind | 'vision' | 'text' | 'videoUnderstanding';

export type GenerationJobErrorCategory =
  | 'bad_request'
  | 'auth_or_permission'
  | 'model_not_found'
  | 'rate_limit_or_quota'
  | 'timeout'
  | 'provider_error'
  | 'provider_unavailable'
  | 'storage_error'
  | 'validation_error'
  | 'configuration_error'
  | 'cancelled'
  | 'unknown';

export interface CanonicalGenerationJob {
  id: string;
  userId: string;
  type: GenerationJobType;
  provider: string;
  model: string | null;
  status: GenerationJobState;
  attempt: number;
  correlationId: string;
  providerRequestId: string | null;
  estimatedCredits: number;
  actualCredits: number | null;
  assetRef: string | null;
  outputRef: string | null;
  errorCategory: GenerationJobErrorCategory | null;
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    startedAt: Date | null;
    uploadingAt: Date | null;
    finalizingAt: Date | null;
    completedAt: Date | null;
    cancelledAt: Date | null;
  };
}

const LEGAL_TRANSITIONS: Readonly<Record<GenerationJobState, readonly GenerationJobState[]>> = {
  queued: ['processing', 'cancelled'],
  processing: ['queued', 'uploading', 'finalizing', 'failed', 'dead_letter', 'cancelled'],
  uploading: ['queued', 'finalizing', 'failed', 'dead_letter', 'cancelled'],
  finalizing: ['queued', 'completed', 'failed', 'dead_letter', 'cancelled'],
  completed: [],
  failed: [],
  dead_letter: [],
  cancelled: [],
};

export class IllegalGenerationJobTransitionError extends Error {
  constructor(readonly from: GenerationJobState, readonly to: GenerationJobState) {
    super(`Illegal generation job transition: ${from} -> ${to}`);
    this.name = 'IllegalGenerationJobTransitionError';
  }
}

/** `project` ships as `web` for clients written before the rename. */
export function canonicalGenerationType(kind: GenerationJobKind): GenerationJobType {
  return kind === 'project' ? 'web' : kind;
}

export function canonicalGenerationState(status: PersistedGenerationJobState): GenerationJobState {
  return status === 'retrying' ? 'queued' : status;
}

export function persistedStatesFor(state: GenerationJobState): readonly PersistedGenerationJobState[] {
  return state === 'queued' ? ['queued', 'retrying'] : [state];
}

export function canTransitionGenerationJob(from: GenerationJobState, to: GenerationJobState): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

export function assertGenerationJobTransition(from: GenerationJobState, to: GenerationJobState): void {
  if (!canTransitionGenerationJob(from, to)) throw new IllegalGenerationJobTransitionError(from, to);
}

export function isTerminalGenerationJobState(state: GenerationJobState): boolean {
  return state === 'completed' || state === 'failed' || state === 'dead_letter' || state === 'cancelled';
}

export function progressForGenerationJobState(state: GenerationJobState): number {
  if (state === 'queued') return 0;
  if (state === 'processing') return 10;
  if (state === 'uploading') return 70;
  if (state === 'finalizing') return 90;
  return 100;
}

export function generationJobErrorCategory(input: {
  httpStatus?: number | null;
  code?: string | null;
  message?: string | null;
}): GenerationJobErrorCategory {
  const code = input.code?.toUpperCase() ?? '';
  const message = input.message?.toLowerCase() ?? '';
  if (code.includes('CANCEL') || message.includes('cancel')) return 'cancelled';
  if (code.includes('TIMEOUT') || message.includes('timeout') || message.includes('abort')) return 'timeout';
  if (input.httpStatus === 408) return 'timeout';
  if (input.httpStatus === 422 || code.includes('VALIDATION') || code.includes('INVALID_ARGUMENT')) return 'validation_error';
  if (code.includes('STORAGE') || code.includes('R2')) return 'storage_error';
  if (code.includes('CONFIG') || code.includes('CREDENTIAL_MISSING')) return 'configuration_error';
  if (input.httpStatus === 400) return 'bad_request';
  if (input.httpStatus === 401 || input.httpStatus === 403 || code.includes('AUTH') || code.includes('PERMISSION')) return 'auth_or_permission';
  if (input.httpStatus === 404 || code.includes('NOT_FOUND')) return 'model_not_found';
  if (input.httpStatus === 429 || code.includes('QUOTA') || code.includes('RESOURCE_EXHAUSTED')) return 'rate_limit_or_quota';
  // Transient transport failures (no HTTP status) and eligible 5xx retry;
  // other 5xx (501 Not Implemented, 505...) are permanent provider errors.
  if (code.startsWith('NETWORK_') || code.includes('UNAVAILABLE')) return 'provider_unavailable';
  const status = input.httpStatus ?? 0;
  if (status === 500 || status === 502 || status === 503 || status === 504) return 'provider_unavailable';
  if (status >= 500) return 'provider_error';
  if (input.httpStatus || code.includes('PROVIDER')) return 'provider_error';
  return 'unknown';
}
