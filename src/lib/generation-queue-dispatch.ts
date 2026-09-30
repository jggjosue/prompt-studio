import 'server-only';

import { queueConfiguration } from '@/lib/generation-queue-policy';
import { verifyQStashJwt } from '@/lib/generation-queue-signature';
import { getSiteUrl } from '@/lib/site-url';

export type GenerationDispatchResult = {
  dispatched: boolean;
  mode: 'qstash' | 'cron-recovery';
  messageId?: string;
  reason?: 'disabled' | 'configuration_missing' | 'publish_failed';
};

const queueDestination = () => {
  const configured = process.env.AI_QUEUE_PROCESS_URL?.trim();
  return new URL(configured || `${getSiteUrl().replace(/\/$/, '')}/api/ai/jobs/process`).toString();
};

export async function dispatchGenerationJob(jobId: string): Promise<GenerationDispatchResult> {
  const configuration = queueConfiguration();
  if (configuration.mode !== 'qstash') {
    return { dispatched: false, mode: 'cron-recovery', reason: 'disabled' };
  }
  if (!configuration.ready) {
    return { dispatched: false, mode: 'cron-recovery', reason: 'configuration_missing' };
  }

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
        'Upstash-Flow-Control-Parallelism': String(configuration.parallelism),
        'Upstash-Flow-Control-Rate': String(configuration.ratePerMinute),
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
