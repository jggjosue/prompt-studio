/**
 * Núcleo puro de publicación (testeable sin MongoDB).
 *
 * El flujo: 1) valida el schema, 2) valida los assets, 3) crea una versión
 * inmutable, 4) apunta el sitio a esa versión, 5) invalida cachés. Un fallo en
 * cualquier paso deja la versión anterior online (rollback por compensación si
 * el apuntado falla). Las operaciones de almacenamiento se inyectan, así se puede
 * probar la atomicidad y el rollback en memoria.
 */

import { migratePageSchema, safeUrl, type SiteSchema } from './editor/page-schema';

export type PublishErrorCode = 'SITE_NOT_FOUND' | 'INVALID_SCHEMA' | 'INVALID_ASSETS' | 'PUBLISH_FAILED';

export class PublishError extends Error {
  readonly code: PublishErrorCode;
  constructor(code: PublishErrorCode, message: string) {
    super(message);
    this.name = 'PublishError';
    this.code = code;
  }
}

/** Recoge las URLs de imagen de un schema (secciones image y galerías). */
export function collectImageUrls(schema: SiteSchema): string[] {
  const urls: string[] = [];
  const walk = (nodes: readonly { type: string; props: Record<string, unknown>; children: readonly unknown[] }[]) => {
    for (const node of nodes) {
      if (node.type === 'image' && typeof node.props.src === 'string') urls.push(node.props.src);
      if (node.type === 'gallery' && Array.isArray(node.props.images)) {
        for (const image of node.props.images as unknown[]) {
          const src = (image as { src?: unknown })?.src;
          if (typeof src === 'string') urls.push(src);
        }
      }
      walk(node.children as typeof nodes);
    }
  };
  walk(schema.pages.flatMap(page => page.sections as never));
  return urls;
}

/** Valida los assets requeridos: URLs seguras y con un prefijo conocido. */
export function validateSiteAssets(schema: SiteSchema): string[] {
  const issues: string[] = [];
  for (const url of collectImageUrls(schema)) {
    const safe = safeUrl(url);
    if (!safe) {
      issues.push(`URL de imagen insegura: ${url}`);
      continue;
    }
    const internal = safe.startsWith('/images/') || safe.startsWith('/');
    const remote = /^https?:\/\//i.test(safe);
    if (!internal && !remote) issues.push(`URL de imagen no soportada: ${url}`);
  }
  return issues;
}

export type PublishDeps = {
  loadSite: (siteId: string) => Promise<{
    schema: unknown;
    draftVersion: number;
    publishedVersion: number | null;
  } | null>;
  insertVersion: (payload: {
    version: number;
    schema: SiteSchema;
    publishedBy: string;
    sourceDraftVersion: number;
  }) => Promise<string>;
  deleteVersion: (versionId: string) => Promise<void>;
  pointSite: (
    siteId: string,
    pointer: { publishedVersionId: string; publishedVersion: number; publishedAt: Date },
    deployment: { sourceDraftVersion: number; publishedBy: string }
  ) => Promise<void>;
  invalidate: (siteId: string) => Promise<void>;
};

export type PublishCoreOutput = { publishedVersion: number; versionId: string };

/** Flujo de publicación con dependencias inyectadas. */
export async function publishSiteCore(siteId: string, publishedBy: string, deps: PublishDeps): Promise<PublishCoreOutput> {
  const site = await deps.loadSite(siteId);
  if (!site) throw new PublishError('SITE_NOT_FOUND', 'El sitio no existe.');

  const schema = migratePageSchema(site.schema);
  if (!schema) throw new PublishError('INVALID_SCHEMA', 'El borrador no es un PageSchema válido.');

  const assetIssues = validateSiteAssets(schema);
  if (assetIssues.length) throw new PublishError('INVALID_ASSETS', assetIssues[0]);

  const version = (site.publishedVersion ?? 0) + 1;
  let versionId: string;
  try {
    versionId = await deps.insertVersion({ version, schema, publishedBy, sourceDraftVersion: site.draftVersion });
  } catch {
    throw new PublishError('PUBLISH_FAILED', 'No se pudo crear la versión publicada.');
  }

  try {
    await deps.pointSite(
      siteId,
      { publishedVersionId: versionId, publishedVersion: version, publishedAt: new Date() },
      { sourceDraftVersion: site.draftVersion, publishedBy }
    );
  } catch {
    // Compensación: borrar la versión huérfana; la versión anterior sigue online.
    await deps.deleteVersion(versionId).catch(() => undefined);
    throw new PublishError('PUBLISH_FAILED', 'No se pudo publicar; la versión anterior sigue online.');
  }

  await deps.invalidate(siteId).catch(() => undefined);
  return { publishedVersion: version, versionId };
}