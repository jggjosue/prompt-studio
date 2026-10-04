import { createHash } from 'node:crypto';
import { gcpDispatchReady, type GcpGenerationWorkload } from '@/lib/gcp-generation-policy';

// Pure transport adapter: env identifiers + an access token passed in by the
// caller. It reads no secret itself, so it stays importable from unit tests.

type GcpDispatchInput = {
  jobId: string;
  correlationId: string;
  workload: GcpGenerationWorkload;
  /**
   * Distinguishes follow-up deliveries of the same job (business retry,
   * video poll). Omitted for the initial dispatch. Same key => same task
   * name => Cloud Tasks deduplicates a repeated enqueue.
   */
  deliveryKey?: string;
  /** Deliver no earlier than this instant (retry backoff / poll interval). */
  scheduleAt?: Date | null;
};

export type GcpDispatchResult = {
  dispatched: boolean;
  backend: 'gcp-cloud-tasks';
  queue: string;
  taskName?: string;
  /** true when Cloud Tasks reported the deterministic task already exists. */
  deduplicated?: boolean;
  reason?: 'disabled' | 'configuration_missing' | 'publish_failed';
  httpStatus?: number | null;
};

/** Versioned queue payload. IDs only: no prompt, keys, email, credits or media. */
export type GcpGenerationTaskPayload = { version: 1; jobId: string; correlationId: string; workload: GcpGenerationWorkload };

export function gcpGenerationTaskPayload(input: Pick<GcpDispatchInput, 'jobId' | 'correlationId' | 'workload'>): GcpGenerationTaskPayload {
  return { version: 1, jobId: input.jobId, correlationId: input.correlationId, workload: input.workload };
}

export function gcpTaskId(jobId: string, deliveryKey?: string) {
  const base = `job-${createHash('sha256').update(jobId).digest('hex').slice(0, 32)}`;
  if (!deliveryKey) return base;
  return `${base}-${deliveryKey.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60)}`;
}

/**
 * Cloud Tasks REST dispatch. The task calls the private Cloud Run worker with
 * an OIDC token minted for `ps-ai-queue-invoker`; Cloud Run stays private.
 * `force` lets the worker re-enqueue a job already pinned to GCP even while
 * the per-workload *new traffic* flag is off (draining must keep working);
 * the kill switch is still honoured.
 */
export async function dispatchGcpGenerationTask(
  input: GcpDispatchInput,
  accessToken?: string,
  options: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; force?: boolean } = {},
): Promise<GcpDispatchResult> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const cfg = gcpDispatchReady(input.workload, env);
  const killed = env.GCP_AI_KILL_SWITCH?.trim().toLowerCase() === 'true';
  if (killed || (!cfg.enabled && !options.force)) return { dispatched: false, backend: 'gcp-cloud-tasks', queue: cfg.queue, reason: 'disabled' };
  if (!cfg.ready || !accessToken) return { dispatched: false, backend: 'gcp-cloud-tasks', queue: cfg.queue, reason: 'configuration_missing' };
  const project = env.GCP_AI_PROJECT_ID!.trim(), region = env.GCP_AI_REGION!.trim();
  const workerUrl = env.GCP_AI_WORKER_URL!.trim().replace(/\/$/, '');
  const invoker = env.GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT!.trim();
  const audience = env.GCP_AI_WORKER_AUDIENCE?.trim() || workerUrl;
  const parent = `projects/${project}/locations/${region}/queues/${cfg.queue}`;
  const name = `${parent}/tasks/${gcpTaskId(input.jobId, input.deliveryKey)}`;
  const body = Buffer.from(JSON.stringify(gcpGenerationTaskPayload(input))).toString('base64');
  try {
    const response = await fetchImpl(`https://cloudtasks.googleapis.com/v2/${parent}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: {
          name,
          ...(input.scheduleAt ? { scheduleTime: input.scheduleAt.toISOString() } : {}),
          httpRequest: {
            httpMethod: 'POST',
            url: `${workerUrl}/tasks/generation`,
            headers: { 'Content-Type': 'application/json' },
            body,
            oidcToken: { serviceAccountEmail: invoker, audience },
          },
        },
      }),
    });
    // ALREADY_EXISTS: the same logical delivery was enqueued before (e.g. a
    // timed-out request that actually succeeded). Never create a second one.
    if (response.status === 409) return { dispatched: true, deduplicated: true, backend: 'gcp-cloud-tasks', queue: cfg.queue, taskName: name, httpStatus: 409 };
    if (!response.ok) return { dispatched: false, backend: 'gcp-cloud-tasks', queue: cfg.queue, reason: 'publish_failed', httpStatus: response.status };
    const result = await response.json() as { name?: unknown };
    return { dispatched: true, backend: 'gcp-cloud-tasks', queue: cfg.queue, taskName: typeof result.name === 'string' ? result.name : name, httpStatus: response.status };
  } catch {
    return { dispatched: false, backend: 'gcp-cloud-tasks', queue: cfg.queue, reason: 'publish_failed', httpStatus: null };
  }
}
