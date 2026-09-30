import 'server-only';

import { cache } from 'react';
import connectToDatabase from '@/lib/mongoose';
import PageComposerProject from '@/models/PageComposerProject';
import PageComposerPublishedVersion from '@/models/PageComposerPublishedVersion';
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_PATTERN,
  normalizeSubdomain,
  resolveTenantSiteWith,
  type TenantResolution,
} from '@/lib/tenant-sites';

/** Resolución real contra MongoDB, cacheada por subdominio. */
export const resolveTenantSite = cache(async (subdomain: string): Promise<TenantResolution> => {
  await connectToDatabase();
  return resolveTenantSiteWith(subdomain, {
    findSite: async normalized => {
      const project = await PageComposerProject.findOne({ subdomain: normalized })
        .select('subdomain publishedVersionId')
        .lean();
      if (!project) return null;
      return {
        siteId: String(project._id),
        publishedVersionId: project.publishedVersionId ? String(project.publishedVersionId) : null,
      };
    },
    loadPublished: async versionId => {
      const published = await PageComposerPublishedVersion.findById(versionId).lean();
      if (!published) return null;
      return { schema: published.document, version: published.version };
    },
  });
});

/**
 * Asigna un subdominio a un sitio si es válido, no está reservado y no lo usa
 * otro sitio. Devuelve un mensaje de error, o `null` si se asignó.
 */
export async function reserveSubdomain(siteId: string, userId: string, rawSubdomain: string): Promise<string | null> {
  const normalized = normalizeSubdomain(rawSubdomain);
  if (!SUBDOMAIN_PATTERN.test(normalized)) return 'El subdominio solo admite letras, números y guiones.';
  if (RESERVED_SUBDOMAINS.has(normalized)) return `"${normalized}" es un nombre reservado.`;

  await connectToDatabase();
  const existing = await PageComposerProject.findOne({ subdomain: normalized, _id: { $ne: siteId } }).select('_id').lean();
  if (existing) return `El subdominio "${normalized}" ya está en uso.`;

  await PageComposerProject.updateOne({ _id: siteId, userId }, { $set: { subdomain: normalized, updatedAt: new Date() } });
  return null;
}