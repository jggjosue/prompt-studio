import 'server-only';

import { transientError, type DomainDns, type DomainProvider, type DomainProviderStatus } from './custom-domains-core';

/**
 * Adaptadores de proveedor de dominios.
 *
 * - Cloudflare Custom Hostnames (provisiona SSL automáticamente).
 * - Manual: cuando no hay credenciales, se entregan instrucciones DNS y la
 *   verificación queda pendiente.
 *
 * Los errores transitorios (429/5xx) se marcan con `transient: true` para que
 * `verifyDomainCore` reintente; un DNS que todavía no propaga NO es un error.
 */

function isTransientHttp(status: number): boolean {
  return status === 429 || status >= 500;
}

export function cloudflareProvider(token: string, zoneId: string, fallbackTarget: string): DomainProvider {
  const base = 'https://api.cloudflare.com/client/v4';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fail = async (response: Response, context: string): Promise<never> => {
    const body = (await response.json().catch(() => null)) as { errors?: Array<{ message?: string }> } | null;
    const message = body?.errors?.[0]?.message ?? `Cloudflare rechazó ${context} (${response.status}).`;
    if (isTransientHttp(response.status)) throw transientError(message);
    throw new Error(message);
  };

  return {
    async create(hostname) {
      const response = await fetch(`${base}/zones/${zoneId}/custom_hostnames`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ hostname, ssl: { method: 'http', type: 'dv' } }),
      });
      if (!response.ok) return fail(response, 'el custom hostname');
      const data = (await response.json()) as { result?: { id?: string; hostname?: string } };
      const providerHostnameId = data.result?.id;
      if (!providerHostnameId) throw new Error('Cloudflare no devolvió el id del custom hostname.');
      return {
        providerHostnameId,
        dns: {
          host: hostname,
          recordType: 'CNAME',
          target: fallbackTarget,
        },
      };
    },
    async checkStatus(providerHostnameId) {
      const response = await fetch(`${base}/zones/${zoneId}/custom_hostnames/${providerHostnameId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) return fail(response, 'la consulta de estado');
      const data = (await response.json()) as {
        result?: { status?: string; ssl?: { status?: string; validation_errors?: unknown[] } };
      };
      const status = data.result?.status;
      const sslStatus = data.result?.ssl?.status;
      const hasValidationErrors = Boolean(data.result?.ssl?.validation_errors?.length);

      if (sslStatus === 'active' && status === 'active') {
        return { verification: 'active', ssl: 'active' };
      }
      if (status === 'failed' || status === 'moved' || sslStatus === 'error' || hasValidationErrors) {
        return { verification: 'failed', ssl: sslStatus === 'error' ? 'error' : 'failed' };
      }
      return {
        verification: status === 'active' ? 'active' : 'pending',
        ssl: sslStatus === 'pending_validation' ? 'pending' : sslStatus === 'pending_deployment' ? 'provisioning' : 'pending',
      };
    },
  };
}

export function manualProvider(dns: DomainDns): DomainProvider {
  return {
    async create() {
      return { providerHostnameId: 'manual', dns };
    },
    async checkStatus() {
      // Sin proveedor no hay forma de confirmar la verificación; nunca se activa.
      return { verification: 'pending', ssl: 'pending' };
    },
  };
}

/** Elige el proveedor según las credenciales disponibles. */
export function resolveDomainProvider(customHostnameFallbackTarget: string): { provider: string; instance: DomainProvider } {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  if (token && zoneId) {
    return { provider: 'cloudflare', instance: cloudflareProvider(token, zoneId, customHostnameFallbackTarget) };
  }
  return { provider: 'manual', instance: manualProvider({ host: '', recordType: 'CNAME', target: customHostnameFallbackTarget }) };
}

export type { DomainDns, DomainProviderStatus };