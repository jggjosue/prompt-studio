/**
 * Núcleo del state machine de dominios personalizados (testeable, sin Mongo).
 *
 * Estados de un dominio: `pending` → `verifying` → `active` | `failed`, y
 * `disabled`. Un dominio **nunca** pasa a `active` si el proveedor no confirma
 * la verificación: `applyProviderStatus` solo activa cuando `verification ===
 * 'active'` y `ssl === 'active'`.
 *
 * Los reintentos se limitan a fallos **transitorios** del proveedor (429, 5xx,
 * red); un DNS que todavía no propaga NO es un error: devuelve un estado
 * `pending`/`verifying` normal.
 */

export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'disabled';
export type SslStatus = 'pending' | 'provisioning' | 'active' | 'failed' | 'error';
export type VerificationStatus = 'pending' | 'active' | 'failed' | 'error';

export type DomainDns = { host: string; recordType: 'CNAME' | 'TXT'; target: string };

export type DomainRecord = {
  siteId: string;
  hostname: string;
  provider: string;
  providerHostnameId: string | null;
  status: DomainStatus;
  sslStatus: SslStatus;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  error: string | null;
  dns: DomainDns | null;
  isCanonical: boolean;
  createdAt: string;
};

export type DomainProviderStatus = {
  verification: VerificationStatus;
  ssl: SslStatus;
  error?: string;
};

export type DomainProvider = {
  create(hostname: string): Promise<{ providerHostnameId: string; dns: DomainDns }>;
  checkStatus(providerHostnameId: string): Promise<DomainProviderStatus>;
};

/** Patrón de hostname de dominio válido (apex o www). */
export const DOMAIN_HOSTNAME_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** Normaliza un hostname de dominio: minúsculas, sin protocolo/puerto/punto final. */
export function normalizeDomainHostname(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

export function isDomainHostnameValid(hostname: string): boolean {
  return DOMAIN_HOSTNAME_PATTERN.test(hostname);
}

/**
 * El dominio marcado como principal determina los canonical URLs de SEO. Solo
 * un dominio activo puede serlo; si aún no se eligió uno, el primer dominio
 * activo es una alternativa segura para no publicar una canonical rota.
 */
export function canonicalHostname(
  domains: readonly Pick<DomainRecord, 'hostname' | 'status' | 'isCanonical'>[]
): string | null {
  const active = domains.filter(domain => domain.status === 'active');
  return active.find(domain => domain.isCanonical)?.hostname ?? active[0]?.hostname ?? null;
}

/** Marca un error del proveedor como transitorio (429/5xx/red). */
export function transientError(message: string): Error & { transient: true } {
  const error = new Error(message) as Error & { transient: true };
  error.transient = true;
  return error;
}

export function isTransient(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { transient?: boolean }).transient === true;
}

/** Reintenta solo fallos transitorios, con backoff. Errores no transitorios se lanzan. */
export async function withTransientRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransient(error) || attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * 2 ** attempt));
    }
  }
  throw lastError;
}

/**
 * Aplica el estado reportado por el proveedor a un dominio.
 * Solo pasa a `active` si la verificación y el SSL están activos.
 */
export function applyProviderStatus(domain: DomainRecord, status: DomainProviderStatus, now: string): DomainRecord {
  const base: DomainRecord = {
    ...domain,
    sslStatus: status.ssl,
    verificationStatus: status.verification,
    error: status.error ?? null,
    lastCheckedAt: now,
  };

  if (status.verification === 'failed' || status.ssl === 'failed' || status.ssl === 'error') {
    return { ...base, status: 'failed', verifiedAt: null };
  }
  if (status.verification === 'active' && status.ssl === 'active') {
    return { ...base, status: 'active', verifiedAt: base.verifiedAt ?? now, error: null };
  }
  return { ...base, status: 'verifying', verifiedAt: base.verifiedAt };
}

export type VerifyDomainDeps = {
  domain: DomainRecord;
  provider: DomainProvider;
  retries?: number;
  delayMs?: number;
  now?: string;
};

/** Verifica un dominio contra el proveedor; actualiza estado, verificación y SSL. */
export async function verifyDomainCore(deps: VerifyDomainDeps): Promise<DomainRecord> {
  const { domain, provider, retries = 2, delayMs = 300, now = new Date().toISOString() } = deps;
  if (!domain.providerHostnameId) return { ...domain, status: 'verifying', lastCheckedAt: now };

  const status = await withTransientRetry(() => provider.checkStatus(domain.providerHostnameId!), retries, delayMs);
  return applyProviderStatus(domain, status, now);
}

/** Activa manualmente solo si la verificación ya tuvo éxito (nunca a ciegas). */
export function activateDomainCore(domain: DomainRecord, now: string): { ok: true; domain: DomainRecord } | { ok: false; reason: string } {
  if (domain.verificationStatus !== 'active' || domain.sslStatus !== 'active') {
    return { ok: false, reason: 'La verificación del dominio aún no ha tenido éxito.' };
  }
  return { ok: true, domain: { ...domain, status: 'active', verifiedAt: domain.verifiedAt ?? now } };
}
