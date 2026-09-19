import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import ChatSession from '@/models/AIGenerationChat';
import type { ChatMode } from '@/lib/chat-types';

const headers = () => cacheHeaders('private-no-store');
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `chats-list:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  await connectToDatabase();
  const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 }).lean().exec();
  return NextResponse.json({ chats: sessions }, { headers: headers() });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `chats-create:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || typeof raw.title !== 'string') return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400, headers: headers() });
  const title = clean(raw.title, 120) || 'Nueva conversación';
  const mode = (typeof raw.mode === 'string' && ['image', 'video', 'project'].includes(raw.mode)) ? raw.mode as ChatMode : 'image';
  await connectToDatabase();
  const session = await ChatSession.create({ userId, title, mode });
  return NextResponse.json({ chat: session }, { status: 201, headers: headers() });
}
