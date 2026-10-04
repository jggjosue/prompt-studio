/**
 * Execution-backend selector for heavy AI generation (#835).
 *
 * "Execution backend" is the infrastructure that queues and runs a job
 * (legacy Vercel/QStash/cron, GCP Cloud Run + Cloud Tasks, AWS, Cloudflare).
 * It is NOT the AI provider/model (Gemini, OpenAI, Runway, Kling...), which
 * stays on the job as `provider`/`modelId` and is chosen independently.
 *
 * Safety contract:
 *  - `legacy` is the default and the only backend that is ever active unless an
 *    operator explicitly selects another one AND enables its flags.
 *  - Exactly one backend is returned per job. There is no dual dispatch.
 *  - Any invalid, ambiguous or incomplete configuration fails safe to `legacy`
 *    for dispatch decisions (`recovery` is reserved for worker-side handling).
 *
 * Pure env logic, no secrets read, no `server-only`, so it is unit-testable.
 */

export const EXECUTION_BACKENDS = ['legacy', 'gcp', 'aws', 'cloudflare', 'recovery'] as const;
export type ExecutionBackend = (typeof EXECUTION_BACKENDS)[number];

export const CLOUD_EXECUTION_BACKENDS = ['gcp', 'aws', 'cloudflare'] as const;
export type CloudExecutionBackend = (typeof CLOUD_EXECUTION_BACKENDS)[number];

export const EXECUTION_WORKLOADS = ['image', 'video', 'web'] as const;
export type ExecutionWorkload = (typeof EXECUTION_WORKLOADS)[number];

export type ExecutionBackendReason =
  | 'default_legacy'
  | 'selected'
  | 'invalid_selector'
  | 'recovery_selected'
  | 'workload_not_eligible'
  | 'kill_switch'
  | 'dispatch_disabled'
  | 'workload_disabled'
  | 'configuration_missing'
  | 'ambiguous_configuration'
  | 'adapter_not_implemented';

export type ExecutionBackendSelection = {
  backend: ExecutionBackend;
  /** The backend the operator asked for, when it differs from the result. */
  requested: ExecutionBackend | null;
  workload: ExecutionWorkload | null;
  reason: ExecutionBackendReason;
  missing: string[];
};

const PREFIX: Record<CloudExecutionBackend, string> = {
  gcp: 'GCP_AI',
  aws: 'AWS_AI',
  cloudflare: 'CLOUDFLARE_AI',
};

/**
 * Non-secret identifiers each backend needs before it may receive traffic.
 * Credentials never live here: GCP uses workload identity, AWS an IAM role,
 * Cloudflare a scoped token read only by its adapter.
 */
export const EXECUTION_BACKEND_REQUIRED_CONFIG: Record<CloudExecutionBackend, readonly string[]> = {
  gcp: ['GCP_AI_PROJECT_ID', 'GCP_AI_REGION', 'GCP_AI_WORKER_URL', 'GCP_AI_QUEUE_INVOKER_SERVICE_ACCOUNT'],
  aws: ['AWS_AI_REGION', 'AWS_AI_IMAGE_QUEUE_URL', 'AWS_AI_VIDEO_QUEUE_URL', 'AWS_AI_WEB_QUEUE_URL'],
  cloudflare: ['CLOUDFLARE_AI_ACCOUNT_ID', 'CLOUDFLARE_AI_IMAGE_QUEUE_ID', 'CLOUDFLARE_AI_VIDEO_QUEUE_ID', 'CLOUDFLARE_AI_WEB_QUEUE_ID'],
};

/**
 * Backends whose enqueue adapter exists in code. AWS and Cloudflare are
 * prepared (flags, config contract, payload) but cannot receive traffic until
 * an adapter lands, even if every flag is flipped by mistake.
 */
export const IMPLEMENTED_EXECUTION_BACKENDS: ReadonlySet<CloudExecutionBackend> = new Set(['gcp']);

const isTrue = (value: string | undefined) => value?.trim().toLowerCase() === 'true';

export function isCloudExecutionBackend(value: unknown): value is CloudExecutionBackend {
  return typeof value === 'string' && (CLOUD_EXECUTION_BACKENDS as readonly string[]).includes(value);
}

/** Maps a persisted job kind to the heavy workload it belongs to, if any. */
export function executionWorkloadForKind(kind: string): ExecutionWorkload | null {
  if (kind === 'image') return 'image';
  if (kind === 'video') return 'video';
  if (kind === 'project' || kind === 'web') return 'web';
  return null;
}

export function cloudBackendFlags(backend: CloudExecutionBackend, env: NodeJS.ProcessEnv = process.env) {
  const prefix = PREFIX[backend];
  return {
    dispatchEnabled: isTrue(env[`${prefix}_DISPATCH_ENABLED`]),
    killSwitch: isTrue(env[`${prefix}_KILL_SWITCH`]),
    image: isTrue(env[`${prefix}_IMAGE_ENABLED`]),
    video: isTrue(env[`${prefix}_VIDEO_ENABLED`]),
    web: isTrue(env[`${prefix}_WEB_ENABLED`]),
  };
}

export function cloudBackendWorkloadEnabled(
  backend: CloudExecutionBackend,
  workload: ExecutionWorkload,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const flags = cloudBackendFlags(backend, env);
  return !flags.killSwitch && flags.dispatchEnabled && flags[workload];
}

export function missingBackendConfig(backend: CloudExecutionBackend, env: NodeJS.ProcessEnv = process.env): string[] {
  return EXECUTION_BACKEND_REQUIRED_CONFIG[backend].filter(name => !env[name]?.trim());
}

/** Raw operator selector. Unset means legacy; anything unknown is invalid. */
export function requestedExecutionBackend(env: NodeJS.ProcessEnv = process.env): ExecutionBackend | 'invalid' {
  const raw = env.AI_EXECUTION_BACKEND?.trim().toLowerCase();
  if (!raw) return 'legacy';
  return (EXECUTION_BACKENDS as readonly string[]).includes(raw) ? (raw as ExecutionBackend) : 'invalid';
}

const legacy = (
  reason: ExecutionBackendReason,
  requested: ExecutionBackend | null,
  workload: ExecutionWorkload | null,
  missing: string[] = [],
): ExecutionBackendSelection => ({ backend: 'legacy', requested, workload, reason, missing });

/**
 * Chooses exactly ONE initial execution backend for a new job.
 *
 * The result is pinned on the job at dispatch time; later retries and
 * recovery reuse the pinned backend instead of calling this again, so a flag
 * flip mid-flight can never move a job to a second backend.
 */
export function selectExecutionBackend(input: {
  kind: string;
  env?: NodeJS.ProcessEnv;
}): ExecutionBackendSelection {
  const env = input.env ?? process.env;
  const workload = executionWorkloadForKind(input.kind);
  const requested = requestedExecutionBackend(env);

  if (requested === 'invalid') return legacy('invalid_selector', null, workload);
  if (requested === 'legacy') return legacy('default_legacy', null, workload);
  // `recovery` means "do not dispatch immediately"; for a new job the safe
  // equivalent is the legacy path, whose cron is the recovery loop today.
  if (requested === 'recovery') return legacy('recovery_selected', 'recovery', workload);
  if (!workload) return legacy('workload_not_eligible', requested, workload);

  // Two clouds with dispatch enabled at once is a misconfiguration, even if
  // the selector names one of them: refuse to guess.
  const enabledClouds = CLOUD_EXECUTION_BACKENDS.filter(backend => cloudBackendFlags(backend, env).dispatchEnabled);
  if (enabledClouds.length > 1) return legacy('ambiguous_configuration', requested, workload);

  const flags = cloudBackendFlags(requested, env);
  if (flags.killSwitch) return legacy('kill_switch', requested, workload);
  if (!flags.dispatchEnabled) return legacy('dispatch_disabled', requested, workload);
  if (!flags[workload]) return legacy('workload_disabled', requested, workload);
  if (!IMPLEMENTED_EXECUTION_BACKENDS.has(requested)) return legacy('adapter_not_implemented', requested, workload);
  const missing = missingBackendConfig(requested, env);
  if (missing.length) return legacy('configuration_missing', requested, workload, missing);

  return { backend: requested, requested, workload, reason: 'selected', missing: [] };
}

/**
 * Worker-side guard: a worker for `backend` may only execute jobs pinned to
 * it. Kill switch active => the worker refuses new execution and the job is
 * left for recovery (never re-routed to another backend).
 */
export function workerMayExecute(input: {
  workerBackend: CloudExecutionBackend;
  jobBackend: string | null | undefined;
  workload: ExecutionWorkload | null;
  env?: NodeJS.ProcessEnv;
}): { allowed: true } | { allowed: false; reason: 'backend_mismatch' | 'kill_switch' | 'workload_not_eligible' } {
  const env = input.env ?? process.env;
  if (input.jobBackend !== input.workerBackend) return { allowed: false, reason: 'backend_mismatch' };
  if (!input.workload) return { allowed: false, reason: 'workload_not_eligible' };
  if (cloudBackendFlags(input.workerBackend, env).killSwitch) return { allowed: false, reason: 'kill_switch' };
  return { allowed: true };
}
