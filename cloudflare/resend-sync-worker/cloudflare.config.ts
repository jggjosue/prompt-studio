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
    },
    triggers: [
      // Cloudflare cron schedules use UTC. This runs daily at 08:00 in Mazatlan.
      triggers.scheduled({ schedule: "0 15 * * *" }),
      // Recover one queued/retryable AI job every five minutes.
      triggers.scheduled({ schedule: "*/5 * * * *" }),
    ],
  },
});
