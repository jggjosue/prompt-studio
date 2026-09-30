import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { WebsiteBuilder } from '@/components/editor/website-builder/website-builder';
import { BuilderTemplates } from '@/components/editor/website-builder/builder-templates';
import {
  createBlankSchema,
  createTemplateSchema,
  isTemplateId,
} from '@/lib/editor/page-templates';
import { getPageComposerDraft } from '@/lib/page-composer-project';

export const metadata: Metadata = {
  title: 'Editor visual | Prompt Studio',
  description: 'Edita el sitio arrastrando componentes sobre un lienzo. PageSchema es la fuente de verdad.',
  alternates: { canonical: '/page-composer/website/editor' },
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

/**
 * Editor visual del Website Builder.
 *
 * - Sin parámetros: muestra la galería de plantillas (crear desde cero o desde
 *   una plantilla).
 * - `?template=blank|<id>`: abre el editor con la plantilla elegida.
 * - `?project=<id>`: carga un borrador persistido del usuario.
 * - `?slug=` abre una página concreta del sitio.
 */
export default async function WebsiteBuilderEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string; project?: string; template?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { slug, project, template } = await searchParams;

  // Galería de plantillas: no hay borrador ni plantilla elegida todavía.
  if (!project && !template) {
    return <BuilderTemplates locale={locale} />;
  }

  let initialSchema = createBlankSchema();
  let projectId: string | undefined;
  let initialVersion: number | null = null;

  if (project && typeof project === 'string' && project.trim()) {
    const { userId } = await auth();
    if (userId) {
      const draft = await getPageComposerDraft(userId, project.trim());
      if (draft) {
        initialSchema = draft.schema;
        initialVersion = draft.version;
        projectId = draft.id;
      }
    }
  } else if (template && typeof template === 'string') {
    initialSchema = template === 'blank' ? createBlankSchema() : isTemplateId(template) ? createTemplateSchema(template) : createBlankSchema();
  }

  return (
    <WebsiteBuilder
      initialSchema={initialSchema}
      initialSlug={slug}
      projectId={projectId}
      initialVersion={initialVersion}
    />
  );
}