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

/**
 * Primera integración real detrás de la abstracción: Namecheap.
 *
 * Requiere `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY` y `NAMECHEAP_CLIENT_IP`.
 * Usa la API XML de Namecheap (`namecheap.domains.check`, `getpricing`,
 * `create`, `getinfo`). Los errores 429/5xx se marcan como transitorios.
 */

const ENDPOINT = 'https://api.namecheap.com/xml.response';

function isTransientHttp(status: number): boolean {
  return status === 429 || status >= 500;
}

function extractTag(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
  return match ? match[1].trim() : null;
}

/** Obtiene atributos de las respuestas XML de Namecheap de manera acotada. */
function extractAttribute(xml: string, tag: string, attribute: string): string | null {
  const element = new RegExp(`<${tag}\\b[^>]*>`, 'i').exec(xml)?.[0];
  if (!element) return null;
  const value = new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i').exec(element)?.[1];
  return value?.trim() ?? null;
}

function namecheapError(body: string, status: number): DomainProviderError {
  const message = extractTag(body, 'Message') || `Namecheap respondió ${status}.`;
  return new DomainProviderError(isTransientHttp(status) ? 'TRANSIENT' : 'PERMANENT', message);
}

export function namecheapDomainProvider(): DomainProvider {
  const apiUser = process.env.NAMECHEAP_API_USER?.trim();
  const apiKey = process.env.NAMECHEAP_API_KEY?.trim();
  const clientIp = process.env.NAMECHEAP_CLIENT_IP?.trim();

  const call = async (command: string, params: Record<string, string>): Promise<string> => {
    if (!apiUser || !apiKey || !clientIp) {
      throw new DomainProviderError('NOT_SUPPORTED', 'Configura NAMECHEAP_API_USER, NAMECHEAP_API_KEY y NAMECHEAP_CLIENT_IP.');
    }
    const query = new URLSearchParams({
      ApiUser: apiUser,
      ApiKey: apiKey,
      UserName: apiUser,
      ClientIp: clientIp,
      Command: command,
      ...params,
    });
    const response = await fetch(`${ENDPOINT}?${query.toString()}`, { method: 'GET', cache: 'no-store' });
    const body = await response.text();
    if (!response.ok || extractAttribute(body, 'ApiResponse', 'Status')?.toUpperCase() !== 'OK') {
      throw namecheapError(body, response.status);
    }
    return body;
  };

  const contacts = (): Record<string, string> => {
    const firstName = process.env.NAMECHEAP_REGISTRANT_FIRST_NAME?.trim();
    const lastName = process.env.NAMECHEAP_REGISTRANT_LAST_NAME?.trim();
    const address1 = process.env.NAMECHEAP_REGISTRANT_ADDRESS1?.trim();
    const city = process.env.NAMECHEAP_REGISTRANT_CITY?.trim();
    const stateProvince = process.env.NAMECHEAP_REGISTRANT_STATE?.trim();
    const postalCode = process.env.NAMECHEAP_REGISTRANT_POSTAL_CODE?.trim();
    const country = process.env.NAMECHEAP_REGISTRANT_COUNTRY?.trim();
    const phone = process.env.NAMECHEAP_REGISTRANT_PHONE?.trim();
    const email = process.env.NAMECHEAP_REGISTRANT_EMAIL?.trim();
    if (![firstName, lastName, address1, city, stateProvince, postalCode, country, phone, email].every(Boolean)) {
      throw new DomainProviderError('NOT_SUPPORTED', 'Configura los datos de contacto NAMECHEAP_REGISTRANT_* antes de registrar dominios.');
    }
    const contact = { FirstName: firstName!, LastName: lastName!, Address1: address1!, City: city!, StateProvince: stateProvince!, PostalCode: postalCode!, Country: country!, Phone: phone!, EmailAddress: email! };
    return Object.fromEntries(['Registrant', 'Tech', 'Admin', 'AuxBilling'].flatMap(role => Object.entries(contact).map(([key, value]) => [`${role}${key}`, value])));
  };

  return {
    id: 'namecheap',
    async check(hostname): Promise<DomainCheckResult> {
      const body = await call('namecheap.domains.check', { DomainList: hostname });
      const available = extractAttribute(body, 'DomainCheckResult', 'Available')?.toLowerCase() === 'true';
      const premium = extractAttribute(body, 'DomainCheckResult', 'IsPremiumName')?.toLowerCase() === 'true';
      const premiumRegistration = Number(extractAttribute(body, 'DomainCheckResult', 'PremiumRegistrationPrice') ?? '0');
      const premiumRenewal = Number(extractAttribute(body, 'DomainCheckResult', 'PremiumRenewalPrice') ?? '0');
      return {
        hostname,
        tld: tldOf(hostname),
        available: available ? 'available' : 'registered',
        provider: 'namecheap',
        checkedAt: new Date().toISOString(),
        price: premiumRegistration ? { registration: premiumRegistration, renewal: premiumRenewal || undefined, currency: 'USD', period: 'year' } : undefined,
        error: premium ? 'Dominio premium (precio especial).' : undefined,
      };
    },
    async getPrice(hostname): Promise<DomainPrice | null> {
      const tld = tldOf(hostname);
      const params = { ProductType: 'DOMAIN', ProductCategory: 'DOMAINS', ProductName: tld.toUpperCase() };
      const [registerBody, renewBody] = await Promise.all([
        call('namecheap.users.getPricing', { ...params, ActionName: 'REGISTER' }),
        call('namecheap.users.getPricing', { ...params, ActionName: 'RENEW' }),
      ]);
      const registration = Number(extractAttribute(registerBody, 'Price', 'Price') ?? '0');
      const renewal = Number(extractAttribute(renewBody, 'Price', 'Price') ?? '0');
      const currency = extractAttribute(registerBody, 'Price', 'Currency') ?? 'USD';
      if (!registration) return null;
      return { registration, renewal: renewal || undefined, currency, period: 'year' };
    },
    async register(hostname, years = 1): Promise<RegisterResult> {
      const body = await call('namecheap.domains.create', {
        DomainName: hostname,
        Years: String(years),
        ...contacts(),
      });
      return { orderId: extractAttribute(body, 'DomainCreateResult', 'OrderID') || 'namecheap', status: 'pending' };
    },
    async getStatus(hostname): Promise<DomainStatus> {
      const body = await call('namecheap.domains.getinfo', { DomainName: hostname });
      const status = extractAttribute(body, 'DomainGetInfoResult', 'Status')?.toLowerCase() ?? 'unknown';
      if (status === 'ok' || status.includes('active')) return 'active';
      if (status.includes('expired')) return 'expired';
      return 'unknown';
    },
    async renew(hostname, years = 1) {
      const body = await call('namecheap.domains.renew', { DomainName: hostname, Years: String(years) });
      return { orderId: extractAttribute(body, 'DomainRenewResult', 'OrderID') || 'namecheap' };
    },
  };
}
