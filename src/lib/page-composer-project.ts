import connectToDatabase from '@/lib/mongoose';
import { validatePageSchema, type SiteSchema } from '@/lib/editor/page-schema';
import PageComposerProject from '@/models/PageComposerProject';

export type PageComposerDraft = {
  id: string;
  name: string;
  schema: SiteSchema;
  version: number;
  updatedAt: Date;
};

/**
 * Carga un borrador del usuario, validándolo antes de exponerlo.
 *
 * Devuelve `null` si no existe o si el schema guardado no pasa la validación
 * (para no abrir un documento corrupto en el editor).
 */
export async function getPageComposerDraft(userId: string, id: string): Promise<PageComposerDraft | null> {
  await connectToDatabase();
  const project = await PageComposerProject.findOne({ _id: id, userId }).lean();
  if (!project) return null;

  const result = validatePageSchema(project.document);
  if (!result.ok) return null;

  return {
    id: String(project._id),
    name: project.name,
    schema: result.schema,
    version: project.version,
    updatedAt: project.updatedAt,
  };
}