import 'server-only';

import { dispatchPinnedGenerationJob, type DispatchRecord, type ExecutionDispatchOutcome } from '@/lib/ai-execution-dispatch';
import { gcpAccessToken } from '@/lib/gcp-access-token';
import { dispatchGcpGenerationTask } from '@/lib/gcp-generation-dispatch';
import { dispatchGenerationJob } from '@/lib/generation-queue-dispatch';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';

async function recordDispatch(jobId: string, record: DispatchRecord) {
  // `$inc` keeps an audit count of enqueue attempts (initial + recovery).
  await AIGenerationJob.updateOne(
    { _id: jobId },
    {
      $set: {
        'dispatch.backend': record.backend,
        'dispatch.queue': record.queue,
        'dispatch.messageId': record.messageId,
        'dispatch.dispatchedAt': record.dispatchedAt,
        'dispatch.correlationId': record.correlationId,
        'dispatch.workload': record.workload,
        'dispatch.state': record.state,
        'dispatch.reason': record.reason,
        updatedAt: new Date(),
      },
      $inc: { 'dispatch.attempts': 1 },
    },
  );
}

/** Enqueue a freshly reserved job on its pinned backend (exactly one). */
export function dispatchGenerationExecution(
  job: Pick<IAIGenerationJob, '_id' | 'kind' | 'correlationId' | 'executionBackend'>,
  options: { vercelOidcToken?: string | null } = {},
): Promise<ExecutionDispatchOutcome> {
  return dispatchPinnedGenerationJob(
    { id: String(job._id), kind: job.kind, correlationId: job.correlationId || String(job._id), executionBackend: job.executionBackend ?? 'legacy' },
    {
      legacyDispatch: dispatchGenerationJob,
      gcpAccessToken: () => gcpAccessToken({ subjectToken: options.vercelOidcToken }),
      gcpDispatch: (input, token) => dispatchGcpGenerationTask(input, token),
      recordDispatch,
    },
  );
}
