import 'server-only';
import { createHash } from 'node:crypto';
import connectToDatabase from '@/lib/mongoose';
import ObservabilityEvent, { type ObservabilityCategory } from '@/models/ObservabilityEvent';
import { anonymizeObservabilityUser, safeErrorCode, sanitizeObservabilityMetadata } from '@/lib/observability-safety';

export type ObservabilityInput = {
  category: ObservabilityCategory;
  name: string;
  route?: string;
  sessionId?: string | null;
  userId?: string | null;
  productId?: string | null;
  value?: number | null;
  unit?: string | null;
  status?: string | null;
  durationMs?: number | null;
  costUsd?: number | null;
  metadata?: Record<string, unknown>;
  fingerprint?: string | null;
};

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;

export function normalizeObservabilityEvent(input: ObservabilityInput, userId?: string | null) {
  const name = text(input.name, 100);
  const route = text(input.route, 240) || 'server';
  if (!name) return null;
  const metadata = sanitizeObservabilityMetadata(input.metadata);
  return { category: input.category, name, route, sessionId: text(input.sessionId, 100) || null, userId: anonymizeObservabilityUser(userId || input.userId), productId: text(input.productId, 120) || null, value: number(input.value), unit: text(input.unit, 20) || null, status: text(input.status, 40) || null, durationMs: number(input.durationMs), costUsd: number(input.costUsd), metadata, fingerprint: text(input.fingerprint, 100) || null, createdAt: new Date() };
}

export async function recordObservabilityEvent(input: ObservabilityInput) {
  try {
    const event = normalizeObservabilityEvent(input);
    if (!event) return;
    await connectToDatabase();
    await ObservabilityEvent.create(event);
  } catch (error) {
    console.warn(JSON.stringify({ level: 'warn', event: 'observability_write_failed', errorCode: safeErrorCode(error) }));
  }
}

export function reportOperationalError(input: Omit<ObservabilityInput, 'status' | 'fingerprint'>, error: unknown) {
  const errorCode = safeErrorCode(error);
  const event = {
    ...input,
    status: 'error',
    fingerprint: errorFingerprint(error, input.name),
    metadata: sanitizeObservabilityMetadata({ ...input.metadata, errorCode }),
  } satisfies ObservabilityInput;
  const normalized = normalizeObservabilityEvent(event);
  console.error(JSON.stringify({
    level: 'error',
    category: normalized?.category,
    operation: normalized?.name,
    route: normalized?.route,
    userId: normalized?.userId,
    durationMs: normalized?.durationMs,
    errorCode,
    correlationId: normalized?.metadata.correlationId ?? normalized?.metadata.jobId ?? null,
    provider: normalized?.metadata.provider ?? null,
  }));
  void recordObservabilityEvent(event);
}

export function errorFingerprint(error: unknown, scope: string) {
  const message = error instanceof Error ? `${error.name}:${error.message}` : String(error);
  return createHash('sha256').update(`${scope}:${message}`).digest('hex').slice(0, 20);
}

export async function observeOperation<T>(input: Omit<ObservabilityInput, 'durationMs' | 'status'>, operation: () => Promise<T>, slowThresholdMs = 750): Promise<T> {
  const started = performance.now();
  try {
    const result = await operation();
    const durationMs = Math.round(performance.now() - started);
    if (input.category !== 'slow_query' || durationMs >= slowThresholdMs) void recordObservabilityEvent({ ...input, durationMs, status: 'success' });
    return result;
  } catch (error) {
    reportOperationalError({ ...input, durationMs: Math.round(performance.now() - started) }, error);
    throw error;
  }
}
