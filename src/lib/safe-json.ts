/**
 * Parses the JSON body of a Response safely.
 * Returns null (instead of throwing) when:
 *  - the body is empty
 *  - the content-type is not JSON
 *  - the JSON is malformed
 */
export async function safeJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await response.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable error message from a parsed API response body.
 */
export function extractErrorMessage(data: Record<string, unknown> | null, fallback: string): string {
  if (!data) return fallback;
  const err = data.error;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
  }
  return fallback;
}
