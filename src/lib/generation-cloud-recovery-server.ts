import 'server-only';

import { executionWorkloadForKind } from '@/lib/ai-execution-backend-policy';
import { refundCredits } from '@/lib/ai-job-service';
import { gcpAccessToken } from '@/lib/gcp-access-token';
import { dispatchGcpGenerationTask } from '@/lib/gcp-generation-dispatch';
import { runCloudRecovery, type CloudRecoverySummary } from '@/lib/generation-cloud-recovery';
import { dispatchGenerationJob } from '@/lib/generation-queue-dispatch';
import { recordObservabilityEvent } from '@/lib/observability-server';
import AIGenerationJob, { type IAIGenerationJob } from '@/models/AIGenerationJob';

/** Cloud-backend recovery pass, run by the legacy watchdog (#838). */
export function runGenerationCloudRecovery(route = '/api/ai/jobs/sweep'): Promise<CloudRecoverySummary> {
  return runCloudRecovery<IAIGenerationJob>({
    claimOne: (filter, update) => AIGenerationJob.findOneAndUpdate(filter, update, { sort: { nextAttemptAt: 1 }, returnDocument: 'after' }),
    find: (filter, limit) => AIGenerationJob.find(filter).sort({ updatedAt: 1 }).limit(limit),
    redispatch: async (job, backend, deliveryKey) => {
      const workload = executionWorkloadForKind(job.kind);
      if (backend !== 'gcp') return { dispatched: false, reason: 'adapter_not_implemented' };
      if (!workload) return { dispatched: false, reason: 'workload_not_eligible' };
      const token = await gcpAccessToken();
      if (!token.ok) return { dispatched: false, reason: `token_${token.reason}` };
      const result = await dispatchGcpGenerationTask(
        { jobId: String(job._id), correlationId: job.correlationId || String(job._id), workload, deliveryKey },
        token.token,
        { force: true },
      );
      if (result.dispatched) {
        await AIGenerationJob.updateOne({ _id: job._id }, { $set: { 'dispatch.state': 'enqueued', 'dispatch.messageId': result.taskName ?? null, 'dispatch.dispatchedAt': new Date(), 'dispatch.reason': 'recovered' } });
      }
      return { dispatched: result.dispatched, reason: result.reason ?? null };
    },
    legacyDispatch: async job => {
      const result = await dispatchGenerationJob(String(job._id));
      await AIGenerationJob.updateOne({ _id: job._id }, { $set: { 'dispatch.backend': result.mode, 'dispatch.state': result.dispatched ? 'enqueued' : 'skipped', 'dispatch.messageId': result.messageId ?? null } });
    },
    release: job => refundCredits(job),
    report: event => {
      void recordObservabilityEvent({ category: 'ai_generation', name: event.name, route, metadata: { jobId: event.jobId, executionBackend: event.backend ?? null, reason: event.reason ?? null } });
    },
  });
}
