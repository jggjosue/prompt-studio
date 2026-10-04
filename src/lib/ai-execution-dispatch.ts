import { executionWorkloadForKind, type ExecutionWorkload } from '@/lib/ai-execution-backend-policy';
import type { GcpAccessTokenResult } from '@/lib/gcp-access-token';
import type { GcpDispatchResult } from '@/lib/gcp-generation-dispatch';
import type { GenerationDispatchResult } from '@/lib/generation-queue-dispatch';
import type { GenerationDispatchTransport } from '@/models/AIGenerationJob';

/**
 * Enqueues a job on the execution backend that was pinned on it at creation
 * (#835). Exactly ONE transport adapter is called per invocation and a cloud
 * failure is never "rescued" by another backend: an enqueue whose outcome is
 * unknown could otherwise run the same generation twice. A failed cloud
 * enqueue stays pinned and is retried on the same backend by recovery, with a
 * deterministic task name so the queue deduplicates it.
 *
 * Dependencies are injected so the single-dispatch invariant is unit-tested.
 */

export type DispatchableJob = {
  id: string;
  kind: string;
  correlationId: string;
  executionBackend?: string | null;
};

export type DispatchRecord = {
  backend: GenerationDispatchTransport;
  queue: string | null;
  messageId: string | null;
  dispatchedAt: Date | null;
  correlationId: string;
  workload: ExecutionWorkload | null;
  state: 'enqueued' | 'skipped' | 'failed';
  reason: string | null;
};

export type ExecutionDispatchDeps = {
  legacyDispatch(jobId: string): Promise<GenerationDispatchResult>;
  gcpAccessToken(): Promise<GcpAccessTokenResult>;
  gcpDispatch(input: { jobId: string; correlationId: string; workload: ExecutionWorkload }, accessToken: string): Promise<GcpDispatchResult>;
  recordDispatch(jobId: string, record: DispatchRecord): Promise<void>;
  now?: () => Date;
};

export type ExecutionDispatchOutcome = DispatchRecord & { executionBackend: 'legacy' | 'gcp' | 'aws' | 'cloudflare'; dispatched: boolean };

export async function dispatchPinnedGenerationJob(job: DispatchableJob, deps: ExecutionDispatchDeps): Promise<ExecutionDispatchOutcome> {
  const now = deps.now ?? (() => new Date());
  const workload = executionWorkloadForKind(job.kind);
  const base = { correlationId: job.correlationId, workload };
  const pinned = job.executionBackend;

  if (!pinned || pinned === 'legacy') {
    const result = await deps.legacyDispatch(job.id);
    const record: DispatchRecord = {
      ...base,
      backend: result.mode,
      queue: result.mode === 'qstash' ? 'prompt-studio-ai-generation' : null,
      messageId: result.messageId ?? null,
      dispatchedAt: result.dispatched ? now() : null,
      // Not dispatched on legacy == the cron recovery loop picks it up.
      state: result.dispatched ? 'enqueued' : 'skipped',
      reason: result.reason ?? null,
    };
    await deps.recordDispatch(job.id, record);
    return { ...record, executionBackend: 'legacy', dispatched: result.dispatched };
  }

  if (pinned === 'gcp') {
    const fail = async (reason: string, queue: string | null = null): Promise<ExecutionDispatchOutcome> => {
      const record: DispatchRecord = { ...base, backend: 'gcp-cloud-tasks', queue, messageId: null, dispatchedAt: null, state: 'failed', reason };
      await deps.recordDispatch(job.id, record);
      return { ...record, executionBackend: 'gcp', dispatched: false };
    };
    if (!workload) return fail('workload_not_eligible');
    const token = await deps.gcpAccessToken();
    if (!token.ok) return fail(`token_${token.reason}`);
    const result = await deps.gcpDispatch({ jobId: job.id, correlationId: job.correlationId, workload }, token.token);
    if (!result.dispatched) return fail(result.reason ?? 'publish_failed', result.queue);
    const record: DispatchRecord = {
      ...base,
      backend: 'gcp-cloud-tasks',
      queue: result.queue,
      messageId: result.taskName ?? null,
      dispatchedAt: now(),
      state: 'enqueued',
      reason: result.deduplicated ? 'deduplicated' : null,
    };
    await deps.recordDispatch(job.id, record);
    return { ...record, executionBackend: 'gcp', dispatched: true };
  }

  // AWS / Cloudflare are prepared but have no adapter; the selector never pins
  // them. If a job somehow carries one, record it and leave it for recovery.
  const backend: GenerationDispatchTransport = pinned === 'aws' ? 'aws-sqs' : 'cloudflare-queues';
  const record: DispatchRecord = { ...base, backend, queue: null, messageId: null, dispatchedAt: null, state: 'failed', reason: 'adapter_not_implemented' };
  await deps.recordDispatch(job.id, record);
  return { ...record, executionBackend: pinned === 'aws' ? 'aws' : 'cloudflare', dispatched: false };
}
