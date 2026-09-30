import 'server-only';

import connectToDatabase from '@/lib/mongoose';
import { recordObservabilityEvent } from '@/lib/observability-server';
import PageComposerProject from '@/models/PageComposerProject';
import PageComposerPublishedVersion from '@/models/PageComposerPublishedVersion';
import { migratePageSchema } from '@/lib/editor/page-schema';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// Re-export del núcleo puro para las rutas API.
export {
  PublishError,
  publishSiteCore,
  collectImageUrls,
  validateSiteAssets,
  type PublishCoreOutput,
  type PublishDeps,
  type PublishErrorCode,
} from './publish-site-core';
import { publishSiteCore, type PublishCoreOutput } from './publish-site-core';

/**
 * Publica el borrador de un sitio de forma atómica: `publishSiteCore` corre
 * dentro de una única transacción de Mongo, de modo que la inserción de la
 * versión inmutable y el cambio de puntero ocurren juntos. Un fallo en cualquier
 * paso aborta la transacción y deja la versión anterior online.
 */
export async function publishSite(siteId: string, userId: string): Promise<PublishCoreOutput> {
  await connectToDatabase();
  const startedAt = Date.now();
  const session = await mongoose.startSession();

  try {
    let result!: PublishCoreOutput;
    await session.withTransaction(async () => {
      const project = await PageComposerProject.findOne({ _id: siteId, userId }).session(session).lean();
      if (!project) throw new Error('SITE_NOT_FOUND');

      result = await publishSiteCore(String(project._id), userId, {
        loadSite: async () => ({
          schema: project.document,
          draftVersion: project.version,
          publishedVersion: project.publishedVersion ?? null,
        }),
        insertVersion: async ({ version, schema, publishedBy, sourceDraftVersion }) => {
          const [created] = await PageComposerPublishedVersion.create(
            [{ siteId: project._id, version, document: schema, publishedBy, sourceDraftVersion }],
            { session }
          );
          return String(created._id);
        },
        deleteVersion: async versionId => {
          await PageComposerPublishedVersion.deleteOne({ _id: versionId, siteId: project._id }).session(session);
        },
        pointSite: async (_, pointer, deployment) => {
          await PageComposerProject.updateOne(
            { _id: project._id, userId },
            {
              $set: {
                publishedVersionId: pointer.publishedVersionId,
                publishedVersion: pointer.publishedVersion,
                publishedAt: pointer.publishedAt,
                unpublishedAt: null,
              },
              $push: {
                deployments: {
                  $each: [
                    {
                      version: pointer.publishedVersion,
                      publishedAt: pointer.publishedAt,
                      publishedBy: deployment.publishedBy,
                      sourceDraftVersion: deployment.sourceDraftVersion,
                    },
                  ],
                  $slice: -50,
                },
              },
            },
            { session }
          );
        },
        invalidate: async () => {
          revalidatePath(`/page-composer/website/published/${String(project._id)}`);
        },
      });
    });

    await recordObservabilityEvent({
      category: 'commerce',
      name: 'page_composer_publish',
      route: '/api/page-composer/sites/[id]/publish',
      userId,
      status: 'success',
      durationMs: Date.now() - startedAt,
      metadata: { siteId, version: result.publishedVersion },
    });
    return result;
  } catch (error) {
    await recordObservabilityEvent({
      category: 'commerce',
      name: 'page_composer_publish',
      route: '/api/page-composer/sites/[id]/publish',
      userId,
      status: 'error',
      durationMs: Date.now() - startedAt,
      metadata: { siteId, code: error instanceof Error && error.message === 'SITE_NOT_FOUND' ? 'SITE_NOT_FOUND' : 'unknown' },
    });
    throw error;
  } finally {
    await session.endSession();
  }
}

/** Deja de servir la versión publicada; la inmutable queda como histórico. */
export async function unpublishSite(siteId: string, userId: string): Promise<void> {
  await connectToDatabase();
  await PageComposerProject.updateOne(
    { _id: siteId, userId },
    { $set: { publishedVersionId: null, publishedVersion: null, publishedAt: null, unpublishedAt: new Date() } }
  );
  revalidatePath(`/page-composer/website/published/${siteId}`);
}

/** Estado de publicación de un sitio para la barra del editor. */
export async function getSitePublication(siteId: string, userId: string) {
  await connectToDatabase();
  const project = await PageComposerProject.findOne({ _id: siteId, userId })
    .select('publishedVersion publishedVersionId publishedAt unpublishedAt')
    .lean();
  if (!project) return null;
  return {
    siteId: String(project._id),
    publishedVersion: project.publishedVersion ?? null,
    publishedAt: project.publishedAt ?? null,
    unpublishedAt: project.unpublishedAt ?? null,
  };
}

/**
 * Carga la versión **inmutable** publicada de un sitio para servirla en público.
 * Nunca devuelve el borrador: si el sitio no está publicado o la versión falta,
 * devuelve `null` (la web anterior simplemente no cambia).
 */
export async function getSitePublishedVersion(siteId: string) {
  await connectToDatabase();
  const project = await PageComposerProject.findById(siteId)
    .select('publishedVersionId unpublishedAt')
    .lean();
  if (!project || !project.publishedVersionId) return null;

  const published = await PageComposerPublishedVersion.findById(project.publishedVersionId).lean();
  if (!published) return null;

  const schema = migratePageSchema(published.document);
  if (!schema) return null;
  return { schema, version: published.version, publishedAt: published.createdAt };
}