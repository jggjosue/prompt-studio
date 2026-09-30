import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { WebsiteBuilder } from '@/components/editor/website-builder/website-builder';
import { createLandingSchema } from '@/lib/editor/page-schema';
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
 * Carga un borrador persistido (`?project=<id>`) si existe y pertenece al
 * usuario; si no, arranca de la semilla. El autoguardado escribe en el backend
 * (MongoDB) con debounce, nunca en cada movimiento del puntero.
 */
export default async function WebsiteBuilderEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string; project?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { slug, project } = await searchParams;

  let initialSchema = createLandingSchema();
  let projectId: string | undefined;
  let initialVersion: number | null = null;

  if (typeof project === 'string' && project.trim()) {
    const { userId } = await auth();
    if (userId) {
      const draft = await getPageComposerDraft(userId, project.trim());
      if (draft) {
        initialSchema = draft.schema;
        initialVersion = draft.version;
        projectId = draft.id;
      }
    }
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