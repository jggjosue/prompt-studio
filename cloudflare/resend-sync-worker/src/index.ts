const SYNC_ENDPOINT =
  "https://www.prompstudio.com/api/sync-registered-users-to-resend";
const GENERATION_RECOVERY_ENDPOINT =
  "https://www.prompstudio.com/api/ai/jobs/process?limit=1";

interface SecretsStoreSecret {
  get(): Promise<string>;
}

interface Env {
  CRON_SECRET: SecretsStoreSecret;
}

interface ScheduledController {
  cron: string;
  scheduledTime: number;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

interface SyncResponse {
  totalUsers?: number;
  synced?: number;
  skipped?: number;
  errors?: number;
  error?: string;
}

async function syncRegisteredUsers(env: Env): Promise<void> {
  const cronSecret = await env.CRON_SECRET.get();

  if (!cronSecret) {
    throw new Error("CRON_SECRET is unavailable");
  }

  const response = await fetch(SYNC_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const responseText = await response.text();
  let result: SyncResponse = {};

  try {
    result = JSON.parse(responseText) as SyncResponse;
  } catch {
    // Do not log a potentially sensitive non-JSON response body.
  }

  if (!response.ok) {
    console.error("Resend user sync failed", {
      status: response.status,
      error: result.error ?? "Unexpected response",
    });
    throw new Error(`Sync endpoint returned HTTP ${response.status}`);
  }

  console.log("Resend user sync completed", {
    status: response.status,
    totalUsers: result.totalUsers,
    synced: result.synced,
    skipped: result.skipped,
    errors: result.errors,
  });
}

async function recoverGenerationJob(env: Env): Promise<void> {
  const cronSecret = await env.CRON_SECRET.get();

  if (!cronSecret) {
    throw new Error("CRON_SECRET is unavailable");
  }

  const response = await fetch(GENERATION_RECOVERY_ENDPOINT, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const responseText = await response.text();
  let result: { count?: number; processed?: Array<{ status?: string }> } = {};

  try {
    result = JSON.parse(responseText) as typeof result;
  } catch {
    // Do not log a potentially sensitive non-JSON response body.
  }

  if (!response.ok) {
    console.error("AI generation recovery failed", {
      status: response.status,
    });
    throw new Error(`Generation endpoint returned HTTP ${response.status}`);
  }

  console.log("AI generation recovery completed", {
    status: response.status,
    count: result.count ?? 0,
    jobStatus: result.processed?.[0]?.status ?? "idle",
  });
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log("Starting scheduled Cloudflare task", {
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
    });
    const task = controller.cron === "0 15 * * *"
      ? syncRegisteredUsers(env)
      : recoverGenerationJob(env);
    ctx.waitUntil(task);
  },
};
