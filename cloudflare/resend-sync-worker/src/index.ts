const SYNC_ENDPOINT =
  "https://www.prompstudio.com/api/sync-registered-users-to-resend";

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

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log("Starting scheduled Resend user sync", {
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
    });
    ctx.waitUntil(syncRegisteredUsers(env));
  },
};
