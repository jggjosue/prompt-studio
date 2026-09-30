import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { WebsiteBuilder } from '@/components/editor/website-builder/website-builder';
import { BuilderTemplates } from '@/components/editor/website-builder/builder-templates';
import {
  createBlankSchema,
  createTemplateSchema,
  getPageTemplate,
  isTemplateId,
} from '@/lib/editor/page-templates';
import { getPageComposerDraft, listPageComposerDrafts } from '@/lib/page-composer-project';
import { getServerSubscriptionStatus, hasComponentBuilderPlan } from '@/lib/server-subscription-status';

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
  const { userId } = await auth();
  const status = userId ? await getServerSubscriptionStatus() : null;
  const canUsePremium = status ? hasComponentBuilderPlan(status) : false;
  const projects = userId ? await listPageComposerDrafts(userId) : [];

  // Galería de plantillas: no hay borrador ni plantilla elegida todavía.
  if (!project && !template) {
    return <BuilderTemplates locale={locale} canUsePremium={canUsePremium} projects={projects} />;
  }

  let initialSchema = createBlankSchema();
  let projectId: string | undefined;
  let initialVersion: number | null = null;

  if (project && typeof project === 'string' && project.trim()) {
    if (!userId) {
      return <BuilderTemplates locale={locale} canUsePremium={false} projects={[]} notice="Inicia sesión para continuar editando tus proyectos guardados." />;
    }
    const draft = await getPageComposerDraft(userId, project.trim());
    if (draft) {
      initialSchema = draft.schema;
      initialVersion = draft.version;
      projectId = draft.id;
    }
  } else if (template && typeof template === 'string') {
    const definition = isTemplateId(template) ? getPageTemplate(template) : undefined;
    if (definition?.access === 'premium' && !canUsePremium) {
      return <BuilderTemplates locale={locale} canUsePremium={false} projects={projects} notice="Esta plantilla está incluida para usuarios Creator y Premium." />;
    }
    initialSchema = template === 'blank' ? createBlankSchema() : definition ? createTemplateSchema(definition.id) : createBlankSchema();
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
