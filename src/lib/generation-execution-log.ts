import { anonymizeObservabilityUser } from '@/lib/observability-safety';
import { executionWorkloadForKind } from '@/lib/ai-execution-backend-policy';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

/**
 * One structured record per generation execution outcome (#837).
 *
 * Shared by every execution backend so dashboards compare legacy, GCP and
 * future AWS/Cloudflare on the same fields. Built from an ALLOW-LIST of job
 * fields: prompts, inputs, results, emails, keys, tokens and media are never
 * read, and every free-text value passes through `redactSecrets`.
 *
 * Emitted as a single JSON line on stdout, which Cloud Logging (and Vercel
 * logs) parse into `jsonPayload`; `severity` maps to the log level.
 */

export const GENERATION_EXECUTION_LOG_VERSION = 1;

export type GenerationExecutionOutcome = 'completed' | 'retry_scheduled' | 'poll_scheduled' | 'dead_letter' | 'failed' | 'ownership_lost';

export type GenerationExecutionRecord = {
  message: 'ai_generation_execution';
  severity: 'INFO' | 'WARNING' | 'ERROR';
  version: typeof GENERATION_EXECUTION_LOG_VERSION;
  outcome: GenerationExecutionOutcome;
  jobId: string;
  generationId: string;
  correlationId: string;
  userRef: string | null;
  workload: 'image' | 'video' | 'web' | null;
  kind: string;
  executionBackend: string;
  queue: string | null;
  dispatchTransport: string | null;
  provider: string;
  model: string | null;
  status: string;
  attempts: number;
  maxAttempts: number;
  latencyMs: number | null;
  providerRequestId: string | null;
  errorCategory: string | null;
  errorCode: string | null;
  httpStatus: number | null;
  usage: { inputTokens: number | null; outputTokens: number | null; mediaSeconds: number | null; mediaCount: number | null };
  providerCostUsd: number | null;
  estimatedCostUsd: number | null;
  estimatedCredits: number | null;
  actualCredits: number | null;
  creditsState: string | null;
  workerService: string | null;
  workerRevision: string | null;
  timestamps: { createdAt: string | null; startedAt: string | null; completedAt: string | null; loggedAt: string };
  'logging.googleapis.com/labels': Record<string, string>;
};

const SECRET_PATTERNS: RegExp[] = [
  /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  /\bsk-[A-Za-z0-9_-]{8,}/g, // OpenAI-style
  /\bsk_(live|test)_[A-Za-z0-9]{8,}/g, // Stripe/Clerk
  /\bAIza[0-9A-Za-z_-]{20,}/g, // Google API key
  /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, // AWS access key id
  /\bwhsec_[A-Za-z0-9+/=]{8,}/g,
  /\bre_[A-Za-z0-9]{16,}/g, // Resend
  /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT
  /mongodb(\+srv)?:\/\/[^\s"']+/gi,
  /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi,
  /[A-Za-z0-9+/]{200,}={0,2}/g, // long base64 blobs
];

export function redactSecrets(value: string, max = 300): string {
  let out = value;
  for (const pattern of SECRET_PATTERNS) out = out.replace(pattern, '[REDACTED]');
  return out.slice(0, max);
}

const text = (value: unknown, max = 200) => (typeof value === 'string' && value.trim() ? redactSecrets(value.trim(), max) : null);
const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const iso = (value: unknown) => (value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : null);

function mediaUsage(job: Pick<IAIGenerationJob, 'kind' | 'result'>) {
  const result = job.result && typeof job.result === 'object' ? job.result as Record<string, unknown> : {};
  const seconds = num(result.durationSeconds) ?? num(result.videoDurationSeconds);
  const count = job.kind === 'image' || job.kind === 'video' ? (num(result.count) ?? (result.imageUrl || result.videoUrl || result.assetKey ? 1 : null)) : null;
  return { mediaSeconds: seconds, mediaCount: count };
}

export function buildGenerationExecutionRecord(input: {
  job: IAIGenerationJob;
  outcome: GenerationExecutionOutcome;
  executionBackend: string;
  latencyMs?: number | null;
  error?: { category?: string | null; code?: string | null; httpStatus?: number | null } | null;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}): GenerationExecutionRecord {
  const { job } = input;
  const env = input.env ?? process.env;
  const workload = executionWorkloadForKind(job.kind);
  const severity = input.outcome === 'dead_letter' || input.outcome === 'failed' ? 'ERROR' : input.outcome === 'retry_scheduled' || input.outcome === 'ownership_lost' ? 'WARNING' : 'INFO';
  const jobId = String(job._id);
  const correlationId = text(job.correlationId, 120) ?? jobId;
  return {
    message: 'ai_generation_execution',
    severity,
    version: GENERATION_EXECUTION_LOG_VERSION,
    outcome: input.outcome,
    jobId,
    generationId: text(job.generationIdempotencyKey, 120) ?? jobId,
    correlationId,
    userRef: anonymizeObservabilityUser(job.userId),
    workload,
    kind: job.kind,
    executionBackend: input.executionBackend,
    queue: text(job.dispatch?.queue, 120),
    dispatchTransport: text(job.dispatch?.backend, 40),
    provider: text(job.provider, 80) ?? 'unknown',
    model: text(job.modelId, 120),
    status: job.status,
    attempts: num(job.attempts) ?? 0,
    maxAttempts: num(job.maxAttempts) ?? 0,
    latencyMs: num(input.latencyMs) ?? num(job.actualDurationMs),
    providerRequestId: text(job.providerRequestId ?? job.providerOperation?.providerRequestId, 300),
    errorCategory: text(input.error?.category ?? job.errorCategory, 40),
    errorCode: text(input.error?.code ?? job.failureMetadata?.code, 100),
    httpStatus: num(input.error?.httpStatus ?? job.failureMetadata?.httpStatus),
    usage: { inputTokens: num(job.actualInputTokens), outputTokens: num(job.actualOutputTokens), ...mediaUsage(job) },
    providerCostUsd: num(job.actualCostUsd),
    estimatedCostUsd: num(job.estimatedCostUsd),
    estimatedCredits: num(job.creditCost),
    actualCredits: num(job.creditsCharged),
    creditsState: text(job.creditsState, 20),
    workerService: text(env.K_SERVICE, 80) ?? (env.VERCEL ? 'vercel' : null),
    workerRevision: text(env.K_REVISION, 120) ?? text(env.VERCEL_DEPLOYMENT_ID, 120),
    timestamps: { createdAt: iso(job.createdAt), startedAt: iso(job.startedAt), completedAt: iso(job.completedAt), loggedAt: (input.now ?? new Date()).toISOString() },
    // Indexed labels for cheap filtering / log-based metrics.
    'logging.googleapis.com/labels': { workload: workload ?? 'other', executionBackend: input.executionBackend, outcome: input.outcome, provider: text(job.provider, 80) ?? 'unknown' },
  };
}

/** Writes the record as one JSON line (never throws into the job flow). */
export function emitGenerationExecutionRecord(record: GenerationExecutionRecord, write: (line: string) => void = line => process.stdout.write(line)) {
  try {
    write(`${JSON.stringify(record)}\n`);
  } catch {
    // Logging must never break generation.
  }
}
