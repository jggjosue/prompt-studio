/**
 * Abstracción de proveedor de dominios (registrar).
 *
 * La UI y la lógica de negocio dependen de `DomainProvider`, no de un registrar
 * concreto. Cada integración (Namecheap, manual, …) implementa la interfaz; las
 * pruebas usan un fake. Nunca se confía en un resultado de disponibilidad viejo:
 * el flujo de registro vuelve a consultar al proveedor justo antes de comprar.
 */

export type DomainAvailability = 'available' | 'registered' | 'unavailable' | 'unknown';
export type DomainStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'unknown';

export type DomainPrice = {
  registration: number;
  renewal?: number;
  currency: string;
  period: 'year';
};

export type DomainCheckResult = {
  hostname: string;
  tld: string;
  available: DomainAvailability;
  price?: DomainPrice;
  provider: string;
  /** ISO; sirve para saber si un resultado sigue siendo fresco. */
  checkedAt: string;
  error?: string;
};

export type RegisterResult = { orderId: string; status: 'pending' | 'registered' };

export type DomainProvider = {
  id: string;
  /** Comprueba disponibilidad (y, si es posible, precio) de un dominio. */
  check(hostname: string): Promise<DomainCheckResult>;
  /** Precio de registro/renewal, o null si no lo soporta. */
  getPrice?(hostname: string): Promise<DomainPrice | null>;
  /** Registra el dominio. `years` solo si el proveedor lo soporta. */
  register(hostname: string, years?: number): Promise<RegisterResult>;
  getStatus(hostname: string): Promise<DomainStatus>;
  /** Renovación, solo donde el proveedor la soporta. */
  renew?(hostname: string, years?: number): Promise<{ orderId: string }>;
};

/* ------------------------------------------------------------- errores --- */

export type DomainErrorCode = 'RATE_LIMITED' | 'TRANSIENT' | 'PERMANENT' | 'NOT_SUPPORTED' | 'UNAVAILABLE';

export class DomainProviderError extends Error {
  readonly code: DomainErrorCode;
  readonly transient: boolean;
  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainProviderError';
    this.code = code;
    this.transient = code === 'TRANSIENT' || code === 'RATE_LIMITED';
  }
}

export function isTransientDomainError(error: unknown): boolean {
  return error instanceof DomainProviderError && error.transient;
}

/** Reintenta solo fallos transitorios del proveedor (con backoff). */
export async function withDomainRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientDomainError(error) || attempt === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * 2 ** attempt));
    }
  }
  throw lastError;
}

/* ---------------------------------------------------------- utilidades --- */

export const POPULAR_TLDS = ['com', 'ai', 'dev', 'io', 'co', 'net', 'org', 'app', 'site', 'shop'] as const;

export function normalizeDomainTerm(term: string): string {
  return term.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

/** `companyname` + `com` → `companyname.com`. */
export function buildHostname(term: string, tld: string): string {
  return `${term}.${tld.replace(/^\./, '')}`;
}

/** TLD de un hostname (`companyname.com` → `com`). */
export function tldOf(hostname: string): string {
  const parts = hostname.split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : hostname;
}

/** ¿El resultado de disponibilidad sigue siendo fresco? */
export function isFresh(result: DomainCheckResult, maxAgeMs: number, now = Date.now()): boolean {
  const checkedAt = new Date(result.checkedAt).getTime();
  return Number.isFinite(checkedAt) && now - checkedAt <= maxAgeMs;
}