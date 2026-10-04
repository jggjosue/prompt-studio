/**
 * Short-lived Google access tokens for enqueuing Cloud Tasks (#835).
 *
 * No long-lived service-account JSON keys, ever:
 *  - On Cloud Run (K_SERVICE set) the attached service account token comes
 *    from the metadata server.
 *  - On Vercel, the per-request Vercel OIDC token is exchanged through Google
 *    Workload Identity Federation (STS) and then used to impersonate the
 *    narrowly scoped dispatcher service account (iamcredentials
 *    generateAccessToken). Only that account may enqueue tasks.
 *
 * Tokens are cached in memory until shortly before expiry. Token values are
 * never logged or returned in errors.
 */

export type GcpTokenFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type GcpAccessTokenSource = 'metadata' | 'workload-identity-federation';

export type GcpAccessTokenResult =
  | { ok: true; token: string; source: GcpAccessTokenSource }
  | { ok: false; reason: 'not_configured' | 'subject_token_missing' | 'exchange_failed' };

const METADATA_TOKEN_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
const STS_URL = 'https://sts.googleapis.com/v1/token';
const CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const EXPIRY_SKEW_MS = 60_000;

let cached: { token: string; source: GcpAccessTokenSource; expiresAt: number } | null = null;

export function resetGcpAccessTokenCache() {
  cached = null;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!response.ok) throw new Error(`gcp_token_http_${response.status}`);
  return await response.json() as Record<string, unknown>;
}

function remember(token: unknown, expiresInSeconds: unknown, source: GcpAccessTokenSource, now: number): GcpAccessTokenResult {
  if (typeof token !== 'string' || !token) return { ok: false, reason: 'exchange_failed' };
  const ttlMs = (typeof expiresInSeconds === 'number' && expiresInSeconds > 0 ? expiresInSeconds : 300) * 1000;
  cached = { token, source, expiresAt: now + ttlMs };
  return { ok: true, token, source };
}

export async function gcpAccessToken(input: {
  env?: NodeJS.ProcessEnv;
  /** Vercel OIDC token for this request (`x-vercel-oidc-token` header). */
  subjectToken?: string | null;
  fetchImpl?: GcpTokenFetch;
  now?: () => number;
} = {}): Promise<GcpAccessTokenResult> {
  const env = input.env ?? process.env;
  const fetchImpl = input.fetchImpl ?? fetch;
  const now = input.now ?? Date.now;
  if (cached && cached.expiresAt - EXPIRY_SKEW_MS > now()) return { ok: true, token: cached.token, source: cached.source };

  try {
    if (env.K_SERVICE?.trim()) {
      const body = await readJson(await fetchImpl(METADATA_TOKEN_URL, { headers: { 'Metadata-Flavor': 'Google' } }));
      return remember(body.access_token, body.expires_in, 'metadata', now());
    }

    const provider = env.GCP_AI_WIF_PROVIDER?.trim();
    const dispatcher = env.GCP_AI_DISPATCHER_SERVICE_ACCOUNT?.trim();
    if (!provider || !dispatcher) return { ok: false, reason: 'not_configured' };
    const subjectToken = input.subjectToken?.trim() || env.VERCEL_OIDC_TOKEN?.trim();
    if (!subjectToken) return { ok: false, reason: 'subject_token_missing' };

    const federated = await readJson(await fetchImpl(STS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
        audience: `//iam.googleapis.com/${provider}`,
        scope: CLOUD_PLATFORM_SCOPE,
        requestedTokenType: 'urn:ietf:params:oauth:token-type:access_token',
        subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt',
        subjectToken,
      }),
    }));
    if (typeof federated.access_token !== 'string') return { ok: false, reason: 'exchange_failed' };

    const impersonated = await readJson(await fetchImpl(
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(dispatcher)}:generateAccessToken`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${federated.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: [CLOUD_PLATFORM_SCOPE], lifetime: '600s' }),
      },
    ));
    const expireTime = typeof impersonated.expireTime === 'string' ? Date.parse(impersonated.expireTime) : NaN;
    const expiresIn = Number.isFinite(expireTime) ? Math.max(0, Math.floor((expireTime - now()) / 1000)) : 600;
    return remember(impersonated.accessToken, expiresIn, 'workload-identity-federation', now());
  } catch {
    return { ok: false, reason: 'exchange_failed' };
  }
}
