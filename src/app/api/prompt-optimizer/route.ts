import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import { optimizePrompt } from '@/ai/flows/optimize-prompt';
import { isPromptGoal } from '@/ai/flows/prompt-goals';

const headers = () => cacheHeaders('private-no-store');
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para optimizar prompts.' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `prompt-optimizer:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown>|null;
  const goals = Array.isArray(body?.goals) ? [...new Set(body.goals)].filter(isPromptGoal) : [];
  const input = { prompt: clean(body?.prompt, 20_000), goals, sourceProvider: clean(body?.sourceProvider, 40) || 'generic', targetProvider: clean(body?.targetProvider, 40) || 'generic', targetLanguage: clean(body?.targetLanguage, 40) || 'same as source' };
  if (input.prompt.length < 10 || goals.length === 0) return NextResponse.json({ error: 'Incluye un prompt y al menos un objetivo.' }, { status: 400, headers: headers() });
  try { return NextResponse.json({ result: await optimizePrompt(input) }, { headers: headers() }); }
  catch { return NextResponse.json({ error: 'El proveedor no pudo completar la optimización estructurada. Inténtalo de nuevo.' }, { status: 502, headers: headers() }); }
}

