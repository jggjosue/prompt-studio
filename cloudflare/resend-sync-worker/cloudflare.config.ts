import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "prompt-studio-resend-sync",
    compatibilityDate: "2026-10-02",
    entrypoint,
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        invocationLogs: true,
        persist: true,
      },
    },
    env: {
      CRON_SECRET: bindings.secretsStoreSecret({
        storeId: "60e9d56487ce4e63ac80840707a63400",
        secretName: "CRON_SECRET",
      }),
      // Producer: el cron de recuperación publica IDs de jobs pendientes
      // en la Queue para que el ai-worker los procese con su timeout propio.
      AI_JOBS_QUEUE: bindings.queue<{ jobId: string }>({
        name: "prompt-studio-ai-jobs",
      }),
    },
    triggers: [
      // Cloudflare cron schedules use UTC. This runs daily at 08:00 in Mazatlan.
      triggers.scheduled({ schedule: "0 15 * * *" }),
    ],
  },
});
