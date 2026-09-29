export const GENERATION_JOB_TYPES = ['image', 'video', 'web'] as const;
export type GenerationJobType = typeof GENERATION_JOB_TYPES[number];

export const GENERATION_JOB_STATES = [
  'queued',
  'processing',
  'uploading',
  'finalizing',
  'completed',
  'failed',
  'cancelled',
] as const;
export type GenerationJobState = typeof GENERATION_JOB_STATES[number];
export type PersistedGenerationJobState = GenerationJobState | 'retrying';
export type LegacyGenerationJobKind = 'image' | 'video' | 'project';

export type GenerationJobErrorCategory =
  | 'bad_request'
  | 'auth_or_permission'
  | 'model_not_found'
  | 'rate_limit_or_quota'
  | 'timeout'
  | 'provider_error'
  | 'storage_error'
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
  processing: ['queued', 'uploading', 'finalizing', 'failed', 'cancelled'],
  uploading: ['queued', 'finalizing', 'failed', 'cancelled'],
  finalizing: ['queued', 'completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

export class IllegalGenerationJobTransitionError extends Error {
  constructor(readonly from: GenerationJobState, readonly to: GenerationJobState) {
    super(`Illegal generation job transition: ${from} -> ${to}`);
    this.name = 'IllegalGenerationJobTransitionError';
  }
}

export function canonicalGenerationType(kind: LegacyGenerationJobKind | GenerationJobType): GenerationJobType {
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
  return state === 'completed' || state === 'failed' || state === 'cancelled';
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
  if (input.httpStatus === 400) return 'bad_request';
  if (input.httpStatus === 401 || input.httpStatus === 403 || code.includes('AUTH') || code.includes('PERMISSION')) return 'auth_or_permission';
  if (input.httpStatus === 404 || code.includes('NOT_FOUND')) return 'model_not_found';
  if (input.httpStatus === 429 || code.includes('QUOTA') || code.includes('RESOURCE_EXHAUSTED')) return 'rate_limit_or_quota';
  if (code.includes('STORAGE') || code.includes('R2')) return 'storage_error';
  if (input.httpStatus || code.includes('PROVIDER')) return 'provider_error';
  return 'unknown';
}
