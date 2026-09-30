import 'server-only';

import type { DomainProvider } from '@/lib/domain-provider';
import { namecheapDomainProvider } from './namecheap';
import { manualDomainProvider } from './manual';

/** Elige el registrar configurado; si no hay credenciales, usa el manual. */
export function resolveDomainProvider(): DomainProvider {
  const configured =
    process.env.NAMECHEAP_API_USER && process.env.NAMECHEAP_API_KEY && process.env.NAMECHEAP_CLIENT_IP;
  return configured ? namecheapDomainProvider() : manualDomainProvider();
}