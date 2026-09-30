import 'server-only';

import {
  DomainProviderError,
  tldOf,
  type DomainCheckResult,
  type DomainPrice,
  type DomainProvider,
  type DomainStatus,
  type RegisterResult,
} from '@/lib/domain-provider';

/** Precios orientativos por TLD cuando no hay un registrar configurado. */
const MANUAL_PRICES: Record<string, DomainPrice> = {
  com: { registration: 12, renewal: 12, currency: 'USD', period: 'year' },
  ai: { registration: 99, renewal: 99, currency: 'USD', period: 'year' },
  dev: { registration: 14, renewal: 14, currency: 'USD', period: 'year' },
  io: { registration: 40, renewal: 40, currency: 'USD', period: 'year' },
  co: { registration: 30, renewal: 30, currency: 'USD', period: 'year' },
};

/**
 * Proveedor "manual": no registra dominios reales. Se usa cuando no hay un
 * registrar configurado; devuelve disponibilidad desconocida y precios
 * orientativos para el descubrimiento.
 */
export function manualDomainProvider(): DomainProvider {
  return {
    id: 'manual',
    async check(hostname): Promise<DomainCheckResult> {
      return {
        hostname,
        tld: tldOf(hostname),
        available: 'unknown',
        price: MANUAL_PRICES[tldOf(hostname)],
        provider: 'manual',
        checkedAt: new Date().toISOString(),
      };
    },
    async getPrice(hostname): Promise<DomainPrice | null> {
      return MANUAL_PRICES[tldOf(hostname)] ?? null;
    },
    async register(): Promise<RegisterResult> {
      throw new DomainProviderError('NOT_SUPPORTED', 'El registro no está disponible: configura un registrar.');
    },
    async getStatus(): Promise<DomainStatus> {
      return 'unknown';
    },
  };
}