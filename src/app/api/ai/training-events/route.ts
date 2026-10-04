import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { TrainingCaptureError, captureClientTrainingEvent } from '@/lib/training/capture';
import { TrainingEventValidationError, parseClientTrainingEvent } from '@/lib/training/event-contract';
import { emitTrainingMetric, metricReason } from '@/lib/training/training-metrics';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');
/** Events are small; anything larger is not an event. */
const MAX_BODY_BYTES = 16_384;
const MAX_BATCH = 25;
const EVENTS_LIMIT = { limit: 120, windowMs: 60_000 };

/**
 * POST /api/ai/training-events
 *
 * Ingests /generate UI events (contract: src/lib/training/event-contract.ts).
 * Accepts one event or `{ events: [...] }`. Each event is validated against a
 * strict allowlist: prompt text, keystrokes, user IDs and provider/model values
 * are rejected. The referenced generation must belong to the caller.
 *
 * Responses never echo submitted values; rejected events report a code only.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });

  const quota = await rateLimit({ key: `training-events:${userId}`, ...EVENTS_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const text = await request.text().catch(() => '');
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: { code: 'EVENT_TOO_LARGE' } }, { status: 413, headers: headers() });
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_JSON' } }, { status: 400, headers: headers() });
  }
  const events = body && typeof body === 'object' && !Array.isArray(body) && Array.isArray((body as { events?: unknown }).events)
    ? (body as { events: unknown[] }).events
    : [body];
  if (events.length === 0 || events.length > MAX_BATCH) {
    return NextResponse.json({ error: { code: 'INVALID_BATCH_SIZE' } }, { status: 400, headers: headers() });
  }

  const now = new Date();
  const results: Array<{ index: number; accepted: boolean; code?: string }> = [];
  for (const [index, raw] of events.entries()) {
    try {
      const event = parseClientTrainingEvent(raw, now);
      const outcome = await captureClientTrainingEvent(userId, event, now);
      // Not capturing for a user without training consent is a normal outcome, not an error.
      results.push({ index, accepted: true, ...(outcome.captured ? {} : { code: outcome.reason }) });
    } catch (error) {
      const code = error instanceof TrainingEventValidationError || error instanceof TrainingCaptureError
        ? error.code
        : 'CAPTURE_FAILED';
      emitTrainingMetric('training_events_rejected_total', 1, { source: 'client', reason: metricReason(code) });
      results.push({ index, accepted: false, code });
    }
  }
  const allRejected = results.every((result) => !result.accepted);
  const status = allRejected ? (results.some((r) => r.code === 'CAPTURE_FAILED') ? 503 : 400) : 202;
  return NextResponse.json({ results }, { status, headers: headers() });
}
