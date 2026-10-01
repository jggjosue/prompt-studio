import 'server-only';

export type GcpGenerationWorkload = 'image' | 'video' | 'web';

const enabled = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export function gcpWorkloadEnabled(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env): boolean {
  if (enabled(env.GCP_AI_KILL_SWITCH)) return false;
  if (!enabled(env.GCP_AI_DISPATCH_ENABLED)) return false;
  if (workload === 'image') return enabled(env.GCP_AI_IMAGE_ENABLED);
  if (workload === 'video') return enabled(env.GCP_AI_VIDEO_ENABLED);
  return enabled(env.GCP_AI_WEB_ENABLED);
}

export function gcpQueueFor(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env): string {
  const value = workload === 'image' ? env.GCP_AI_IMAGE_QUEUE : workload === 'video' ? env.GCP_AI_VIDEO_QUEUE : env.GCP_AI_WEB_QUEUE;
  return value?.trim() || `ps-ai-${workload}`;
}

export function gcpDispatchReady(workload: GcpGenerationWorkload, env: NodeJS.ProcessEnv = process.env) {
  const required = ['GCP_AI_PROJECT_ID','GCP_AI_REGION','GCP_AI_WORKER_URL','GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT'];
  const missing = required.filter(name=>!env[name]?.trim());
  return { enabled: gcpWorkloadEnabled(workload,env), ready: missing.length===0, missing, queue:gcpQueueFor(workload,env) };
}
