import { optimizePrompt } from '@/ai/flows/optimize-prompt';
import { isPromptGoal } from '@/ai/flows/prompt-goals';
import { cacheHeaders } from '@/lib/cache-policy';
import { AICreditError, runMeteredInlineAI } from '@/lib/inline-ai-service';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
  try {
    const user = await (await clerkClient()).users.getUser(userId);
    const metered = await runMeteredInlineAI({ userId, userEmail: user.primaryEmailAddress?.emailAddress ?? '', kind: 'project', provider: 'google', modelId: 'gemini-2.5-flash', operation: 'prompt_optimization', requestId: request.headers.get('Idempotency-Key') || crypto.randomUUID(), payload: input, execute: () => optimizePrompt(input) });
    return NextResponse.json({ result: metered.result, creditsCharged: metered.creditsCharged, duplicate: metered.duplicate }, { headers: headers() });
  } catch (error) {
    if (error instanceof AICreditError) return NextResponse.json({ error: { code: error.code, message: `Necesitas ${error.required} créditos y tienes ${error.available}.` }, required: error.required, available: error.available }, { status: 402, headers: headers() });
    return NextResponse.json({ error: 'El proveedor no pudo completar la optimización estructurada. Inténtalo de nuevo.' }, { status: 502, headers: headers() });
  }
}

