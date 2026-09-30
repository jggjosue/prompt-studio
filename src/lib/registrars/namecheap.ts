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
    if (!response.ok || extractTag(body, 'Status') !== 'OK') throw namecheapError(body, response.status);
    return body;
  };

  return {
    id: 'namecheap',
    async check(hostname): Promise<DomainCheckResult> {
      const body = await call('namecheap.domains.check', { DomainList: hostname });
      const available = extractTag(body, 'Available')?.toLowerCase() === 'true';
      const premium = extractTag(body, 'IsPremiumName')?.toLowerCase() === 'true';
      return {
        hostname,
        tld: tldOf(hostname),
        available: available ? 'available' : 'registered',
        provider: 'namecheap',
        checkedAt: new Date().toISOString(),
        error: premium ? 'Dominio premium (precio especial).' : undefined,
      };
    },
    async getPrice(hostname): Promise<DomainPrice | null> {
      const tld = tldOf(hostname);
      const body = await call('namecheap.domains.getpricing', { ProductType: 'DOMAIN', ProductCategory: 'domains', ProductName: tld });
      const registration = Number(extractTag(body, 'Registration') ?? extractTag(body, 'RegularPrice') ?? '0');
      const renewal = Number(extractTag(body, 'Renewal') ?? '0');
      if (!registration) return null;
      return { registration, renewal: renewal || undefined, currency: 'USD', period: 'year' };
    },
    async register(hostname, years = 1): Promise<RegisterResult> {
      const body = await call('namecheap.domains.create', {
        DomainName: hostname,
        Years: String(years),
        // Se usa el contacto predeterminado del perfil de Namecheap.
        Registrar: 'Namecheap',
      });
      return { orderId: extractTag(body, 'OrderId') || 'namecheap', status: 'pending' };
    },
    async getStatus(hostname): Promise<DomainStatus> {
      const body = await call('namecheap.domains.getinfo', { DomainName: hostname });
      const status = extractTag(body, 'Status')?.toLowerCase() ?? 'unknown';
      if (status.includes('active')) return 'active';
      if (status.includes('expired')) return 'expired';
      return 'unknown';
    },
  };
}