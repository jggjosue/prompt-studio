import { bindings, defineConfig, triggers } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "prompt-studio-ai",
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
    // ── Triggers ────────────────────────────────────────────────────────────
    // El Worker consume mensajes de la Queue de AI Jobs.
    // Next.js (o cualquier productor) publica { jobId } en esta Queue
    // en lugar de usar QStash/cron, obteniendo reintentos y dead-letter nativos.
    triggers: [
      triggers.queue({
        name: "prompt-studio-ai-jobs",
        // Procesar de uno en uno para que cada job tenga el timeout completo
        maxBatchSize: 1,
        // Reintentos gestionados por la Queue antes de enviar al DLQ
        maxRetries: 3,
        // DLQ para inspección manual de jobs fallidos
        deadLetterQueue: "prompt-studio-ai-jobs-dlq",
      }),
    ],
    // ── Environment bindings ─────────────────────────────────────────────────
    env: {
      CRON_SECRET: bindings.secretsStoreSecret({
        storeId: "60e9d56487ce4e63ac80840707a63400",
        secretName: "CRON_SECRET",
      }),
      // Producer: el Worker puede re-encolar jobs si es necesario
      AI_JOBS_QUEUE: bindings.queue<{ jobId: string }>({
        name: "prompt-studio-ai-jobs",
      }),
      // NEXTJS_UPSTREAM_URL se configura como plain-text var en el dashboard
      // de Cloudflare o con `wrangler secret put`. No requiere Secrets Store.
    },
  },
});

