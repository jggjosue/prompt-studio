#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import {
  GOOGLE_IMAGE_API_VERSION,
  GOOGLE_IMAGE_MODEL,
  RETIRED_GOOGLE_IMAGE_MODELS,
} from '../../src/lib/google-image-config';

type Environment = Record<string, string | undefined>;
type FetchLike = typeof fetch;

export type CredentialSelection =
  | { ok: true; name: 'GEMINI_API_KEY' | 'GOOGLE_API_KEY'; value: string; duplicate: boolean }
  | { ok: false; reason: 'missing' | 'conflicting' };

export type ProviderProbe = {
  ok: boolean;
  httpStatus: number | null;
  providerStatus: string | null;
  providerReason: string | null;
  providerService: string | null;
};

export function selectGoogleCredential(env: Environment): CredentialSelection {
  const gemini = env.GEMINI_API_KEY?.trim();
  const google = env.GOOGLE_API_KEY?.trim();
  if (!gemini && !google) return { ok: false, reason: 'missing' };
  if (gemini && google && gemini !== google) return { ok: false, reason: 'conflicting' };
  return {
    ok: true,
    name: gemini ? 'GEMINI_API_KEY' : 'GOOGLE_API_KEY',
    value: gemini || google || '',
    duplicate: Boolean(gemini && google),
  };
}

function safeToken(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Z0-9_.:/-]{1,100}$/i.test(value)
    ? value
    : null;
}

export function safeGoogleError(payload: unknown): Omit<ProviderProbe, 'ok' | 'httpStatus'> {
  const root = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const error = root.error && typeof root.error === 'object'
    ? root.error as Record<string, unknown>
    : {};
  const details = Array.isArray(error.details) ? error.details : [];
  let providerReason: string | null = null;
  let providerService: string | null = null;
  for (const detail of details) {
    if (!detail || typeof detail !== 'object') continue;
    const record = detail as Record<string, unknown>;
    providerReason ||= safeToken(record.reason);
    const metadata = record.metadata && typeof record.metadata === 'object'
      ? record.metadata as Record<string, unknown>
      : {};
    providerService ||= safeToken(metadata.service);
  }
  return {
    providerStatus: safeToken(error.status),
    providerReason,
    providerService,
  };
}

export async function probeGoogleImageModel(
  apiKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<ProviderProbe> {
  const endpoint = `https://generativelanguage.googleapis.com/${GOOGLE_IMAGE_API_VERSION}/models/${GOOGLE_IMAGE_MODEL}`;
  try {
    const response = await fetchImpl(endpoint, {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(20_000),
    });
    const payload = await response.json().catch(() => null);
    const safeError = safeGoogleError(payload);
    return {
      ok: response.ok,
      httpStatus: response.status,
      ...safeError,
    };
  } catch {
    return {
      ok: false,
      httpStatus: null,
      providerStatus: 'NETWORK_ERROR',
      providerReason: null,
      providerService: 'generativelanguage.googleapis.com',
    };
  }
}

function providerFailure(probe: ProviderProbe): string {
  const fields = [
    probe.httpStatus === null ? null : `HTTP ${probe.httpStatus}`,
    probe.providerStatus,
    probe.providerReason,
    probe.providerService,
  ].filter(Boolean);
  return fields.join(' · ') || 'respuesta no reconocida';
}

export async function verifyGeminiProduction(
  env: Environment = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<number> {
  let failed = false;
  const fail = (message: string) => { failed = true; console.error(`✗ ${message}`); };
  const pass = (message: string) => console.log(`✓ ${message}`);
  const warn = (message: string) => console.warn(`! ${message}`);

  console.log('\nGemini production preflight (secret values are never printed)\n');

  if (env.VERCEL_ENV === 'production') {
    pass('Vercel scope: Production');
  } else if (env.VERCEL_ENV) {
    fail(`Vercel scope is ${env.VERCEL_ENV}; expected production`);
  } else {
    warn('VERCEL_ENV is absent; credential scope and deployed revision cannot be proven locally');
  }

  const deployedSha = env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (deployedSha) pass(`Deployment revision detected: ${deployedSha.slice(0, 12)}`);
  else warn('VERCEL_GIT_COMMIT_SHA is absent; run this check in the production deployment');

  if (RETIRED_GOOGLE_IMAGE_MODELS.has(GOOGLE_IMAGE_MODEL)) {
    fail(`Configured image model is retired: ${GOOGLE_IMAGE_MODEL}`);
  } else {
    pass(`Provider/model/API: google · ${GOOGLE_IMAGE_MODEL} · ${GOOGLE_IMAGE_API_VERSION}`);
  }

  const credential = selectGoogleCredential(env);
  if (!credential.ok) {
    fail(credential.reason === 'missing'
      ? 'Neither GEMINI_API_KEY nor GOOGLE_API_KEY is configured'
      : 'GEMINI_API_KEY and GOOGLE_API_KEY contain different values; runtime precedence is ambiguous');
    return 1;
  }

  pass(`Credential present: ${credential.name} (value redacted)`);
  if (credential.duplicate) warn('Both supported variable names are set to the same value; keep one canonical variable');

  const probe = await probeGoogleImageModel(credential.value, fetchImpl);
  if (probe.ok) {
    pass(`Google authenticated and exposes ${GOOGLE_IMAGE_MODEL}`);
  } else {
    fail(`Google credential/model probe failed: ${providerFailure(probe)}`);
  }

  console.log('');
  return failed ? 1 : 0;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  void verifyGeminiProduction().then((code) => {
    process.exitCode = code;
  }).catch(() => {
    console.error('✗ Gemini production preflight failed unexpectedly (details redacted)');
    process.exitCode = 1;
  });
}
