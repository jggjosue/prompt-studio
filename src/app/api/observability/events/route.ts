import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { normalizeObservabilityEvent, type ObservabilityInput } from '@/lib/observability-server';
import ObservabilityEvent from '@/models/ObservabilityEvent';

const allowed = new Set(['browser_error', 'web_vital', 'resource_timing', 'commerce']);

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const size = Number(request.headers.get('content-length') ?? 0);
  if (size > 64_000) return NextResponse.json({ error: 'Payload demasiado grande.' }, { status: 413, headers });
  const raw = await request.json().catch(() => null) as { events?: ObservabilityInput[] } | null;
  if (!Array.isArray(raw?.events)) return NextResponse.json({ error: 'Eventos inválidos.' }, { status: 400, headers });
  const { userId } = await auth();
  const events = raw.events.slice(0, 25).filter(event => allowed.has(event?.category)).map(event => normalizeObservabilityEvent(event, userId)).filter(Boolean);
  if (events.length) {
    await connectToDatabase();
    await ObservabilityEvent.insertMany(events, { ordered: false });
  }
  return NextResponse.json({ received: events.length }, { status: 202, headers });
}
