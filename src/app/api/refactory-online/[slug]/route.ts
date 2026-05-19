import { NextResponse } from 'next/server';
import { getDemoProjectKind, isRefactoryPreviewable } from '@/lib/demo-project-type';
import { validateDemoUrl } from '@/lib/cloudflare-r2';
import { resolveDemoBundle } from '@/lib/refactory-bundle';
import { getRawWebPageByDemoSlug } from '@/lib/web-pages';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!SLUG_RE.test(slug) || slug === 'refactory-online') {
    return NextResponse.json({ error: `Slug no válido: ${slug}` }, { status: 400 });
  }

  const page = getRawWebPageByDemoSlug(slug);
  const demoUrl = page?.demoUrl?.trim() || slug;
  const stack = page?.stack ?? [];
  const projectKind = getDemoProjectKind(stack);

  if (!isRefactoryPreviewable(projectKind)) {
    const validation = await validateDemoUrl(demoUrl, stack);
    return NextResponse.json(
      {
        error: `Demo en vivo no disponible para proyectos ${projectKind}`,
        demoUrl,
        projectKind,
        validation,
        hint:
          projectKind === 'next'
            ? 'Next.js requiere package.json y app/page.tsx (o pages/index). Valida con /api/web-pages/validate-demo-url.'
            : 'React requiere package.json y un punto de entrada (src/main.tsx, App.tsx, etc.).',
      },
      { status: 422 }
    );
  }

  const bundle = await resolveDemoBundle(slug, demoUrl, stack);

  if (bundle) {
    return NextResponse.json(bundle, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  }

  const validation = await validateDemoUrl(demoUrl, stack);

  return NextResponse.json(
    {
      error: `Demo HTML no encontrada: ${slug}`,
      demoUrl,
      projectKind,
      validation,
      hint: `En R2 (bucket prompt-studio) la carpeta "${demoUrl}" debe tener index.html.`,
    },
    { status: 404 }
  );
}
