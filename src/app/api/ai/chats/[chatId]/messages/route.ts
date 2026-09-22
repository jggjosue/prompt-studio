import { cacheHeaders } from '@/lib/cache-policy';
import type { ChatMode, MessageRole } from '@/lib/chat-types';
import connectToDatabase from '@/lib/mongoose';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import ChatSession from '@/models/AIGenerationChat';
import ChatMessageModel from '@/models/AIGenerationChatMessage';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const headers = () => cacheHeaders('private-no-store');

export async function GET(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const { chatId } = await params;
  const quota = await rateLimit({ key: `messages-list:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  await connectToDatabase();
  const session = await ChatSession.findOne({ _id: chatId, userId });
  if (!session) return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404, headers: headers() });
  const messages = await ChatMessageModel.find({ chatId }).sort({ createdAt: 1 }).lean().exec();
  return NextResponse.json({ messages }, { headers: headers() });
}

export async function POST(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });
  const { chatId } = await params;
  const quota = await rateLimit({ key: `messages-post:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400, headers: headers() });
  const prompt = typeof raw.prompt === 'string' ? raw.prompt : '';
  if (!prompt.trim()) return NextResponse.json({ error: 'Prompt vacío.' }, { status: 400, headers: headers() });
  const mode = (typeof raw.mode === 'string' && ['image', 'video', 'project'].includes(raw.mode)) ? raw.mode as ChatMode : 'image';
  const role = (typeof raw.role === 'string' && ['user', 'assistant', 'system'].includes(raw.role)) ? raw.role as MessageRole : 'user';
  const chatParams = (typeof raw.params === 'object' && !Array.isArray(raw.params) && raw.params) ? raw.params as Record<string, unknown> : {};
  const result = (typeof raw.result === 'object' && !Array.isArray(raw.result) && raw.result) ? raw.result as Record<string, unknown> : null;
  const status = (typeof raw.status === 'string' && ['pending', 'completed', 'failed'].includes(raw.status)) ? raw.status : 'pending';
  const progress = typeof raw.progress === 'number' ? Math.max(0, Math.min(100, raw.progress)) : 0;
  await connectToDatabase();
  const session = await ChatSession.findOne({ _id: chatId, userId });
  if (!session) return NextResponse.json({ error: 'Conversación no encontrada.' }, { status: 404, headers: headers() });
  const message = await ChatMessageModel.create({
    chatId, role, mode, prompt, params: chatParams,
    result,
    status,
    progress,
  });
  await ChatSession.findByIdAndUpdate(chatId, { title: prompt.slice(0, 80) || session.title, mode, updatedAt: new Date() });
  return NextResponse.json({ message }, { status: 201, headers: headers() });
}
