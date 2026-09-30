import { createHash } from 'node:crypto';

const PRIVATE_KEY = /(prompt|api.?key|authorization|credential|secret|token|password|email|imageData|requestBody|responseBody)/i;
const SAFE_METADATA_KEYS = new Set([
  'provider', 'operation', 'kind', 'model', 'attempts', 'jobId', 'correlationId',
  'errorCode', 'httpStatus', 'eventId', 'eventType', 'method', 'routerKind',
  'routeType', 'cached', 'host', 'productKind', 'stripeSessionId',
  'service', 'endpointLabel', 'modelId', 'retryable', 'providerErrorCode',
  'providerErrorMessage', 'requestId', 'finishReason', 'hasText', 'hasInlineData',
  'mimeType', 'base64Length', 'byteLength', 'storageKind', 'storageOutcome',
  'creditsEstimated', 'creditsState', 'creditOperation', 'errorCategory',
]);

const cleanText = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export function anonymizeObservabilityUser(userId: unknown): string | null {
  const value = cleanText(userId, 200);
  if (!value) return null;
  return `usr_${createHash('sha256').update(`prompt-studio-observability:${value}`).digest('hex').slice(0, 20)}`;
}

export function safeErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return 'UNKNOWN_ERROR';
  const candidate = error as { code?: unknown; status?: unknown; statusCode?: unknown; name?: unknown; $metadata?: { httpStatusCode?: unknown } };
  return cleanText(candidate.code ?? candidate.status ?? candidate.statusCode ?? candidate.$metadata?.httpStatusCode ?? candidate.name, 60).replace(/[^a-zA-Z0-9_.-]/g, '_') || 'UNKNOWN_ERROR';
}

export function sanitizeObservabilityMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => SAFE_METADATA_KEYS.has(key) && !PRIVATE_KEY.test(key))
      .slice(0, 20)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? cleanText(value, 160) :
          typeof value === 'number' && Number.isFinite(value) ? value :
            typeof value === 'boolean' ? value : null,
      ])
  );
}
