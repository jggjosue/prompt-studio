import { cdnCacheHeaders } from '@/lib/cdn-cache';
import { NextResponse } from 'next/server';
import { getDemoProjectKind, isRefactoryPreviewable } from '@/lib/demo-project-type';
import { compressedJsonResponse } from '@/lib/http-compression';
import { validateDemoUrl } from '@/lib/cloudflare-r2';

/** Debe coincidir con `VERCEL_EDGE_REGIONS` en `@/lib/cdn-cache` (literal requerido por Next.js). */
export const preferredRegion = [
  'iad1',
  'sfo1',
  'cdg1',
  'fra1',
  'sin1',
  'syd1',
  'gru1',
  'hnd1',
];
import { resolveVerifiedRefactoryBundle } from '@/domain/refactory-runtime/verified-bundle-runtime';
import { sandboxPolicy } from '@/domain/refactory-runtime/bundle-contract';
import { getRawWebPageByDemoSlug } from '@/lib/web-pages';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

export async function GET(
  request: Request,
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

  const resolved = await resolveVerifiedRefactoryBundle(demoUrl, stack);

  if (resolved.status === 'ready') {
    return compressedJsonResponse(request, { ...resolved.bundle, sandbox: sandboxPolicy() }, {
      headers: cdnCacheHeaders('staleWhileRevalidate'),
    });
  }
  if (resolved.status === 'invalid') return NextResponse.json({ code: 'BUNDLE_INVALID', errors: resolved.errors }, { status: 422 });

  const validation = await validateDemoUrl(demoUrl, stack);

  return NextResponse.json(
    {
      code: 'DEMO_INTEGRATING',
      error: `Demo HTML no encontrada: ${slug}`,
      slug,
      demoUrl,
      projectKind,
      validation,
      hint: `En R2 (bucket prompt-studio) la carpeta "${demoUrl}" debe tener index.html.`,
    },
    { status: 404 }
  );
}
