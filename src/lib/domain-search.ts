import {
  buildHostname,
  isFresh,
  normalizeDomainTerm,
  tldOf,
  withDomainRetry,
  type DomainCheckResult,
  type DomainPrice,
  type DomainProvider,
  type RegisterResult,
} from './domain-provider';

const SUGGESTION_CACHE_TTL_MS = 10 * 60_000;
const DEFAULT_TLDS = ['com', 'ai', 'dev'];

/** Cache solo para sugerencias de descubrimiento (nunca para autorizar compras). */
const suggestionCache = new Map<string, { result: DomainCheckResult; at: number }>();

/** Devuelve las sugerencias para un término, consultando el proveedor por TLD. */
export async function searchDomains(
  term: string,
  provider: DomainProvider,
  tlds: readonly string[] = DEFAULT_TLDS,
  now = Date.now()
): Promise<DomainCheckResult[]> {
  const normalized = normalizeDomainTerm(term);
  if (!normalized) return [];

  const results: DomainCheckResult[] = [];
  for (const tld of tlds) {
    const hostname = buildHostname(normalized, tld);
    const key = `${provider.id}:${hostname}`;
    const cached = suggestionCache.get(key);
    if (cached && isFresh(cached.result, SUGGESTION_CACHE_TTL_MS, now)) {
      results.push(cached.result);
      continue;
    }
    try {
      const checked = await withDomainRetry(() => provider.check(hostname));
      // La disponibilidad y el precio se muestran juntos en discovery. El
      // precio puede llegar desde check (p. ej. dominios premium) o desde la
      // operación específica del registrar; ambos resultados se cachean solo
      // como sugerencia, nunca como autorización de compra.
      const price = checked.price ?? (provider.getPrice ? await withDomainRetry(() => provider.getPrice!(hostname)) : null);
      const result = price ? { ...checked, price } : checked;
      suggestionCache.set(key, { result, at: now });
      results.push(result);
    } catch (error) {
      results.push({
        hostname,
        tld,
        available: 'unknown',
        provider: provider.id,
        checkedAt: new Date(now).toISOString(),
        error: error instanceof Error ? error.message : 'El proveedor falló al comprobar.',
      });
    }
  }

  // Disponibles primero, después el resto, manteniendo el orden de TLDs.
  return results.sort((a, b) => Number(b.available === 'available') - Number(a.available === 'available'));
}

/**
 * Comprobación **autoritativa y fresca**: nunca usa caché. Es la que se usa justo
 * antes del registro y en el endpoint de verificación.
 */
export async function authoritativeCheck(hostname: string, provider: DomainProvider): Promise<DomainCheckResult> {
  return withDomainRetry(() => provider.check(hostname));
}

/** Precio fresco de un dominio (proveedor o, si no, del check). */
export async function freshPrice(hostname: string, provider: DomainProvider): Promise<DomainPrice | null> {
  if (provider.getPrice) {
    const price = await withDomainRetry(() => provider.getPrice!(hostname));
    if (price) return price;
  }
  const check = await authoritativeCheck(hostname, provider);
  return check.price ?? null;
}

export type RegisterOutcome =
  | { ok: true; orderId: string; status: 'pending' | 'registered'; price: DomainPrice | null }
  | { ok: false; code: string; message: string };

/**
 * Registra un dominio. Antes de comprar se hace una comprobación **fresca** de
 * disponibilidad y precio (nunca se reutiliza un resultado antiguo); si el
 * dominio ya no está disponible, se rechaza.
 */
export async function registerDomain(
  hostname: string,
  provider: DomainProvider,
  years = 1
): Promise<RegisterOutcome> {
  let check: DomainCheckResult;
  try {
    check = await authoritativeCheck(hostname, provider);
  } catch (error) {
    return { ok: false, code: 'PROVIDER_ERROR', message: error instanceof Error ? error.message : 'Error del proveedor.' };
  }
  if (check.available !== 'available') {
    return { ok: false, code: 'NOT_AVAILABLE', message: `"${hostname}" ya no está disponible.` };
  }

  let price: DomainPrice | null = null;
  try {
    price = await freshPrice(hostname, provider);
  } catch {
    price = check.price ?? null;
  }

  try {
    const result: RegisterResult = await withDomainRetry(() => provider.register(hostname, years));
    return { ok: true, orderId: result.orderId, status: result.status, price };
  } catch (error) {
    return { ok: false, code: 'REGISTER_FAILED', message: error instanceof Error ? error.message : 'No se pudo registrar el dominio.' };
  }
}

/** Limpia la caché de sugerencias (para tests y operaciones). */
export function clearDomainSuggestionCache(): void {
  suggestionCache.clear();
}

export { tldOf };
