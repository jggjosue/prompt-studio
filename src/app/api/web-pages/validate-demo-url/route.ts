import { NextResponse } from 'next/server';
import { validateDemoUrl } from '@/lib/cloudflare-r2';
import {
  getRawWebPageByDemoSlug,
  getRawWebPageById,
  getRawWebPages,
} from '@/lib/web-pages';

export const runtime = 'nodejs';

/**
 * GET /api/web-pages/validate-demo-url
 * Query: demoUrl | id | slug | all=1
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1' || searchParams.get('all') === 'true';

  if (all) {
    const pages = getRawWebPages();
    const results = await Promise.all(
      pages.map(async (page) => {
        const validation = await validateDemoUrl(
          page.demoUrl ?? '',
          page.stack ?? []
        );
        return {
          id: page.id,
          stack: page.stack ?? [],
          demoUrl: page.demoUrl ?? '',
          ...validation,
        };
      })
    );

    const invalid = results.filter(r => !r.valid && r.status !== 'prompt-only');

    return NextResponse.json({
      total: results.length,
      valid: results.filter(r => r.valid).length,
      promptOnly: results.filter(r => r.status === 'prompt-only').length,
      invalid: invalid.length,
      results,
    });
  }

  const hasDemoUrl = searchParams.has('demoUrl');
  const demoUrlParam = searchParams.get('demoUrl');
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  let demoUrl = '';

  if (hasDemoUrl) {
    demoUrl = demoUrlParam?.trim() ?? '';
  } else if (id) {
    const page = getRawWebPageById(id);
    if (!page) {
      return NextResponse.json(
        { error: `Entrada no encontrada en web-pages.json: id=${id}` },
        { status: 404 }
      );
    }
    demoUrl = page.demoUrl?.trim() ?? '';
  } else if (slug) {
    const page = getRawWebPageByDemoSlug(slug);
    if (!page) {
      return NextResponse.json(
        { error: `Entrada no encontrada para slug=${slug}` },
        { status: 404 }
      );
    }
    demoUrl = page.demoUrl?.trim() ?? '';
  }

  if (!hasDemoUrl && !id && !slug) {
    return NextResponse.json(
      {
        error:
          'Indica demoUrl, id, slug o all=1 para validar entradas de web-pages.json',
      },
      { status: 400 }
    );
  }

  const validation = await validateDemoUrl(demoUrl, stack);
  const status =
    validation.status === 'prompt-only'
      ? 200
      : validation.valid
        ? 200
        : 404;

  return NextResponse.json(validation, { status });
}
