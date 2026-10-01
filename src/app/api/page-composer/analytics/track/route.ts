import { NextResponse } from 'next/server';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { recordWebsiteEvent, type WebsiteEventKind } from '@/lib/page-analytics';

export const runtime = 'nodejs';
const kinds = new Set<WebsiteEventKind>(['page_view', 'cta_click', 'form_conversion']);

/** Endpoint público, sin cookies de seguimiento ni datos personales. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { kind?: WebsiteEventKind; page?: string; visitorId?: string } | null;
  if (!body || !kinds.has(body.kind as WebsiteEventKind) || typeof body.page !== 'string' || typeof body.visitorId !== 'string' || body.visitorId.length > 128) {
    return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
  }
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const quota = await rateLimit({ key: `website-analytics:${host}:${body.visitorId}`, limit: 60, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  await recordWebsiteEvent({ host, kind: body.kind as WebsiteEventKind, page: body.page, visitorId: body.visitorId, referrer: request.headers.get('referer'), country: request.headers.get('cf-ipcountry') });
  return new NextResponse(null, { status: 204 });
}
