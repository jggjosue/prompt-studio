import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import { recordObservabilityEvent } from '@/lib/observability-server';
import PageComposerDomain, { type IPageComposerDomain } from '@/models/PageComposerDomain';
import PageComposerProject from '@/models/PageComposerProject';
import { ROOT_DOMAIN } from '@/lib/tenant-sites';
import { resolveDomainProvider } from '@/lib/custom-domain-provider';
import {
  activateDomainCore,
  applyProviderStatus,
  isDomainHostnameValid,
  normalizeDomainHostname,
  verifyDomainCore,
  withTransientRetry,
  type DomainRecord,
} from './custom-domains-core';

function toRecord(document: IPageComposerDomain): DomainRecord {
  return {
    siteId: String(document.siteId),
    hostname: document.hostname,
    provider: document.provider,
    providerHostnameId: document.providerHostnameId ?? null,
    status: document.status,
    sslStatus: document.ssl?.status ?? 'pending',
    verificationStatus: document.verification?.status ?? 'pending',
    verifiedAt: document.verification?.verifiedAt?.toISOString() ?? null,
    lastCheckedAt: document.verification?.lastCheckedAt?.toISOString() ?? null,
    error: document.verification?.error ?? document.ssl?.error ?? null,
    dns: document.dns ?? null,
    isCanonical: document.isCanonical ?? false,
    createdAt: document.createdAt.toISOString(),
  };
}

function fromRecord(record: DomainRecord): Partial<IPageComposerDomain> {
  return {
    provider: record.provider,
    providerHostnameId: record.providerHostnameId,
    status: record.status,
    ssl: {
      status: record.sslStatus,
      error: record.sslStatus === 'failed' || record.sslStatus === 'error' ? record.error : null,
    },
    verification: {
      status: record.verificationStatus,
      verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : null,
      lastCheckedAt: record.lastCheckedAt ? new Date(record.lastCheckedAt) : null,
      error: record.error,
    },
    dns: record.dns,
    isCanonical: record.isCanonical,
  };
}

const CUSTOM_HOSTNAME_TARGET = `custom-hostname.${ROOT_DOMAIN}`;

/** Un dominio solo puede gestionarlo el dueño del sitio (aislamiento de tenants). */
async function assertSiteOwner(siteId: string, userId: string): Promise<void> {
  const owns = await PageComposerProject.exists({ _id: siteId, userId });
  if (!owns) throw new Error('SITE_NOT_FOUND');
}

export type ConnectDomainInput = { siteId: string; userId: string; hostname: string };

/** Conecta un dominio: valida, crea el registro en `pending` y entrega DNS. */
export async function connectDomain({ siteId, userId, hostname: raw }: ConnectDomainInput): Promise<DomainRecord> {
  const hostname = normalizeDomainHostname(raw);
  if (!isDomainHostnameValid(hostname)) {
    throw new Error('El dominio debe ser un nombre de host válido, por ejemplo example.com.');
  }
  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    throw new Error(`Los subdominios de ${ROOT_DOMAIN} se gestionan con el subdominio del builder.`);
  }

  await connectToDatabase();
  await assertSiteOwner(siteId, userId);
  const existing = await PageComposerDomain.findOne({ hostname }).select('_id').lean();
  if (existing) throw new Error(`El dominio ${hostname} ya está conectado a otro sitio.`);

  const { provider, instance } = resolveDomainProvider(CUSTOM_HOSTNAME_TARGET);
  const created = await instance.create(hostname);

  const record = await PageComposerDomain.create({
    siteId,
    hostname,
    provider,
    providerHostnameId: created.providerHostnameId,
    status: 'pending',
    verification: { status: 'pending', lastCheckedAt: new Date() },
    ssl: { status: 'pending' },
    dns: created.dns,
    isCanonical: false,
  });

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_domain_connect',
    route: '/api/page-composer/sites/[id]/domains',
    userId,
    status: 'success',
    metadata: { siteId, hostname, provider },
  });

  return toRecord(record);
}

/** Verifica el dominio contra el proveedor; solo se activa si la verificación confirma. */
export async function verifyDomain(siteId: string, userId: string, hostname: string): Promise<DomainRecord> {
  await connectToDatabase();
  await assertSiteOwner(siteId, userId);
  const document = await PageComposerDomain.findOne({ siteId, hostname }).lean();
  if (!document) throw new Error('DOMAIN_NOT_FOUND');

  const { instance } = resolveDomainProvider(CUSTOM_HOSTNAME_TARGET);
  const record = await verifyDomainCore({
    domain: toRecord(document),
    provider: instance,
    retries: 2,
    delayMs: 400,
  });
  await PageComposerDomain.updateOne({ _id: document._id }, { $set: fromRecord(record) });

  // Si el dominio asociado a una orden de compra se activa, la orden pasa a active.
  if (record.status === 'active') {
    const { activateOrderForDomain } = await import('@/lib/domain-order');
    await activateOrderForDomain(siteId, hostname).catch(() => undefined);
  }

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_domain_verify',
    route: '/api/page-composer/sites/[id]/domains/[hostname]/verify',
    userId,
    status: record.status === 'active' ? 'success' : record.status,
    metadata: { siteId, hostname, status: record.status, ssl: record.sslStatus },
  });
  return record;
}

/** Activa manualmente solo si la verificación tuvo éxito. */
export async function activateDomain(siteId: string, userId: string, hostname: string): Promise<DomainRecord> {
  await connectToDatabase();
  await assertSiteOwner(siteId, userId);
  const document = await PageComposerDomain.findOne({ siteId, hostname }).lean();
  if (!document) throw new Error('DOMAIN_NOT_FOUND');

  const current = toRecord(document);
  const result = activateDomainCore(current, new Date().toISOString());
  if (!result.ok) throw new Error(result.reason);

  await PageComposerDomain.updateOne({ _id: document._id }, { $set: fromRecord(result.domain) });
  return result.domain;
}

/** Desactiva un dominio (deja de servirse; la verificación sigue en el registro). */
export async function disableDomain(siteId: string, userId: string, hostname: string): Promise<DomainRecord> {
  await connectToDatabase();
  await assertSiteOwner(siteId, userId);
  const document = await PageComposerDomain.findOne({ siteId, hostname }).lean();
  if (!document) throw new Error('DOMAIN_NOT_FOUND');

  const updated = { ...toRecord(document), status: 'disabled' as const };
  await PageComposerDomain.updateOne({ _id: document._id }, { $set: fromRecord(updated) });

  await recordObservabilityEvent({
    category: 'commerce',
    name: 'page_composer_domain_disable',
    route: '/api/page-composer/sites/[id]/domains/[hostname]/disable',
    userId,
    status: 'success',
    metadata: { siteId, hostname },
  });
  return updated;
}

export async function listDomains(siteId: string): Promise<DomainRecord[]> {
  await connectToDatabase();
  const documents = await PageComposerDomain.find({ siteId }).sort({ createdAt: -1 }).lean();
  return documents.map(toRecord);
}

/**
 * Resuelve un dominio personalizado **activo** a la versión publicada inmutable
 * de su sitio. Nunca devuelve el borrador ni un dominio no activo.
 */
export async function resolveCustomDomain(hostname: string) {
  await connectToDatabase();
  const domain = await PageComposerDomain.findOne({ hostname, status: 'active' }).lean();
  if (!domain) return null;

  const project = await PageComposerProject.findById(domain.siteId)
    .select('publishedVersionId')
    .lean();
  if (!project?.publishedVersionId) return null;

  const { getSitePublishedVersion } = await import('@/lib/publish-site');
  const published = await getSitePublishedVersion(String(project._id));
  if (!published) return null;

  return { siteId: String(project._id), hostname, ...published, canonical: domain.isCanonical };
}

/** Reutilizado para reintentos transitorios en llamadas del operador. */
export { applyProviderStatus, withTransientRetry };