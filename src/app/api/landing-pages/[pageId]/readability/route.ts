import { auth } from '@clerk/nextjs/server';
import { analyzeReadability } from '@/lib/readability-analysis';
import {
  getLandingReadabilitySnapshot,
  saveLandingReadabilitySnapshot,
  summarizeReport,
} from '@/lib/landing-readability-store';
import { getRawWebPageByCatalogId } from '@/lib/web-pages';
import { pickLocalized } from '@/lib/localized-string';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const PAGE_ID_RE = /^wp-\d+$/;

const saveBodySchema = z.object({
  locale: z.enum(['en', 'es']),
  text: z.string().min(1).max(200_000),
  html: z.string().max(200_000).optional(),
  focusKeyword: z.string().max(80).optional(),
  title: z.string().max(300).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await context.params;
  if (!PAGE_ID_RE.test(pageId)) {
    return NextResponse.json({ error: 'pageId inválido' }, { status: 400 });
  }

  const url = new URL(_request.url);
  const locale = url.searchParams.get('locale') === 'es' ? 'es' : 'en';

  const snapshot = await getLandingReadabilitySnapshot(pageId, locale);
  if (!snapshot) {
    return NextResponse.json({ snapshot: null }, { status: 404 });
  }

  return NextResponse.json({ snapshot });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ pageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para guardar' }, { status: 401 });
  }

  const { pageId } = await context.params;
  if (!PAGE_ID_RE.test(pageId)) {
    return NextResponse.json({ error: 'pageId inválido' }, { status: 400 });
  }

  const raw = getRawWebPageByCatalogId(pageId);
  if (!raw) {
    return NextResponse.json({ error: 'Landing no encontrada' }, { status: 404 });
  }

  let body: z.infer<typeof saveBodySchema>;
  try {
    body = saveBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  const report = analyzeReadability({
    text: body.text,
    html: body.html ?? '',
    locale: body.locale,
    focusKeyword: body.focusKeyword,
  });

  const snapshot = summarizeReport(pageId, body.locale, report, {
    demoSlug: raw.demoUrl,
    title: body.title ?? pickLocalized(raw.title, body.locale),
    updatedBy: userId,
  });

  const saved = await saveLandingReadabilitySnapshot(snapshot);

  return NextResponse.json({
    ok: true,
    snapshot: saved,
  });
}
