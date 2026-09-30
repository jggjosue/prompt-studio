import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { PageRenderer } from '@/components/editor/page-renderer';
import { countNodes, createLandingSchema, findPage } from '@/lib/editor/page-schema';

export const metadata: Metadata = {
  title: 'Visual Website Builder | Prompt Studio',
  description: 'Vista previa de un sitio descrito como PageSchema y renderizado a React sin escribir código.',
  alternates: { canonical: '/page-composer/website' },
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

/**
 * Vista previa del Visual Website Builder.
 *
 * Carga la semilla de `PageSchema` y la renderiza a React. Es la prueba viva de
 * que un documento —el mismo formato que producirá la IA— se convierte en una
 * página semántica y responsive sin `eval` ni HTML inyectado. `?slug=` permite
 * abrir cualquiera de las páginas del sitio.
 */
export default async function WebsiteBuilderPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { slug } = await searchParams;
  const schema = createLandingSchema();
  const page = findPage(schema, slug);
  const totalNodes = schema.pages.reduce((sum, item) => sum + countNodes(item.sections), 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-bold">
              Visual Website Builder · {schema.site.name}
              {page ? <span className="ml-2 font-normal text-muted-foreground">{page.name} ({page.slug})</span> : null}
            </p>
            <p className="text-muted-foreground">
              PageSchema v{schema.schemaVersion} · {schema.pages.length} páginas · {totalNodes} componentes ·{' '}
              {Object.keys(schema.site.theme.tokens).length} tokens · sin código generado
            </p>
            <a
              href={`/${locale}/page-composer/website/editor${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Editar en el lienzo
            </a>
          </div>
        </div>
        <PageRenderer schema={schema} slug={slug} className="bg-background" />
      </main>
      <Footer />
    </div>
  );
}
