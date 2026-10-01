import connectToDatabase from '@/lib/mongoose';
import { migratePageSchema, type SiteSchema } from '@/lib/editor/page-schema';
import PageComposerProject from '@/models/PageComposerProject';

export type PageComposerDraft = {
  id: string;
  name: string;
  schema: SiteSchema;
  version: number;
  updatedAt: Date;
};

export type PageComposerDraftSummary = Omit<PageComposerDraft, 'updatedAt'> & {
  updatedAtIso: string;
};

/**
 * Carga un borrador del usuario, validándolo antes de exponerlo.
 *
 * Pasa por `migratePageSchema` y no por `validatePageSchema` a secas: el
 * migrador termina llamando al mismo validador, pero antes normaliza la versión
 * del documento. Con `PAGE_SCHEMA_VERSION = 1` ambos se comportan igual; el día
 * que suba a 2, este camino seguirá leyendo los borradores v1 en vez de
 * devolver `null` y dejar al usuario con un lienzo en blanco sin explicación.
 *
 * Devuelve `null` si no existe o si el schema guardado no es recuperable
 * (para no abrir un documento corrupto en el editor).
 */
export async function getPageComposerDraft(userId: string, id: string): Promise<PageComposerDraft | null> {
  await connectToDatabase();
  const project = await PageComposerProject.findOne({ _id: id, userId }).lean();
  if (!project) return null;

  const schema = migratePageSchema(project.document);
  if (!schema) return null;

  return {
    id: String(project._id),
    name: project.name,
    schema,
    version: project.version,
    updatedAt: project.updatedAt,
  };
}

/** Borradores recientes que se pueden reabrir desde la galería del builder. */
export async function listPageComposerDrafts(userId: string, limit = 24): Promise<PageComposerDraftSummary[]> {
  try {
    await connectToDatabase();
    const projects = await PageComposerProject.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(Math.max(1, Math.min(limit, 50)))
      .lean();

    return projects.flatMap(project => {
      // Mismo criterio que `getPageComposerDraft`: migrar antes de validar, para
      // que la galería no deje de listar los borradores antiguos al subir de versión.
      const schema = migratePageSchema(project.document);
      if (!schema) return [];
      const updatedAt = project.updatedAt instanceof Date ? project.updatedAt : new Date(project.updatedAt);
      return [{
        id: String(project._id),
        name: project.name,
        schema,
        version: project.version,
        updatedAtIso: updatedAt.toISOString(),
      }];
    });
  } catch {
    // La galería sigue disponible aunque MongoDB esté temporalmente caído.
    return [];
  }
}
