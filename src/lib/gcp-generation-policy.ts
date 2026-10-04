import {
  cloudBackendWorkloadEnabled,
  missingBackendConfig,
  type ExecutionWorkload,
} from '@/lib/ai-execution-backend-policy';

// Pure env policy shared with the multi-backend selector. It reads no secret
// values, so it intentionally does not import `server-only` (keeps it testable).

export type GcpGenerationWorkload = ExecutionWorkload;

export function gcpWorkloadEnabled(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env): boolean {
  return cloudBackendWorkloadEnabled('gcp', workload, env);
}

export function gcpQueueFor(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env): string {
  const value = workload === 'image' ? env.GCP_AI_IMAGE_QUEUE : workload === 'video' ? env.GCP_AI_VIDEO_QUEUE : env.GCP_AI_WEB_QUEUE;
  return value?.trim() || `ps-ai-${workload}`;
}

export function gcpDispatchReady(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env) {
  const missing = missingBackendConfig('gcp', env);
  return { enabled: gcpWorkloadEnabled(workload, env), ready: missing.length === 0, missing, queue: gcpQueueFor(workload, env) };
}
