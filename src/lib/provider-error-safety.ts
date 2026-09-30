const SECRET_ASSIGNMENT = /((?:api[_-]?key|key|token|authorization|secret|password|cookie)\s*[:=]\s*)([^\s,;]+)/gi;
const BEARER = /bearer\s+[a-z0-9._~+\/-]+/gi;
const LARGE_BLOB = /[a-z0-9+/]{120,}={0,2}/gi;
const SENSITIVE_FIELD = /((?:prompt|contents?|input|requestBody|responseBody)\s*[:=]\s*)("[^"]*"|'[^']*'|[^,;\n]+)/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export function sanitizeProviderErrorMessage(value: unknown): string {
  return text(value, 500)
    .replace(BEARER, 'Bearer [REDACTED]')
    .replace(SECRET_ASSIGNMENT, '$1[REDACTED]')
    .replace(SENSITIVE_FIELD, '$1[REDACTED]')
    .replace(EMAIL, '[REDACTED_EMAIL]')
    .replace(LARGE_BLOB, '[REDACTED_BLOB]')
    .replace(/([?&](?:key|token|secret|signature)=)[^&\s]+/gi, '$1[REDACTED]')
    .slice(0, 240);
}

export function providerHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const candidate = error as { status?: unknown; statusCode?: unknown; $metadata?: { httpStatusCode?: unknown } };
  const status = Number(candidate.status ?? candidate.statusCode ?? candidate.$metadata?.httpStatusCode);
  return Number.isInteger(status) && status >= 100 && status <= 599 ? status : null;
}

export function isRetryableProviderStatus(status: number | null): boolean {
  return status === null || status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

export function safeProviderHost(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase().slice(0, 160);
  } catch {
    return 'invalid-url';
  }
}

async function readLimitedText(response: Response, limit = 4096): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let output = '';
  try {
    while (output.length < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return output.slice(0, limit);
}

export async function safeProviderResponseError(response: Response): Promise<{ code: string; message: string }> {
  const raw = await readLimitedText(response.clone());
  let payload: Record<string, unknown> | null = null;
  try { payload = JSON.parse(raw) as Record<string, unknown>; } catch {}
  const nested = payload?.error && typeof payload.error === 'object' ? payload.error as Record<string, unknown> : null;
  const rawCode = nested?.status ?? nested?.code ?? payload?.status ?? payload?.code;
  const code = String(rawCode ?? '').trim().slice(0, 80).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const message = sanitizeProviderErrorMessage(nested?.message ?? payload?.message ?? raw);
  return { code: code || `HTTP_${response.status}`, message };
}
