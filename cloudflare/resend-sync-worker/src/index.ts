const SYNC_ENDPOINT =
  "https://www.prompstudio.com/api/sync-registered-users-to-resend";
const GENERATION_PROCESSOR_ENDPOINT =
  "https://www.prompstudio.com/api/ai/jobs/process";

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

function isAuthorized(request: Request, cronSecret: string): boolean {
  const authorization = request.headers.get("Authorization")?.trim();
  return authorization === `Bearer ${cronSecret}`;
}

async function proxyGenerationRequest(request: Request, env: Env): Promise<Response> {
  const cronSecret = await env.CRON_SECRET.get();
  if (!cronSecret || !isAuthorized(request, cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const upstreamUrl = `${GENERATION_PROCESSOR_ENDPOINT}${url.search}`;
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${cronSecret}`);
  headers.delete("Host");

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
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

// (Sweep removed by user request to avoid polling costs)

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/ai/jobs/process" || !["GET", "POST"].includes(request.method)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    try {
      return await proxyGenerationRequest(request, env);
    } catch (error) {
      console.error("AI generation proxy failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return Response.json({ error: "Generation service unavailable" }, { status: 502 });
    }
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    console.log("Starting scheduled Cloudflare task", {
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
    });
    if (controller.cron === "0 15 * * *") {
      ctx.waitUntil(syncRegisteredUsers(env));
    }
  },
};
