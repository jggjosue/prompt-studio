import 'server-only';

import { callPlannerModel, resolvePlannerModel } from '@/lib/ai-site-plan';
import { putR2Object } from '@/lib/r2-storage';
import { runSitePlanJobCore, SITE_PLAN_WORKFLOW } from '@/lib/site-plan-job-core';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

export { SITE_PLAN_WORKFLOW };

export function isSitePlanJob(job: Pick<IAIGenerationJob, 'kind' | 'input'>) {
  return job.kind === 'project' && job.input?.workflow === SITE_PLAN_WORKFLOW;
}

/** Executes a page-composer site plan inside the shared generation runtime. */
export function runSitePlanJob(job: IAIGenerationJob): Promise<Record<string, unknown>> {
  const request = typeof job.input.prompt === 'string' ? job.input.prompt : '';
  const model = resolvePlannerModel(job.provider, job.modelId ?? undefined);
  return runSitePlanJobCore(
    { userId: job.userId, jobId: String(job._id), request, provider: job.provider, model },
    {
      callModel: (system, user, activeModel) => callPlannerModel(job.provider, activeModel, system, user),
      storeSchema: (key, json) => putR2Object(key, Buffer.from(json, 'utf8'), 'application/json'),
    },
  );
}
