import 'server-only';

import { queueConfiguration } from '@/lib/generation-queue-policy';
import { verifyQStashJwt } from '@/lib/generation-queue-signature';
import { getSiteUrl } from '@/lib/site-url';

export type GenerationDispatchResult = {
  dispatched: boolean;
  mode: 'qstash' | 'cloudflare-queue' | 'cron-recovery';
  messageId?: string;
  reason?: 'disabled' | 'configuration_missing' | 'publish_failed';
};

// ─── QStash backend ──────────────────────────────────────────────────────────

const queueDestination = () => {
  const configured = process.env.AI_QUEUE_PROCESS_URL?.trim();
  return new URL(configured || `${getSiteUrl().replace(/\/$/, '')}/api/ai/jobs/process`).toString();
};

async function dispatchViaQStash(
  jobId: string,
  parallelism: number,
  ratePerMinute: number,
): Promise<GenerationDispatchResult> {
  try {
    const destination = queueDestination();
    const response = await fetch(`https://qstash.upstash.io/v2/publish/${destination}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        'Upstash-Content-Based-Deduplication': 'true',
        'Upstash-Retries': '3',
        'Upstash-Timeout': '300s',
        'Upstash-Label': `ai-generation,job-${jobId}`,
        'Upstash-Flow-Control-Key': 'prompt-studio-ai-generation',
        'Upstash-Flow-Control-Parallelism': String(parallelism),
        'Upstash-Flow-Control-Rate': String(ratePerMinute),
        'Upstash-Flow-Control-Period': '1m',
      },
      body: JSON.stringify({ jobId }),
    });
    if (!response.ok) throw new Error(`QStash publish failed (${response.status})`);
    const published = await response.json() as { messageId?: unknown };
    if (typeof published.messageId !== 'string') throw new Error('QStash response has no messageId');
    return { dispatched: true, mode: 'qstash', messageId: published.messageId };
  } catch {
    return { dispatched: false, mode: 'cron-recovery', reason: 'publish_failed' };
  }
}

// ─── Cloudflare Queues REST API backend ──────────────────────────────────────
//
// Cloudflare Queues HTTP API: POST /client/v4/accounts/{account_id}/queues/{queue_id}/messages
// https://developers.cloudflare.com/api/resources/queues/subresources/messages/methods/push/
//
// Variables de entorno necesarias:
//   CF_QUEUE_API_TOKEN  — API token con permisos Workers Queue Write
//   CF_ACCOUNT_ID       — ID de cuenta Cloudflare
//   CF_AI_JOBS_QUEUE_ID — ID de la Queue (no el nombre; se obtiene en el dashboard)

async function dispatchViaCloudflareQueue(jobId: string): Promise<GenerationDispatchResult> {
  const token = process.env.CF_QUEUE_API_TOKEN?.trim();
  const accountId = process.env.CF_ACCOUNT_ID?.trim();
  const queueId = process.env.CF_AI_JOBS_QUEUE_ID?.trim();

  // Validación de guardia (la policy ya lo comprueba, pero es defensivo)
  if (!token || !accountId || !queueId) {
    return { dispatched: false, mode: 'cron-recovery', reason: 'configuration_missing' };
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/queues/${queueId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // La API acepta un array de mensajes; enviamos uno por job para
      // garantizar deduplicación y trazabilidad individual.
      body: JSON.stringify({
        messages: [
          {
            body: { jobId },
            // content-based dedup: mismo jobId = mismo mensaje idempotente
            // (Cloudflare Queues deduplica por contenido automáticamente
            //  dentro de la ventana de deduplicación de 24 h si está activado)
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`CF Queues publish failed (${response.status}): ${text.slice(0, 200)}`);
    }

    // La respuesta incluye { result: { message_count: number } }
    const published = await response.json() as { result?: { message_count?: number } };
    const count = published.result?.message_count ?? 0;
    if (count === 0) throw new Error('CF Queues accepted 0 messages');

    return { dispatched: true, mode: 'cloudflare-queue', messageId: `cf-queue:${jobId}` };
  } catch (err) {
    console.error('[dispatchViaCloudflareQueue] error:', err instanceof Error ? err.message : err);
    return { dispatched: false, mode: 'cron-recovery', reason: 'publish_failed' };
  }
}

// ─── Unified dispatcher ───────────────────────────────────────────────────────

export async function dispatchGenerationJob(jobId: string): Promise<GenerationDispatchResult> {
  const configuration = queueConfiguration();

  if (!configuration.ready) {
    const reason = configuration.mode === 'cron-recovery' ? 'disabled' : 'configuration_missing';
    return { dispatched: false, mode: 'cron-recovery', reason };
  }

  if (configuration.mode === 'cloudflare-queue') {
    return dispatchViaCloudflareQueue(jobId);
  }

  // Default: QStash
  return dispatchViaQStash(jobId, configuration.parallelism, configuration.ratePerMinute);
}

// ─── QStash signature verification ───────────────────────────────────────────
// Solo aplica para el modo QStash; el Worker de CF usa CRON_SECRET en su lugar.

export async function verifyGenerationQueueRequest(request: Request): Promise<{ verified: boolean; jobId?: string }> {
  const configuration = queueConfiguration();
  const signature = request.headers.get('upstash-signature')?.trim();
  if (!configuration.ready || !signature) return { verified: false };

  const body = await request.clone().text();
  const signatureIsValid = [process.env.QSTASH_CURRENT_SIGNING_KEY!, process.env.QSTASH_NEXT_SIGNING_KEY!]
    .some(key => verifyQStashJwt(signature, body, request.url, key));
  if (!signatureIsValid) return { verified: false };
  try {
    const payload = JSON.parse(body) as { jobId?: unknown };
    return { verified: true, jobId: typeof payload.jobId === 'string' ? payload.jobId.trim() : undefined };
  } catch {
    return { verified: false };
  }
}

